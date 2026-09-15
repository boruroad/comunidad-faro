import { Component, Input } from '@angular/core';
import { toPhotoBackground } from '../shared/presentation.utils';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  template: `
    <footer class="site-footer">
      <div
        class="footer-photo photo-slot"
        [style.background-image]="photoStyle(footerPhoto)"
        [class.has-image]="!!footerPhoto"
        aria-hidden="true"
      ></div>
      <div class="footer-main">
        <p class="eyebrow">COMUNIDAD F.A.R.O.</p>
        <h2><b>{{ footerTitleTop }}</b><br><span>{{ footerTitleAccent }}</span></h2>
        <div class="footer-grid">
          <div><strong>Fe · Amor · Relevancia · Obediencia</strong><span>Casa · Familia · Rey · Reino.</span></div>
          <div><a class="button button-light" [href]="facebookUrl" target="_blank" rel="noopener">Ver proxima convocatoria ↗</a></div>
        </div>
      </div>
      <div class="footer-bottom"><span>© {{ year }} Comunidad F.A.R.O.</span><span>#weareFARO</span></div>
    </footer>
  `
})
export class SiteFooterComponent {
  @Input() footerPhoto = '';
  @Input() footerTitleTop = '';
  @Input() footerTitleAccent = '';
  @Input() facebookUrl = '';
  @Input() year = new Date().getFullYear();

  photoStyle(path: string): string | null {
    return toPhotoBackground(path);
  }
}
