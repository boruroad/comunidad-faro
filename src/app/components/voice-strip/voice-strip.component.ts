import { Component } from '@angular/core';

@Component({
  selector: 'app-voice-strip',
  standalone: true,
  template: `
    <section class="voice-strip" aria-label="Palabras que atraviesan la comunicacion de FARO">
      <div class="voice-track">
        <span>CASA.</span><em>FAMILIA.</em><span>REINO.</span><em>FARO.</em>
      </div>
    </section>
  `
})
export class VoiceStripComponent {}
