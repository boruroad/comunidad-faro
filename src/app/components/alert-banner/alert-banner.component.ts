import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-banner',
  standalone: true,
  template: `
    @if (alertMessage) {
      <div class="faro-alert-banner" role="alert">
        <div class="faro-alert-content">
          <span class="faro-alert-dot" aria-hidden="true"></span>
          <p>{{ alertMessage }}</p>
        </div>
      </div>
    }
  `
})
export class AlertBannerComponent {
  @Input() alertMessage = '';
}
