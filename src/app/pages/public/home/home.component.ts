import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { FaroConfig } from '../../../faro-config';
import { CalendarSectionComponent } from '../../../components/calendar-section.component';
import { FirstVisitSectionComponent } from '../../../components/first-visit-section.component';
import { HeroSectionComponent } from '../../../components/hero-section.component';
import { LiveTakeoverComponent } from '../../../components/live-takeover.component';
import { MeetingSectionComponent } from '../../../components/meeting-section.component';
import { MusicSectionComponent } from '../../../components/music-section.component';
import { NewsletterSectionComponent } from '../../../components/newsletter-section.component';
import { SocialSectionComponent } from '../../../components/social-section.component';
import { SiteFooterComponent } from '../../../components/site-footer.component';
import { SiteHeaderComponent } from '../../../components/site-header.component';
import { RuntimeConfigService } from '../../../config/runtime-config.service';
import { toPhotoBackground } from '../../../shared/presentation.utils';

interface FaroApiEvent {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  description: string;
  live: boolean;
  featured: boolean;
}

interface FaroApiLiveBase {
  title: string;
  start: string;
  end: string;
}

interface FaroApiCurrentLive extends FaroApiLiveBase {
  description: string;
  url: string;
}

interface FaroApiResponse {
  ok: boolean;
  timeZone: string;

  control?: {
    mode: 'AUTO' | 'ON' | 'OFF';
  };

  content?: {
    alert?: string;
    featuredMessage?: string;
  };

  live: {
    active: boolean;
    current: FaroApiCurrentLive | null;
    next: FaroApiLiveBase | null;
  };

  events: FaroApiEvent[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    LiveTakeoverComponent,
    HeroSectionComponent,
    MusicSectionComponent,
    MeetingSectionComponent,
    NewsletterSectionComponent,
    SocialSectionComponent,
    FirstVisitSectionComponent,
    CalendarSectionComponent,
    SiteFooterComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly runtimeConfig =
    inject(RuntimeConfigService);

  readonly cfg: FaroConfig =
    this.runtimeConfig.config;

  readonly year = new Date().getFullYear();

  readonly meeting = this.cfg.meeting;
  readonly live = this.cfg.live;
  readonly releases = this.cfg.music.releases;
  readonly firstVisit = this.cfg.firstVisit;
  readonly newsletterTag = this.cfg.newsletter.tag;
  readonly calendar = this.cfg.calendar;

  readonly isStaticCalendarEnabled =
    this.calendar.enabled &&
    this.calendar.events.length > 0;

  readonly onlineUrl = this.meeting.onlineUrl.trim();

  readonly nearestUrl =
    this.meeting.nearestUrl ||
    this.meeting.facebookUrl ||
    this.cfg.socials['facebook'];

  readonly facebookUrl =
    this.meeting.facebookUrl ||
    this.cfg.socials['facebook'];

  readonly socialEntries =
    Object.entries(this.cfg.socials || {})
      .filter(([, url]) => Boolean(url));

  readonly newsletterAction =
    this.computeNewsletterAction();

  readonly isMusicEnabled =
    this.cfg.music.enabled &&
    this.releases.length > 0;

  readonly now =
    signal(Date.now());

  readonly apiData =
    signal<FaroApiResponse | null>(null);

  readonly apiLoading =
    signal(false);

  readonly apiError =
    signal(false);

  readonly endedUntil =
    signal(0);

  readonly apiCurrentLive =
    computed(() =>
      this.apiData()?.live.current ?? null
    );

  readonly apiNextLive =
    computed(() =>
      this.apiData()?.live.next ?? null
    );

  readonly alertMessage =
    computed(() =>
      this.apiData()
        ?.content
        ?.alert
        ?.trim() || ''
    );

  readonly featuredMessage =
    computed(() =>
      this.apiData()
        ?.content
        ?.featuredMessage
        ?.trim() || ''
    );

  readonly calendarEvents =
    computed(() => {
      const currentTime =
        this.now();

      return (this.apiData()?.events ?? [])
        .filter(event => {
          const end =
            Date.parse(event.end);

          return (
            Number.isFinite(end) &&
            end >= currentTime
          );
        })
        .slice(0, 8);
    });

  readonly isCalendarEnabled =
    computed(() =>
      this.calendar.enabled &&
      this.calendarEvents().length > 0
    );

  readonly nextPublicEvent =
    computed(() =>
      this.calendarEvents()[0] ?? null
    );

  readonly manualLiveActive =
    computed(() => {
      const now =
        this.now();

      const start =
        this.live.startsAt
          ? Date.parse(this.live.startsAt)
          : Number.NaN;

      const end =
        this.live.endsAt
          ? Date.parse(this.live.endsAt)
          : Number.NaN;

      const scheduledLive =
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        now >= start &&
        now <= end;

      return Boolean(
        this.live.enabled ||
        scheduledLive
      );
    });

  readonly isLiveActive =
    computed(() =>
      Boolean(
        this.apiData()?.live.active ||
        this.manualLiveActive()
      )
    );

  readonly liveStreamUrl =
    computed(() => {
      const apiUrl =
        this.apiCurrentLive()?.url?.trim() || '';

      if (apiUrl) {
        return apiUrl;
      }

      if (this.manualLiveActive()) {
        return (
          this.live.url ||
          this.onlineUrl
        ).trim();
      }

      return '';
    });

  readonly liveDescription =
    computed(() =>
      this.apiCurrentLive()?.description?.trim() ||
      this.live.description ||
      'Conéctate desde donde estés.'
    );

  readonly safeEmbedUrl =
    computed<SafeResourceUrl | null>(() => {
      if (!this.live.embedUrl) {
        return null;
      }

      return this.sanitizer
        .bypassSecurityTrustResourceUrl(
          this.live.embedUrl
        );
    });

  readonly liveState =
    computed<
      'normal' |
      'today' |
      'soon' |
      'live' |
      'ended'
    >(() => {
      if (this.isLiveActive()) {
        return 'live';
      }

      if (this.now() < this.endedUntil()) {
        return 'ended';
      }

      const nextLive =
        this.apiNextLive();

      const startValue =
        nextLive?.start ||
        this.live.startsAt;

      if (!startValue) {
        return 'normal';
      }

      const start =
        Date.parse(startValue);

      if (!Number.isFinite(start)) {
        return 'normal';
      }

      const difference =
        start - this.now();

      const minutes =
        difference / 1000 / 60;

      const today =
        new Date(this.now()).toDateString() ===
        new Date(start).toDateString();

      if (
        minutes > 0 &&
        minutes <= 30
      ) {
        return 'soon';
      }

      if (
        today &&
        difference > 0
      ) {
        return 'today';
      }

      return 'normal';
    });

  readonly heroTitleTop =
    computed(() => {
      switch (this.liveState()) {
        case 'today':
          return 'HOY NOS';

        case 'soon':
          return 'YA CASI.';

        case 'live':
          return 'UNA FAMILIA.';

        case 'ended':
          return 'LA CASA';

        default:
          return 'NOS VEMOS';
      }
    });

  readonly heroTitleAccent =
    computed(() => {
      switch (this.liveState()) {
        case 'today':
          return 'VEMOS.';

        case 'soon':
          return 'COMENZAMOS.';

        case 'live':
          return 'MUCHAS TRIBUS.';

        case 'ended':
          return 'CONTINÚA.';

        default:
          return 'EN CASA.';
      }
    });

  readonly heroLine =
    computed(() => {
      switch (this.liveState()) {
        case 'today':
          return 'Hoy celebramos al Rey en familia.';

        case 'soon':
          return 'Estamos por comenzar.';

        case 'live':
          return 'Fe · Amor · Relevancia · Obediencia.';

        case 'ended':
          return 'La reunión termina. La Casa continúa.';

        default:
          return 'Una familia, muchas tribus.';
      }
    });

  readonly footerTitleTop =
    computed(() =>
      this.isLiveActive()
        ? 'NOS VEMOS'
        : 'UNA FAMILIA.'
    );

  readonly footerTitleAccent =
    computed(() =>
      this.isLiveActive()
        ? 'EN CASA.'
        : 'MUCHAS TRIBUS.'
    );

  readonly meetingTitle =
    computed(() =>
      this.nextPublicEvent()?.title ||
      this.meeting.title
    );

  readonly meetingDescription =
    computed(() =>
      this.nextPublicEvent()?.description ||
      this.meeting.description
    );

  readonly meetingStatus =
    computed(() => {
      const event =
        this.nextPublicEvent();

      if (!event) {
        return this.meeting.status;
      }

      return (
        event.location?.trim() ||
        'CONFIRMAR EN REDES'
      );
    });

  readonly meetingSchedule =
    computed(() => {
      const event =
        this.nextPublicEvent();

      return event
        ? this.formatEventSchedule(event)
        : this.meeting.schedule;
    });

  readonly meetingOnlineUrl =
    computed(() =>
      this.isLiveActive()
        ? this.liveStreamUrl()
        : ''
    );

  menuOpen = false;
  headerScrolled = false;

  private revealObserver?: IntersectionObserver;
  private clockTimer?: number;
  private apiRequest?: Subscription;
  private wasApiLive = false;

  private readonly doc =
    inject(DOCUMENT);

  private readonly sanitizer =
    inject(DomSanitizer);

  private readonly http =
    inject(HttpClient);

  private readonly onWindowScroll =
    () => {
      this.headerScrolled =
        window.scrollY > 40;
    };

  constructor() {
    effect(() => {
      this.doc.body.classList.toggle(
        'is-live',
        this.isLiveActive()
      );
    });
  }

  ngAfterViewInit(): void {
    this.onWindowScroll();

    window.addEventListener(
      'scroll',
      this.onWindowScroll,
      { passive: true }
    );

    this.loadFaroApi();

    const refreshMs =
      Math.max(
        15000,
        this.cfg.api.refreshMs || 30000
      );

    this.clockTimer =
      window.setInterval(() => {
        this.now.set(Date.now());
        this.loadFaroApi();
      }, refreshMs);

    this.initRevealAnimation();
    this.writeSchema();
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'scroll',
      this.onWindowScroll
    );

    if (this.clockTimer) {
      window.clearInterval(
        this.clockTimer
      );
    }

    this.apiRequest?.unsubscribe();
    this.revealObserver?.disconnect();

    this.doc.body.classList.remove(
      'is-live'
    );
  }

  private loadFaroApi(): void {
    if (
      !this.cfg.api.enabled ||
      !this.cfg.api.url
    ) {
      return;
    }

    this.apiLoading.set(true);

    this.apiRequest?.unsubscribe();

    this.apiRequest =
      this.http
        .jsonp<FaroApiResponse>(
          this.cfg.api.url,
          'callback'
        )
        .subscribe({
          next: response => {
            const isLiveNow =
              Boolean(
                response?.ok &&
                response.live?.active
              );

            if (
              this.wasApiLive &&
              !isLiveNow
            ) {
              this.endedUntil.set(
                Date.now() +
                (60 * 60 * 1000)
              );
            }

            this.wasApiLive =
              isLiveNow;

            if (
              response?.ok
            ) {
              this.apiData.set(
                response
              );

              this.apiError.set(
                false
              );
            } else {
              this.apiError.set(
                true
              );
            }

            this.now.set(
              Date.now()
            );

            this.apiLoading.set(
              false
            );
          },

          error: error => {
            console.error(
              'No se pudo consultar FARO Web API.',
              error
            );

            this.apiError.set(
              true
            );

            this.apiLoading.set(
              false
            );
          }
        });
  }

  toggleMenu(): void {
    this.menuOpen =
      !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen =
      false;
  }

  photoStyle(
    path: string
  ): string | null {
    return toPhotoBackground(path);
  }

  formatCalendarTime(
    event: FaroApiEvent
  ): string {
    if (event.allDay) {
      return 'TODO EL DÍA';
    }

    const start =
      Date.parse(event.start);

    const end =
      Date.parse(event.end);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end)
    ) {
      return '';
    }

    const formatter =
      new Intl.DateTimeFormat(
        'es-MX',
        {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Mexico_City'
        }
      );

    return (
      `${formatter.format(start)} – ` +
      `${formatter.format(end)}`
    );
  }

  private formatEventSchedule(
    event: FaroApiEvent
  ): string {
    const start =
      Date.parse(event.start);

    if (
      !Number.isFinite(start)
    ) {
      return this.meeting.schedule;
    }

    const date =
      new Intl.DateTimeFormat(
        'es-MX',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          timeZone: 'America/Mexico_City'
        }
      ).format(start);

    return (
      `${date} · ` +
      this.formatCalendarTime(event)
    ).toUpperCase();
  }

  private computeNewsletterAction(): string {
    const action =
      (
        this.cfg.newsletter.actionUrl ||
        ''
      ).trim();

    if (action) {
      return action;
    }

    const username =
      (
        this.cfg.newsletter
          .buttondownUsername ||
        ''
      ).trim();

    if (!username) {
      return '';
    }

    return (
      'https://buttondown.com/api/emails/embed-subscribe/' +
      encodeURIComponent(username)
    );
  }

  private initRevealAnimation(): void {
    if (
      window
        .matchMedia(
          '(prefers-reduced-motion: reduce)'
        )
        .matches
    ) {
      this.doc
        .querySelectorAll('.reveal')
        .forEach(
          el =>
            el.classList.add('in')
        );

      return;
    }

    this.revealObserver =
      new IntersectionObserver(
        entries => {
          entries.forEach(
            entry => {
              if (
                entry.isIntersecting
              ) {
                entry.target
                  .classList.add('in');

                this.revealObserver
                  ?.unobserve(
                    entry.target
                  );
              }
            }
          );
        },
        {
          threshold: 0.1
        }
      );

    this.doc
      .querySelectorAll('.reveal')
      .forEach(
        el =>
          this.revealObserver
            ?.observe(el)
      );
  }

  private writeSchema(): void {
    const schemaNode =
      this.doc.getElementById(
        'schema-org'
      );

    if (!schemaNode) {
      return;
    }

    const schema = {
      '@context':
        'https://schema.org',

      '@type':
        'Church',

      name:
        this.cfg.site.name,

      url:
        this.cfg.site.canonicalUrl,

      description:
        this.cfg.site.description,

      sameAs:
        Object.values(
          this.cfg.socials || {}
        ).filter(Boolean)
    };

    schemaNode.textContent =
      JSON.stringify(schema);
  }
}
