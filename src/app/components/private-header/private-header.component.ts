import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CurrentUserService } from '../../auth/current-user.service';

@Component({
  selector: 'app-private-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="private-header">
      <a class="private-brand" routerLink="/dashboard" aria-label="Panel interno, ir al dashboard">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span class="brand-copy">
          <strong>FARO</strong>
          <small>PANEL INTERNO</small>
        </span>
      </a>

      <nav class="private-nav" aria-label="Navegacion del panel">
        <a routerLink="/dashboard" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        <a routerLink="/dashboard/usuarios" routerLinkActive="is-active">Usuarios</a>
        <a routerLink="/dashboard/personas" routerLinkActive="is-active">Personas</a>
        @if (currentUser.isAdmin()) {
          <a routerLink="/dashboard/comunidades" routerLinkActive="is-active">Comunidades</a>
          <a routerLink="/dashboard/casas" routerLinkActive="is-active">Casas</a>
          <a routerLink="/dashboard/areas" routerLinkActive="is-active">Areas</a>
          <a routerLink="/dashboard/configuracion" routerLinkActive="is-active">Configuracion</a>
        }
      </nav>

      <div class="private-header-user">
        <span class="private-header-email">{{ currentUser.email() }}</span>
        <span class="private-header-role">{{ currentUser.roleName() }}</span>
      </div>

      <div class="private-header-actions">
        <a class="text-link" routerLink="/">Volver al sitio</a>
        <button class="button button-dark" type="button" (click)="logout.emit()">Cerrar sesion</button>
      </div>
    </header>
  `
})
export class PrivateHeaderComponent {
  readonly currentUser = inject(CurrentUserService);

  @Output() readonly logout = new EventEmitter<void>();
}
