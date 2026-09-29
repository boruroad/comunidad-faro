import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  CalendarEvent,
  Clip,
  FARO_CONFIG,
  FaroConfig,
  MusicRelease,
  Sermon
} from './faro-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit, OnDestroy {
  readonly cfg: FaroConfig = FARO_CONFIG;
  readonly releases = this.cfg.music.releases;
  readonly firstVisit = this.cfg.firstVisit;
  readonly newsletterTag = this.cfg.newsletter.tag;
  readonly calendar = this.cfg.calendar;
  readonly moments = this.cfg.moments;

  readonly onlineUrl = this.meeting.onlineUrl.trim();
  readonly nearestUrl = this.meeting.nearestUrl || this.meeting.facebookUrl || this.cfg.socials['facebook'];
  readonly facebookUrl = this.meeting.facebookUrl || this.cfg.socials['facebook'];
  readonly socialEntries = Object.entries(this.cfg.socials || {}).filter(([, url]) => Boolean(url));
  readonly newsletterAction = this.computeNewsletterAction();
  readonly isMusicEnabled = this.cfg.music.enabled && this.releases.length > 0;
  readonly artistSpotifyUrl = this.cfg.music.artistSpotifyUrl;
  readonly releaseSpotifyUrls: (SafeResourceUrl | null)[];
  selectedReleaseIndex = 0;
  readonly isCalendarEnabled = this.calendar.enabled && this.calendar.events.length > 0;

  faroControlLiveMode: 'AUTO' | 'ON' | 'OFF' = 'AUTO';
  liveStreamUrl = (this.live.url || this.onlineUrl).trim();
  liveMessage = '';
  featuredMessage = '';
  alertMessage = '';
  readonly safeEmbedUrl: SafeResourceUrl | null;

  calendarEvents: CalendarEvent[] = [...this.calendar.events];
  readonly calendarEmbedUrl = 'https://calendar.google.com/calendar/embed?src=0266b1310dc0d1d71d45b12ce92aa075141e7f18bf3a3b224f375f3d508cdcf5%40group.calendar.google.com&ctz=America%2FMexico_City';
  readonly calendarIcalUrl = 'https://calendar.google.com/calendar/ical/0266b1310dc0d1d71d45b12ce92aa075141e7f18bf3a3b224f375f3d508cdcf5%40group.calendar.google.com/public/basic.ics';

  // Fotos de Hero limpias, modernas, sin cubrebocas ni desgastes
  readonly heroPhotos = [
    'assets/images/faro-identidad-welcome-home-camiseta.webp',
    'assets/images/faro-identidad-camiseta-comunidad-faro.webp',
    'assets/images/faro-detalle-biblia-manos-mateo.webp',
    'assets/images/faro-oracion-joven-tatuado-claroscuro.webp'
  ];
  activeHeroIndex = 0;
  private heroTimer?: ReturnType<typeof setInterval>;

  // Sección Prédicas / Mensajes de Casa
  readonly sermonsConfig = this.cfg.sermons;
  readonly isSermonsEnabled = Boolean(this.sermonsConfig?.enabled && this.sermonsConfig?.featured);

  get sermonFeatured(): Sermon | undefined {
    return this.sermonsConfig?.featured;
  }

  get sermonList(): Sermon[] {
    return this.sermonsConfig?.list ?? [];
  }

  // Sección Reels y Clips de Casa
  readonly clips: Clip[] = this.cfg.clips?.items ?? [];
  selectedClipSeries = 'TODOS';
  activeClip: Clip | null = null;
  isClipModalOpen = false;

  get clipSeriesList(): string[] {
    const seriesSet = new Set(this.clips.map(c => c.series));
    return ['TODOS', ...Array.from(seriesSet)];
  }

  get filteredClips(): Clip[] {
    if (this.selectedClipSeries === 'TODOS') {
      return this.clips;
    }
    return this.clips.filter(c => c.series === this.selectedClipSeries);
  }

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
    this.releaseSpotifyUrls = this.releases.map(r =>
      r.spotifyTrackId
        ? this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://open.spotify.com/embed/track/${r.spotifyTrackId}?utm_source=generator`
          )
        : null
    );

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

    this.startHeroTimer();
    this.loadFaroControl();
    this.initRevealAnimation();
    this.writeSchema();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
    this.revealObserver?.disconnect();
    this.doc.body.classList.remove('is-live');
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
  }

  setHeroPhoto(index: number): void {
    this.activeHeroIndex = index;
    this.resetHeroTimer();
  }

  nextHeroPhoto(): void {
    this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroPhotos.length;
  }

  prevHeroPhoto(): void {
    this.activeHeroIndex = (this.activeHeroIndex - 1 + this.heroPhotos.length) % this.heroPhotos.length;
  }

  private startHeroTimer(): void {
    this.heroTimer = setInterval(() => {
      this.nextHeroPhoto();
    }, 6500);
  }

  private resetHeroTimer(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
    this.startHeroTimer();
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

  toggleRelease(index: number): void {
    this.expandedReleaseIndex = this.expandedReleaseIndex === index ? null : index;
  }

  isReleaseExpanded(index: number): boolean {
    return this.expandedReleaseIndex === index;
  }

  selectRelease(index: number): void {
    this.selectedReleaseIndex = index;
  }

  nextRelease(): void {
    if (this.releases.length === 0) return;
    this.selectedReleaseIndex = (this.selectedReleaseIndex + 1) % this.releases.length;
  }

  prevRelease(): void {
    if (this.releases.length === 0) return;
    this.selectedReleaseIndex = (this.selectedReleaseIndex - 1 + this.releases.length) % this.releases.length;
  }

  get selectedRelease(): MusicRelease {
    return this.releases[this.selectedReleaseIndex] ?? this.releases[0];
  }

  get selectedSpotifyUrl(): SafeResourceUrl | null {
    return this.releaseSpotifyUrls[this.selectedReleaseIndex] ?? null;
  }

  // Clips controls
  openClip(clip: Clip): void {
    this.activeClip = clip;
    this.isClipModalOpen = true;
  }

  closeClip(): void {
    this.isClipModalOpen = false;
    this.activeClip = null;
  }

  nextClip(): void {
    if (!this.activeClip) return;
    const currentList = this.filteredClips;
    const currentIndex = currentList.findIndex(c => c.id === this.activeClip?.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % currentList.length;
      this.activeClip = currentList[nextIndex];
    }
  }

  prevClip(): void {
    if (!this.activeClip) return;
    const currentList = this.filteredClips;
    const currentIndex = currentList.findIndex(c => c.id === this.activeClip?.id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;
      this.activeClip = currentList[prevIndex];
    }
  }

  filterClips(series: string): void {
    this.selectedClipSeries = series;
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
    return name.charAt(0).toUpperCase() + name.slice(1);
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
