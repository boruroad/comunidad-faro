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

export interface Comunidad {
  id: number;
  nombre: string;
  lugar: string;
  direccion: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ComunidadPayload {
  nombre: string;
  lugar: string;
  direccion: string;
}

interface ComunidadListPayload {
  items: Comunidad[];
}

interface ComunidadMutationPayload {
  item: Comunidad;
}

@Injectable({
  providedIn: 'root'
})
export class ComunidadesService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(): Observable<Comunidad[]> {
    return this.http
      .get<ApiEnvelope<ComunidadListPayload>>(this.endpoint('/comunidades'), {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.items || []));
  }

  create(payload: ComunidadPayload): Observable<Comunidad> {
    return this.http
      .post<ApiEnvelope<ComunidadMutationPayload>>(this.endpoint('/comunidades'), payload, {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.item));
  }

  update(id: number, payload: ComunidadPayload): Observable<Comunidad> {
    return this.http
      .put<ApiEnvelope<ComunidadMutationPayload>>(
        this.endpoint('/comunidades'),
        { id, ...payload },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  delete(id: number): Observable<void> {
    return this.http
      .request<ApiEnvelope<unknown>>('DELETE', this.endpoint('/comunidades'), {
        headers: this.authHeaders(),
        body: { id }
      })
      .pipe(map(() => undefined));
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
