import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-meeting-section',
  standalone: true,
  template: `
    <section class="meeting-section" id="reunion" aria-labelledby="meeting-title">
      <div class="meeting-wrap">
        <p class="eyebrow reveal">ESTA SEMANA</p>
        <h2 id="meeting-title" class="reveal">¿DONDE NOS<br>VEMOS ESTA VEZ?</h2>
        <div class="meeting-grid reveal">
          <div class="meeting-main">
            <small>CONVOCATORIA VIGENTE</small>
            <strong>{{ meetingTitle }}</strong>
            <p>{{ meetingDescription }}</p>
          </div>
          <div class="meeting-meta">
            <div><span>MODALIDAD</span><strong>{{ meetingStatus }}</strong></div>
            <div><span>HORARIO</span><strong>{{ meetingSchedule }}</strong></div>
          </div>
          <div class="meeting-actions">
            <a class="button button-dark" [href]="facebookUrl" target="_blank" rel="noopener">Ver ultima convocatoria ↗</a>
            <a class="text-link" [href]="nearestUrl" target="_blank" rel="noopener">Preguntar por la mas cercana ↗</a>
            @if (meetingOnlineUrl) {
              <a class="text-link" [href]="meetingOnlineUrl" target="_blank" rel="noopener">{{ meetingOnlineLabel || 'Entrar a la transmision' }} ↗</a>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class MeetingSectionComponent {
  @Input() meetingTitle = '';
  @Input() meetingDescription = '';
  @Input() meetingStatus = '';
  @Input() meetingSchedule = '';
  @Input() facebookUrl = '';
  @Input() nearestUrl = '';
  @Input() meetingOnlineUrl = '';
  @Input() meetingOnlineLabel = '';
}
