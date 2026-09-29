import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="site-header" [class.scrolled]="headerScrolled" data-header>
      <a class="brand" [routerLink]="['/']" fragment="inicio" aria-label="Comunidad FARO, ir al inicio">
        <span class="brand-mark" aria-hidden="true">F</span>
        <span class="brand-copy">
          <strong>COMUNIDAD FARO</strong>
          <small>FE · AMOR · RELEVANCIA · OBEDIENCIA</small>
        </span>
      </a>

      <nav class="desktop-nav" aria-label="Navegacion principal">
        <a [routerLink]="['/']" fragment="casa">Casa</a>
        <a [routerLink]="['/']" fragment="identidad">F.A.R.O.</a>
        <a [routerLink]="['/']" fragment="reunion">Esta semana</a>
        <a [routerLink]="['/']" fragment="musica">Musica</a>
        <a [routerLink]="['/']" fragment="calendario">Calendario</a>
        <a [routerLink]="['/']" fragment="newsletter">Mantente cerca</a>
        <a [routerLink]="['/interesado']">¿Estas interesado?</a>
      </nav>

      <a class="header-cta" [href]="facebookUrl" target="_blank" rel="noopener">
        Ultima convocatoria ↗
      </a>

      <button
        class="menu-button"
        type="button"
        [attr.aria-expanded]="menuOpen"
        aria-controls="mobile-menu"
        aria-label="Abrir menu"
        (click)="toggleMenu.emit()"
      >
        <span></span>
        <span></span>
      </button>

      <nav
        id="mobile-menu"
        class="mobile-menu"
        aria-label="Navegacion movil"
        [hidden]="!menuOpen"
      >
        <a [routerLink]="['/']" fragment="casa" (click)="closeMenu.emit()">Casa</a>
        <a [routerLink]="['/']" fragment="identidad" (click)="closeMenu.emit()">F.A.R.O.</a>
        <a [routerLink]="['/']" fragment="reunion" (click)="closeMenu.emit()">Esta semana</a>
        <a [routerLink]="['/']" fragment="musica" (click)="closeMenu.emit()">Musica</a>
        <a [routerLink]="['/']" fragment="calendario" (click)="closeMenu.emit()">Calendario</a>
        <a [routerLink]="['/']" fragment="newsletter" (click)="closeMenu.emit()">Mantente cerca</a>
        <a [routerLink]="['/interesado']" (click)="closeMenu.emit()">¿Estas interesado?</a>
        <a [href]="facebookUrl" target="_blank" rel="noopener" (click)="closeMenu.emit()">
          Ultima convocatoria ↗
        </a>
      </nav>
    </header>
  `
})
export class SiteHeaderComponent {
  @Input({ required: true }) facebookUrl = '';
  @Input() menuOpen = false;
  @Input() headerScrolled = false;

  @Output() readonly toggleMenu = new EventEmitter<void>();
  @Output() readonly closeMenu = new EventEmitter<void>();
}
