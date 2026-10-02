import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { toPhotoBackground } from '../../shared/presentation.utils';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  template: `
    <section class="hero" id="inicio" aria-labelledby="hero-title">
      <!-- Carrusel de fotos de inicio con transición cinematográfica -->
      <div class="hero-carousel" aria-hidden="true">
        @for (photo of heroPhotos; track photo; let i = $index) {
          <div
            class="hero-slide"
            [class.is-active]="activeHeroIndex === i"
            [style.background-image]="photoStyle(photo)"
          ></div>
        }
      </div>
      <div class="hero-shade"></div>

      <div class="hero-dots" role="tablist" aria-label="Fotografías de inicio">
        @for (photo of heroPhotos; track photo; let i = $index) {
          <button
            type="button"
            class="hero-dot"
            [class.is-active]="activeHeroIndex === i"
            [attr.aria-label]="'Fotografía ' + (i + 1)"
            (click)="setHeroPhoto(i)"
          ></button>
        }
      </div>

      <div class="hero-content reveal">
        <p class="eyebrow">COMUNIDAD F.A.R.O.</p>
        <h1 id="hero-title"><b>{{ heroTitleTop }}</b><br><span>{{ heroTitleAccent }}</span></h1>
        <p class="hero-line">{{ heroLine }}</p>
        <div class="hero-utility">
          <div>
            <small>ESTA SEMANA</small>
            <strong>{{ meetingTitle }}</strong>
          </div>
          <div>
            <small>¿DONDE?</small>
            <strong>{{ meetingStatus }}</strong>
          </div>
          <div class="hero-actions">
            <a class="button button-light" [href]="facebookUrl" target="_blank" rel="noopener">Ver convocatoria</a>
            @if (meetingOnlineUrl) {
              <a class="hero-secondary" [href]="meetingOnlineUrl" target="_blank" rel="noopener">{{ meetingOnlineLabel || 'Entrar a la transmision' }}</a>
            }
          </div>
        </div>
      </div>
      <a class="scroll-cue" href="#casa" aria-label="Continuar hacia Casa FARO">SCROLL <span>↓</span></a>
    </section>
  `
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @Input() heroTitleTop = '';
  @Input() heroTitleAccent = '';
  @Input() heroLine = '';
  @Input() meetingTitle = '';
  @Input() meetingStatus = '';
  @Input() facebookUrl = '';
  @Input() meetingOnlineUrl = '';
  @Input() meetingOnlineLabel = '';

  // Fotos de Hero limpias, modernas, sin cubrebocas ni desgastes
  readonly heroPhotos = [
    'assets/images/faro-identidad-welcome-home-camiseta.webp',
    'assets/images/faro-identidad-camiseta-comunidad-faro.webp',
    'assets/images/faro-detalle-biblia-manos-mateo.webp',
    'assets/images/faro-oracion-joven-tatuado-claroscuro.webp'
  ];
  activeHeroIndex = 0;
  private heroTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startHeroTimer();
  }

  ngOnDestroy(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
  }

  setHeroPhoto(index: number): void {
    this.activeHeroIndex = index;
    this.resetHeroTimer();
  }

  private nextHeroPhoto(): void {
    this.activeHeroIndex = (this.activeHeroIndex + 1) % this.heroPhotos.length;
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

  photoStyle(path: string): string | null {
    return toPhotoBackground(path);
  }
}
