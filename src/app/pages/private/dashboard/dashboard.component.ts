import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { PrivateHeaderComponent } from '../../../components/private-header.component';
import { SessionService } from '../../../auth/session.service';
import { CurrentUserService } from '../../../auth/current-user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PrivateHeaderComponent
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  readonly currentUser = inject(CurrentUserService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

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
          const roleRaw = typeof role['nombre'] === 'string' ? role['nombre'] : 'CONSULTA';

          this.currentUser.set({ email, roleName: roleRaw });
          this.loading.set(false);
        },
        error: () => {
          this.session.clearToken();
          this.currentUser.clear();
          this.errorMessage.set('Tu sesion expiro. Inicia sesion nuevamente.');
          this.loading.set(false);
          this.router.navigate(['/login']);
        }
      });
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
        this.currentUser.clear();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.session.clearToken();
        this.currentUser.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}

