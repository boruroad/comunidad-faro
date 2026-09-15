import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SiteHeaderComponent } from './components/site-header.component';
import { FARO_CONFIG } from './faro-config';
import { SessionService } from './auth/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SiteHeaderComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly facebookUrl =
    FARO_CONFIG.meeting.facebookUrl ||
    FARO_CONFIG.socials['facebook'];

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly userName = signal('');
  readonly roleName = signal('');

  menuOpen = false;
  headerScrolled = true;

  ngOnInit(): void {
    const token = this.session.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.session
      .validate(token)
      .subscribe({
        next: data => {
          const user = data.user || {};
          const role = data.role || {};

          const email = typeof user['email'] === 'string' ? user['email'] : 'Usuario';
          this.userName.set(email);

          const roleRaw = typeof role['nombre'] === 'string' ? role['nombre'] : 'CONSULTA';
          this.roleName.set(roleRaw);

          this.loading.set(false);
        },
        error: () => {
          this.session.clearToken();
          this.errorMessage.set('Tu sesion expiro. Inicia sesion nuevamente.');
          this.loading.set(false);
          this.router.navigate(['/login']);
        }
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    const token = this.session.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.session.logout(token).subscribe({
      complete: () => {
        this.session.clearToken();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.session.clearToken();
        this.router.navigate(['/login']);
      }
    });
  }
}
