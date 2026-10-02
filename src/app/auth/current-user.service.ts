import { Injectable, signal } from '@angular/core';

export interface CurrentUserInfo {
  email: string;
  roleName: string;
}

// Estado compartido de la sesion activa, poblado una vez por el shell del dashboard
// y consumido por sus paginas hijas (usuarios, personas, configuracion) sin
// repetir la llamada de validacion de token.
@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  readonly email = signal('');
  readonly roleName = signal('');
  readonly isAdmin = signal(false);

  set(info: CurrentUserInfo): void {
    this.email.set(info.email);
    this.roleName.set(info.roleName);
    this.isAdmin.set(info.roleName === 'SUPERADMIN' || info.roleName === 'ADMIN_COMUNIDAD');
  }

  clear(): void {
    this.email.set('');
    this.roleName.set('');
    this.isAdmin.set(false);
  }
}
