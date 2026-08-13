import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CalendarEvent, FARO_CONFIG, FaroConfig } from './faro-config';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  readonly cfg: FaroConfig = FARO_CONFIG;
  readonly year = new Date().getFullYear();
  readonly meeting = this.cfg.meeting;
  readonly live = this.cfg.live;
  readonly releases = this.cfg.music.releases;
  readonly firstVisit = this.cfg.firstVisit;
  readonly newsletterTag = this.cfg.newsletter.tag;
  readonly calendar = this.cfg.calendar;

  readonly onlineUrl = this.meeting.onlineUrl.trim();
  readonly nearestUrl = this.meeting.nearestUrl || this.meeting.facebookUrl || this.cfg.socials['facebook'];
  readonly facebookUrl = this.meeting.facebookUrl || this.cfg.socials['facebook'];
  readonly socialEntries = Object.entries(this.cfg.socials || {}).filter(([, url]) => Boolean(url));
  readonly newsletterAction = this.computeNewsletterAction();
  readonly isMusicEnabled = this.cfg.music.enabled && this.releases.length > 0;
  readonly isCalendarEnabled = this.calendar.enabled && this.calendar.events.length > 0;
  readonly isLiveActive = this.computeLiveActive();
  readonly liveStreamUrl = (this.live.url || this.onlineUrl).trim();
  readonly safeEmbedUrl: SafeResourceUrl | null;

  readonly heroTitleTop: string;
  readonly heroTitleAccent: string;
  readonly heroLine: string;
  readonly footerTitleTop: string;
  readonly footerTitleAccent: string;

  expandedReleaseIndex: number | null = null;
  menuOpen = false;
  headerScrolled = false;
  newsletterStatus = '';
  newsletterWarning = false;

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

    this.initRevealAnimation();
    this.writeSchema();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
    this.revealObserver?.disconnect();
    this.doc.body.classList.remove('is-live');
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleRelease(index: number): void {
    this.expandedReleaseIndex = this.expandedReleaseIndex === index ? null : index;
  }

  isReleaseExpanded(index: number): boolean {
    return this.expandedReleaseIndex === index;
  }

  onNewsletterSubmit(event: Event): void {
    if (!this.newsletterAction) {
      event.preventDefault();
      this.newsletterStatus = 'El formulario ya esta disenado; falta conectar el servicio de newsletter en la configuracion.';
      this.newsletterWarning = true;
      return;
    }

    this.newsletterStatus = 'Te estamos llevando a confirmar tu suscripcion...';
    this.newsletterWarning = false;
  }

  photoStyle(path: string): string | null {
    return path ? `url("${path}")` : null;
  }

  socialLabel(name: string): string {
    return `${name.charAt(0).toUpperCase() + name.slice(1)} ↗`;
  }

  hasCoverImage(path: string): boolean {
    return Boolean(path);
  }

  coverAriaLabel(title: string, artist: string): string {
    return `Portada de ${title || 'la canción'}${artist ? `, de ${artist}` : ''}`;
  }

  formatCalendarDate(date: string): string {
    const parsedDate = Date.parse(date);
    if (Number.isNaN(parsedDate)) {
      return date;
    }

    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).format(parsedDate).replace('.', '').toUpperCase();
  }

  hasCalendarCta(event: CalendarEvent): boolean {
    return Boolean((event.ctaLabel || '').trim() && (event.ctaUrl || '').trim());
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

  private computeLiveActive(): boolean {
    const now = Date.now();
    const start = this.live.startsAt ? Date.parse(this.live.startsAt) : NaN;
    const end = this.live.endsAt ? Date.parse(this.live.endsAt) : NaN;
    const scheduledLive = Number.isFinite(start) && Number.isFinite(end) && now >= start && now <= end;
    return Boolean(this.live.enabled || scheduledLive);
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
