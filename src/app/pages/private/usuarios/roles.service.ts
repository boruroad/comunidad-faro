import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SessionService } from '../../../auth/session.service';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface RolListPayload {
  items: Rol[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(): Observable<Rol[]> {
    return this.http
      .get<ApiEnvelope<RolListPayload>>(`${this.apiBaseUrl}/roles`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${this.session.getToken()}` })
      })
      .pipe(map(response => response.data.items || []));
  }
}
