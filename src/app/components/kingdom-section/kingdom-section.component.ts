import { Component } from '@angular/core';

@Component({
  selector: 'app-kingdom-section',
  standalone: true,
  template: `
    <section class="kingdom-section" aria-labelledby="kingdom-title">
      <div class="kingdom-word reveal" aria-hidden="true">REINO</div>
      <div class="kingdom-copy reveal">
        <p class="eyebrow">MAS ALLA DE UNA REUNION</p>
        <h2 id="kingdom-title">CELEBRAMOS<br>AL REY.<br><span>VIVIMOS EL REINO.</span></h2>
        <p class="serif-lead">Casa FARO habla de una Iglesia que forma discipulos, transforma familias y vive su fe tambien fuera de un lugar o un horario.</p>
      </div>
    </section>
  `
})
export class KingdomSectionComponent {}
