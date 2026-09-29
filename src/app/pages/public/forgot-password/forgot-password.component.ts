import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SiteHeaderComponent } from '../../../components/site-header/site-header.component';
import { FARO_CONFIG } from '../../../faro-config';
import { SessionService } from '../../../auth/session.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SiteHeaderComponent],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(SessionService);

  readonly facebookUrl =
    FARO_CONFIG.meeting.facebookUrl ||
    FARO_CONFIG.socials['facebook'];

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly submitted = signal(false);

  menuOpen = false;
  headerScrolled = true;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const email = (this.form.value.email || '').trim().toLowerCase();

    this.session.forgotPassword(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error?.message === 'string' ? err.error.message : '';
        this.errorMessage.set(backendMessage || 'No pudimos procesar tu solicitud. Intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }
}
