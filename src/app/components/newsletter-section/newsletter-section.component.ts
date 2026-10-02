import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-newsletter-section',
  standalone: true,
  templateUrl: './newsletter-section.component.html'
})
export class NewsletterSectionComponent {
  @Input() enabled = false;
  @Input() newsletterAction = '';
  @Input() newsletterTag = '';

  newsletterStatus = '';
  newsletterWarning = false;

  onNewsletterSubmit(
    event: Event
  ): void {
    if (!this.newsletterAction) {
      event.preventDefault();

      this.newsletterStatus =
        'El formulario ya está diseñado; falta conectar el servicio de newsletter en la configuración.';

      this.newsletterWarning =
        true;

      return;
    }

    this.newsletterStatus =
      'Te estamos llevando a confirmar tu suscripción...';

    this.newsletterWarning =
      false;
  }
}
