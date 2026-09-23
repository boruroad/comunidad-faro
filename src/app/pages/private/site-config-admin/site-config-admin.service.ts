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

export interface SiteConfigVersion {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  config: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
  activatedAt: string | null;
  deactivatedAt: string | null;
  createdByUsuarioId: number | null;
  activatedByUsuarioId: number | null;
  deactivatedByUsuarioId: number | null;
  createdByEmail: string | null;
  activatedByEmail: string | null;
  deactivatedByEmail: string | null;
}

interface SiteConfigListPayload {
  items: SiteConfigVersion[];
}

interface SiteConfigDetailPayload {
  item: SiteConfigVersion;
}

interface SiteConfigMutationPayload {
  item: SiteConfigVersion;
}

@Injectable({
  providedIn: 'root'
})
export class SiteConfigAdminService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(): Observable<SiteConfigVersion[]> {
    return this.http
      .get<ApiEnvelope<SiteConfigListPayload>>(
        this.endpoint('/site-configs'),
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.items || []));
  }

  detail(id: number): Observable<SiteConfigVersion> {
    return this.http
      .get<ApiEnvelope<SiteConfigDetailPayload>>(
        this.endpoint(`/site-configs/detail?id=${id}`),
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  create(payload: {
    nombre: string;
    descripcion: string;
    config: Record<string, unknown>;
    activate: boolean;
  }): Observable<SiteConfigVersion> {
    return this.http
      .post<ApiEnvelope<SiteConfigMutationPayload>>(
        this.endpoint('/site-configs'),
        payload,
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  update(id: number, payload: {
    nombre: string;
    descripcion: string;
    config: Record<string, unknown>;
  }): Observable<SiteConfigVersion> {
    return this.http
      .put<ApiEnvelope<SiteConfigMutationPayload>>(
        this.endpoint('/site-configs'),
        {
          id,
          ...payload
        },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  activate(id: number): Observable<SiteConfigVersion> {
    return this.http
      .post<ApiEnvelope<SiteConfigMutationPayload>>(
        this.endpoint('/site-configs/activate'),
        { id },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  deactivate(id: number): Observable<SiteConfigVersion> {
    return this.http
      .post<ApiEnvelope<SiteConfigMutationPayload>>(
        this.endpoint('/site-configs/deactivate'),
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
