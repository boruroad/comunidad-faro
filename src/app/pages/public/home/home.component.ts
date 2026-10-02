import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  Clip,
  FaroConfig,
  LiveBroadcast
} from '../../../faro-config';
import { RuntimeConfigService } from '../../../config/runtime-config.service';

import { AlertBannerComponent } from '../../../components/alert-banner/alert-banner.component';
import { CalendarSectionComponent } from '../../../components/calendar-section/calendar-section.component';
import { FirstVisitSectionComponent } from '../../../components/first-visit-section/first-visit-section.component';
import { HeroSectionComponent } from '../../../components/hero-section/hero-section.component';
import { KingdomSectionComponent } from '../../../components/kingdom-section/kingdom-section.component';
import { LiveTakeoverComponent } from '../../../components/live-takeover/live-takeover.component';
import { ManifestoSectionComponent } from '../../../components/manifesto-section/manifesto-section.component';
import { MeetingSectionComponent } from '../../../components/meeting-section/meeting-section.component';
import { MomentsSectionComponent } from '../../../components/moments-section/moments-section.component';
import { MusicSectionComponent } from '../../../components/music-section/music-section.component';
import { NewsletterSectionComponent } from '../../../components/newsletter-section/newsletter-section.component';
import { SermonsSectionComponent } from '../../../components/sermons-section/sermons-section.component';
import { SiteFooterComponent } from '../../../components/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../../components/site-header/site-header.component';
import { SocialSectionComponent } from '../../../components/social-section/social-section.component';
import { VoiceStripComponent } from '../../../components/voice-strip/voice-strip.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AlertBannerComponent,
    CalendarSectionComponent,
    FirstVisitSectionComponent,
    HeroSectionComponent,
    KingdomSectionComponent,
    LiveTakeoverComponent,
    ManifestoSectionComponent,
    MeetingSectionComponent,
    MomentsSectionComponent,
    MusicSectionComponent,
    NewsletterSectionComponent,
    SermonsSectionComponent,
    SiteFooterComponent,
    SiteHeaderComponent,
    SocialSectionComponent,
    VoiceStripComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly runtimeConfig = inject(RuntimeConfigService);
  readonly cfg: FaroConfig = this.runtimeConfig.config;
  readonly live: LiveBroadcast = this.cfg.live;
  readonly releases = this.cfg.music.releases;
  readonly firstVisit = this.cfg.firstVisit;
  readonly newsletterTag = this.cfg.newsletter.tag;
  readonly calendar = this.cfg.calendar;
  readonly moments = this.cfg.moments;

  readonly meeting = this.cfg.meeting;
  readonly onlineUrl = this.meeting.onlineUrl.trim();
  readonly nearestUrl = this.meeting.nearestUrl || this.meeting.facebookUrl || this.cfg.socials['facebook'];
  readonly facebookUrl = this.meeting.facebookUrl || this.cfg.socials['facebook'];
  readonly socialEntries = Object.entries(this.cfg.socials || {}).filter(([, url]) => Boolean(url));
  readonly newsletterAction = this.computeNewsletterAction();
  readonly isMusicEnabled = this.cfg.music.enabled && this.releases.length > 0;
  readonly artistSpotifyUrl = this.cfg.music.artistSpotifyUrl;
  readonly isCalendarEnabled = this.calendar.enabled && this.calendar.events.length > 0;

  faroControlLiveMode: 'AUTO' | 'ON' | 'OFF' = 'AUTO';
  liveStreamUrl = (this.live.url || this.onlineUrl).trim();
  liveMessage = '';
  featuredMessage = '';
  alertMessage = '';
  readonly safeEmbedUrl: SafeResourceUrl | null;

  readonly calendarEmbedUrl = 'https://calendar.google.com/calendar/embed?src=0266b1310dc0d1d71d45b12ce92aa075141e7f18bf3a3b224f375f3d508cdcf5%40group.calendar.google.com&ctz=America%2FMexico_City';
  readonly calendarIcalUrl = 'https://calendar.google.com/calendar/ical/0266b1310dc0d1d71d45b12ce92aa075141e7f18bf3a3b224f375f3d508cdcf5%40group.calendar.google.com/public/basic.ics';

  // Sección Prédicas / Mensajes de Casa
  readonly sermonsConfig = this.cfg.sermons;
  readonly isSermonsEnabled = Boolean(this.sermonsConfig?.enabled && this.sermonsConfig?.featured);
  readonly year = new Date().getFullYear();

  // Sección Reels y Clips de Casa (se reenvía tal cual a app-sermons-section)
  readonly clips: Clip[] = this.cfg.clips?.items ?? [];

  get liveState(): 'PRE_LIVE' | 'LIVE' | 'POST_LIVE' | 'NORMAL' {
    if (this.faroControlLiveMode === 'ON') {
      return 'LIVE';
    }
    if (this.faroControlLiveMode === 'OFF') {
      return 'NORMAL';
    }

    const now = Date.now();
    const start = this.live.startsAt ? Date.parse(this.live.startsAt) : NaN;
    const end = this.live.endsAt ? Date.parse(this.live.endsAt) : NaN;

    if (Number.isFinite(start) && Number.isFinite(end)) {
      const preLiveWindow = start - 45 * 60 * 1000;
      const postLiveWindow = end + 2 * 60 * 60 * 1000;

      if (now >= preLiveWindow && now < start) {
        return 'PRE_LIVE';
      }
      if (now >= start && now <= end) {
        return 'LIVE';
      }
      if (now > end && now <= postLiveWindow) {
        return 'POST_LIVE';
      }
    }

    return this.live.enabled ? 'LIVE' : 'NORMAL';
  }

  get isLiveActive(): boolean {
    return this.liveState !== 'NORMAL';
  }

  get liveKickerText(): string {
    switch (this.liveState) {
      case 'PRE_LIVE': return 'TRANSMISIÓN POR COMENZAR';
      case 'LIVE': return this.live.label || 'TRANSMISIÓN EN VIVO';
      case 'POST_LIVE': return 'TRANSMISIÓN FINALIZADA';
      default: return 'TRANSMISIÓN EN VIVO';
    }
  }

  get liveTitleTopText(): string {
    switch (this.liveState) {
      case 'PRE_LIVE': return 'ESTAMOS';
      case 'LIVE': return this.live.titleTop || 'ESTAMOS';
      case 'POST_LIVE': return 'LA REUNIÓN';
      default: return 'ESTAMOS';
    }
  }

  get liveTitleAccentText(): string {
    switch (this.liveState) {
      case 'PRE_LIVE': return 'POR COMENZAR.';
      case 'LIVE': return this.live.titleAccent || 'EN VIVO.';
      case 'POST_LIVE': return 'HA TERMINADO.';
      default: return 'EN VIVO.';
    }
  }

  get liveDescriptionText(): string {
    if (this.liveMessage && this.liveMessage !== this.live.description) {
      return this.liveMessage;
    }
    switch (this.liveState) {
      case 'PRE_LIVE':
        return 'La Casa se está preparando para transmitir. En unos minutos iniciamos.';
      case 'LIVE':
        return this.live.description || 'La Casa está transmitiendo. Entra desde donde estés.';
      case 'POST_LIVE':
        return 'Gracias por acompañarnos hoy en Casa FARO. Nos vemos la próxima semana.';
      default:
        return this.live.description;
    }
  }

  get liveButtonLabelText(): string {
    switch (this.liveState) {
      case 'PRE_LIVE': return 'Esperar en la transmisión';
      case 'LIVE': return this.live.buttonLabel || 'Entrar a la transmisión';
      case 'POST_LIVE': return 'Ver última reunión';
      default: return 'Entrar a la transmisión';
    }
  }

  get liveTickerText(): string {
    if (this.featuredMessage) {
      return this.featuredMessage;
    }
    switch (this.liveState) {
      case 'PRE_LIVE': return 'ESTAMOS POR COMENZAR · LA CASA SE PREPARA · ENTRA EN BREVE';
      case 'LIVE': return 'TRANSMISIÓN ACTIVA · ENTRA AHORA · EN VIVO';
      case 'POST_LIVE': return 'REUNIÓN CONCLUIDA · GRACIAS POR ACOMPAÑARNOS · NOS VEMOS EN CASA';
      default: return 'TRANSMISIÓN ACTIVA · ENTRA AHORA';
    }
  }

  readonly heroTitleTop: string;
  readonly heroTitleAccent: string;
  readonly heroLine: string;
  readonly footerTitleTop: string;
  readonly footerTitleAccent: string;

  menuOpen = false;
  headerScrolled = false;

  private revealObserver?: IntersectionObserver;
  private readonly doc = inject(DOCUMENT);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly onWindowScroll = () => {
    this.headerScrolled = window.scrollY > 40;
  };

  constructor() {
    this.safeEmbedUrl = this.live.embedUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.live.embedUrl)
      : null;

    if (this.isLiveActive) {
      this.heroTitleTop = 'UNA FAMILIA.';
      this.heroTitleAccent = 'MUCHAS TRIBUS.';
      this.heroLine = 'Fe · Amor · Relevancia · Obediencia.';
      this.footerTitleTop = 'NOS VEMOS';
      this.footerTitleAccent = 'EN CASA.';
    } else {
      this.heroTitleTop = 'NOS VEMOS';
      this.heroTitleAccent = 'EN CASA.';
      this.heroLine = 'Una familia, muchas tribus.';
      this.footerTitleTop = 'UNA FAMILIA.';
      this.footerTitleAccent = 'MUCHAS TRIBUS.';
    }
  }

  ngAfterViewInit(): void {
    this.onWindowScroll();
    window.addEventListener('scroll', this.onWindowScroll, { passive: true });

    if (this.isLiveActive) {
      this.doc.body.classList.add('is-live');
    }

    this.loadFaroControl();
    this.initRevealAnimation();
    this.writeSchema();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
    this.revealObserver?.disconnect();
    this.doc.body.classList.remove('is-live');
  }

  private loadFaroControl(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const callbackName = 'handleFaroControl_' + Math.floor(Math.random() * 1000000);
    const win = window as unknown as Record<string, unknown>;

    win[callbackName] = (data: { table?: { rows?: Array<{ c?: Array<{ v?: string } | null> }> } }) => {
      try {
        const rows = data?.table?.rows || [];
        const params: Record<string, string> = {};
        for (const row of rows) {
          const key = row.c?.[0]?.v?.toString().trim();
          const val = row.c?.[1]?.v?.toString().trim() || '';
          if (key) {
            params[key] = val;
          }
        }

        const mode = (params['LIVE_MODE'] || 'AUTO').toUpperCase() as 'AUTO' | 'ON' | 'OFF';
        this.faroControlLiveMode = mode;
        if (this.isLiveActive) {
          this.doc.body.classList.add('is-live');
        } else {
          this.doc.body.classList.remove('is-live');
        }

        if (params['LIVE_URL']) {
          this.liveStreamUrl = params['LIVE_URL'];
        }
        if (params['LIVE_MESSAGE']) {
          this.liveMessage = params['LIVE_MESSAGE'];
        }
        if (params['FEATURED_MESSAGE']) {
          this.featuredMessage = params['FEATURED_MESSAGE'];
        }
        if (params['ALERT']) {
          this.alertMessage = params['ALERT'];
        }
      } catch (err) {
        console.warn('Error procesando FARO CONTROL:', err);
      } finally {
        delete win[callbackName];
        script.remove();
      }
    };

    const script = this.doc.createElement('script');
    script.src = `https://docs.google.com/spreadsheets/d/1wNYuLLacrld7Yb3Ur6gerOP4STXofIcqTF8hEAq3Ugo/gviz/tq?tqx=responseHandler:${callbackName}`;
    script.async = true;
    script.onerror = () => {
      delete win[callbackName];
      script.remove();
    };
    this.doc.head.appendChild(script);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  private computeNewsletterAction(): string {
    const action = (this.cfg.newsletter.actionUrl || '').trim();
    if (action) {
      return action;
    }

    const username = (this.cfg.newsletter.buttondownUsername || '').trim();
    if (!username) {
      return '';
    }

    return `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(username)}`;
  }

  private initRevealAnimation(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.doc.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
      return;
    }

    this.revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          this.revealObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    this.doc.querySelectorAll('.reveal').forEach(el => this.revealObserver?.observe(el));
  }

  private writeSchema(): void {
    const schemaNode = this.doc.getElementById('schema-org');
    if (!schemaNode) {
      return;
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Church',
      name: this.cfg.site.name,
      url: this.cfg.site.canonicalUrl,
      description: this.cfg.site.description,
      sameAs: Object.values(this.cfg.socials || {}).filter(Boolean)
    };

    schemaNode.textContent = JSON.stringify(schema);
  }
}
