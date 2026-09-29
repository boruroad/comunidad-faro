import { Component, Input } from '@angular/core';
import { toPhotoBackground } from '../../shared/presentation.utils';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  template: `
    <section class="hero" id="inicio" aria-labelledby="hero-title">
      <div
        class="hero-photo photo-slot"
        [style.background-image]="photoStyle(heroPhoto)"
        [class.has-image]="!!heroPhoto"
        aria-hidden="true"
      ></div>
      <div class="hero-shade"></div>
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
            <a class="button button-light" [href]="facebookUrl" target="_blank" rel="noopener">Ver convocatoria ↗</a>
            @if (meetingOnlineUrl) {
              <a class="hero-secondary" [href]="meetingOnlineUrl" target="_blank" rel="noopener">{{ meetingOnlineLabel || 'Entrar a la transmision' }} ↗</a>
            }
          </div>
        </div>
      </div>
      <a class="scroll-cue" href="#casa" aria-label="Continuar hacia Casa FARO">SCROLL <span>↓</span></a>
    </section>
  `
})
export class HeroSectionComponent {
  @Input() heroPhoto = '';
  @Input() heroTitleTop = '';
  @Input() heroTitleAccent = '';
  @Input() heroLine = '';
  @Input() meetingTitle = '';
  @Input() meetingStatus = '';
  @Input() facebookUrl = '';
  @Input() meetingOnlineUrl = '';
  @Input() meetingOnlineLabel = '';

  photoStyle(path: string): string | null {
    return toPhotoBackground(path);
  }
}
