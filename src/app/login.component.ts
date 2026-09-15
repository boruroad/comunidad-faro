import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SiteHeaderComponent } from './components/site-header.component';
import { FARO_CONFIG } from './faro-config';
import { SessionService } from './auth/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SiteHeaderComponent
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly facebookUrl =
    FARO_CONFIG.meeting.facebookUrl ||
    FARO_CONFIG.socials['facebook'];

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  menuOpen = false;
  headerScrolled = true;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
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

    const email = (this.form.value.email || '').trim().toLowerCase();
    const password = this.form.value.password || '';

    this.loading.set(true);

    this.session
      .login(email, password)
      .subscribe({
        next: data => {
          this.session.storeToken(data.token);

          const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/dashboard';
          this.router.navigateByUrl(redirect);
        },
        error: () => {
          this.errorMessage.set('No se pudo iniciar sesion. Verifica tu correo y contraseña.');
          this.loading.set(false);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
  }
}
