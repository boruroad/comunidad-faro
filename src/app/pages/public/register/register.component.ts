import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SiteHeaderComponent } from '../../../components/site-header.component';
import { FARO_CONFIG } from '../../../faro-config';
import { SessionService } from '../../../auth/session.service';
import { strongPasswordValidator, passwordsMatchValidator } from '../../../auth/password.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SiteHeaderComponent],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  @ViewChild('successDialog') private readonly successDialog?: ElementRef<HTMLDialogElement>;

  readonly facebookUrl =
    FARO_CONFIG.meeting.facebookUrl ||
    FARO_CONFIG.socials['facebook'];

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly attemptedSubmit = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  menuOpen = false;
  headerScrolled = true;

  readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') }
  );

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(value => !value);
  }

  fieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }

    return control.invalid && (control.touched || this.attemptedSubmit());
  }

  get passwordsMismatch(): boolean {
    const confirm = this.form.get('confirmPassword');
    return (
      this.form.hasError('passwordsMismatch') &&
      !!confirm &&
      (confirm.touched || this.attemptedSubmit())
    );
  }

  submit(): void {
    this.errorMessage.set('');
    this.attemptedSubmit.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const { email, password, confirmPassword } = this.form.getRawValue();

    this.session
      .register((email || '').trim().toLowerCase(), password || '', confirmPassword || '')
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.attemptedSubmit.set(false);
          this.form.reset();
          this.successDialog?.nativeElement.showModal();
        },
        error: (err: HttpErrorResponse) => {
          const backendMessage = typeof err.error?.message === 'string' ? err.error.message : '';
          this.errorMessage.set(
            backendMessage || 'No pudimos crear tu cuenta. Intenta de nuevo en unos minutos.'
          );
          this.loading.set(false);
        }
      });
  }

  acceptSuccessModal(): void {
    this.successDialog?.nativeElement.close();
    this.router.navigateByUrl('/login');
  }
}
