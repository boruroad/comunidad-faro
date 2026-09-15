import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { LiveConfig } from '../faro-config';

@Component({
  selector: 'app-live-takeover',
  standalone: true,
  template: `
    @if (isLiveActive) {
      <section class="live-takeover" id="en-vivo" aria-labelledby="live-title">
        <div class="live-broadcast-bar" aria-hidden="true">
          <div class="live-broadcast-track">
            <span>● TRANSMISION ACTIVA</span><span>ENTRA AHORA</span><span>● TRANSMISION ACTIVA</span><span>ENTRA AHORA</span><span>● TRANSMISION ACTIVA</span><span>ENTRA AHORA</span>
          </div>
        </div>

        <div class="live-grid">
          <div class="live-copy">
            <p class="live-kicker">
              <span class="live-dot" aria-hidden="true"></span>
              <span>{{ live.label || 'TRANSMISION EN VIVO' }}</span>
            </p>

            <h1 id="live-title">
              <span>{{ live.titleTop || 'ESTAMOS' }}</span><br>
              <em>{{ live.titleAccent || 'EN VIVO.' }}</em>
            </h1>

            <p class="live-description">{{ liveDescription }}</p>

            @if (alertMessage) {
              <div class="live-alert" role="status" aria-live="polite">
                <strong>AVISO</strong>
                <span>{{ alertMessage }}</span>
              </div>
            }

            <div class="live-actions">
              @if (liveStreamUrl) {
                <a class="live-primary" [href]="liveStreamUrl" target="_blank" rel="noopener">
                  <span class="live-primary-dot" aria-hidden="true"></span>
                  <span>{{ live.buttonLabel || 'Entrar a la transmision' }}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              }

              <a class="live-scroll" href="#inicio">Seguir al sitio ↓</a>
            </div>
          </div>

          @if (safeEmbedUrl) {
            <div class="live-media">
              <iframe
                [src]="safeEmbedUrl"
                title="Transmision en vivo de Comunidad FARO"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          } @else {
            <div class="live-signal-art" aria-hidden="true">
              <div class="signal-ring signal-ring-one"></div>
              <div class="signal-ring signal-ring-two"></div>
              <div class="signal-ring signal-ring-three"></div>

              <div class="signal-core">
                <span></span>
                <strong>ON<br>AIR</strong>
              </div>
            </div>
          }
        </div>

        <div class="live-corner live-corner-a" aria-hidden="true"></div>
        <div class="live-corner live-corner-b" aria-hidden="true"></div>
      </section>
    }

    @if (alertMessage && !isLiveActive) {
      <aside class="site-alert" role="status" aria-live="polite">
        <div class="site-alert-inner">
          <strong>AVISO FARO</strong>
          <p>{{ alertMessage }}</p>
        </div>
      </aside>
    }
  `
})
export class LiveTakeoverComponent {
  @Input({ required: true }) live!: LiveConfig;
  @Input() isLiveActive = false;
  @Input() liveDescription = '';
  @Input() alertMessage = '';
  @Input() liveStreamUrl = '';
  @Input() safeEmbedUrl: SafeResourceUrl | null = null;
}
