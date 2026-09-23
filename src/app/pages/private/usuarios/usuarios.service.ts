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

export interface Usuario {
  id: number;
  comunidadId: number | null;
  personaId: number | null;
  rolId: number;
  rolNombre: string | null;
  email: string;
  activo: boolean;
  ultimoAcceso: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface UsuarioListPayload {
  items: Usuario[];
}

interface UsuarioMutationPayload {
  item: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(): Observable<Usuario[]> {
    return this.http
      .get<ApiEnvelope<UsuarioListPayload>>(this.endpoint('/usuarios'), {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.items || []));
  }

  activate(id: number): Observable<Usuario> {
    return this.http
      .post<ApiEnvelope<UsuarioMutationPayload>>(
        this.endpoint('/usuarios/activate'),
        { id },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  deactivate(id: number): Observable<Usuario> {
    return this.http
      .post<ApiEnvelope<UsuarioMutationPayload>>(
        this.endpoint('/usuarios/deactivate'),
        { id },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  private endpoint(path: string): string {
    return `${this.apiBaseUrl}${path}`;
  }

  private authHeaders(): HttpHeaders {
    const token = this.session.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
