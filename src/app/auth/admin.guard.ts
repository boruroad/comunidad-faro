import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { SessionService } from './session.service';

const ADMIN_ROLES = new Set(['SUPERADMIN', 'ADMIN_COMUNIDAD']);

export const adminGuard: CanActivateFn = (route, state) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        redirect: state.url || '/dashboard'
      }
    });
  }

  const token = session.getToken();

  if (!token) {
    return router.createUrlTree(['/login'], {
      queryParams: {
        redirect: state.url || '/dashboard'
      }
    });
  }

  return session.validate(token).pipe(
    map(payload => {
      const role = payload.role || {};
      const roleName = typeof role['nombre'] === 'string' ? role['nombre'].toUpperCase() : '';

      if (ADMIN_ROLES.has(roleName)) {
        return true;
      }

      return router.createUrlTree(['/dashboard']);
    }),
    catchError(() => {
      session.clearToken();
      return of(router.createUrlTree(['/login'], {
        queryParams: {
          redirect: state.url || '/dashboard'
        }
      }));
    })
  );
};
