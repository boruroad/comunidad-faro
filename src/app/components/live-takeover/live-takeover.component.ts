import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-live-takeover',
  standalone: true,
  template: `
    @if (isLiveActive) {
      <section class="live-takeover" id="en-vivo" aria-labelledby="live-title">
        <div class="live-broadcast-bar" aria-hidden="true">
          <div class="live-broadcast-track">
            <span>● {{ liveTickerText }}</span><span>{{ liveButtonLabelText }}</span><span>● {{ liveTickerText }}</span><span>{{ liveButtonLabelText }}</span><span>● {{ liveTickerText }}</span><span>{{ liveButtonLabelText }}</span>
          </div>
        </div>
        <div class="live-grid">
          <div class="live-copy reveal">
            <p class="live-kicker"><span class="live-dot" aria-hidden="true"></span><span>{{ liveKickerText }}</span></p>
            <h1 id="live-title"><span>{{ liveTitleTopText }}</span><br><em>{{ liveTitleAccentText }}</em></h1>
            <p class="live-description">{{ liveDescriptionText }}</p>
            <div class="live-actions">
              @if (liveStreamUrl) {
                <a class="live-primary" [href]="liveStreamUrl" target="_blank" rel="noopener"><span class="live-primary-dot" aria-hidden="true"></span><span>{{ liveButtonLabelText }}</span></a>
              }
              <a class="live-scroll" href="#inicio">Seguir al sitio ↓</a>
            </div>
          </div>

          @if (safeEmbedUrl) {
            <div class="live-media">
              <iframe [src]="safeEmbedUrl" title="Transmision en vivo de Comunidad FARO" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
            </div>
          } @else {
            <div class="live-signal-art" aria-hidden="true">
              <div class="signal-ring signal-ring-one"></div>
              <div class="signal-ring signal-ring-two"></div>
              <div class="signal-ring signal-ring-three"></div>
              <div class="signal-core"><span></span><strong>ON<br>AIR</strong></div>
            </div>
          }
        </div>
        <div class="live-corner live-corner-a" aria-hidden="true"></div>
        <div class="live-corner live-corner-b" aria-hidden="true"></div>
      </section>
    }
  `
})
export class LiveTakeoverComponent {
  @Input() isLiveActive = false;
  @Input() liveTickerText = '';
  @Input() liveKickerText = '';
  @Input() liveTitleTopText = '';
  @Input() liveTitleAccentText = '';
  @Input() liveDescriptionText = '';
  @Input() liveButtonLabelText = '';
  @Input() liveStreamUrl = '';
  @Input() safeEmbedUrl: SafeResourceUrl | null = null;
}

