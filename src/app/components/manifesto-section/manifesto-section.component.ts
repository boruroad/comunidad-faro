import { Component } from '@angular/core';

@Component({
  selector: 'app-manifesto-section',
  standalone: true,
  template: `
    <section class="manifesto section-dark" id="identidad" aria-labelledby="identity-title">
      <div class="manifesto-intro reveal">
        <p class="eyebrow">NUESTRO NOMBRE</p>
        <h2 id="identity-title">
          <span class="value-row"><b>F</b><em>e.</em></span>
          <span class="value-row"><b>A</b><em>mor.</em></span>
          <span class="value-row"><b>R</b><em>elevancia.</em></span>
          <span class="value-row"><b>O</b><em>bediencia.</em></span>
        </h2>
      </div>
      <div class="manifesto-copy reveal">
        <p class="serif-lead">Fe. Amor. Relevancia. Obediencia. No son un pie de pagina: forman nuestro nombre.</p>
        <p class="quiet-copy">La forma de reunirnos puede cambiar. El punto puede cambiar. La identidad permanece.</p>
      </div>
    </section>
  `
})
export class ManifestoSectionComponent {}
