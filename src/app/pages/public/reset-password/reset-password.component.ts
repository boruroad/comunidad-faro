import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SiteHeaderComponent } from '../../../components/site-header/site-header.component';
import { RuntimeConfigService } from '../../../config/runtime-config.service';
import { SessionService } from '../../../auth/session.service';
import { strongPasswordValidator, passwordsMatchValidator } from '../../../auth/password.validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SiteHeaderComponent],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly runtimeConfig = inject(RuntimeConfigService);

  readonly facebookUrl =
    this.runtimeConfig.config.meeting.facebookUrl ||
    this.runtimeConfig.config.socials['facebook'];

  readonly checkingToken = signal(true);
  readonly tokenValid = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly attemptedSubmit = signal(false);
  readonly successMessage = signal('');

  menuOpen = false;
  headerScrolled = true;

  private token = '';

  readonly form = this.fb.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator('password', 'confirmPassword') }
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.checkingToken.set(false);
      this.tokenValid.set(false);
      return;
    }

    this.session.validateResetToken(this.token).subscribe({
      next: () => {
        this.tokenValid.set(true);
        this.checkingToken.set(false);
      },
      error: () => {
        this.tokenValid.set(false);
        this.checkingToken.set(false);
      }
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
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

    const { password } = this.form.getRawValue();

    this.session.resetPassword(this.token, password || '').subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Tu contraseña fue actualizada. Ya puedes iniciar sesion.');
      },
      error: (err: HttpErrorResponse) => {
        const backendMessage = typeof err.error?.message === 'string' ? err.error.message : '';
        this.errorMessage.set(
          backendMessage || 'No pudimos restablecer tu contraseña. Intenta de nuevo.'
        );
        this.loading.set(false);
      }
    });
  }
}
