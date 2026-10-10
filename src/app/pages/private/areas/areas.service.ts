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

export interface Area {
  id: number;
  nombre: string;
  descripcion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AreaPayload {
  nombre: string;
  descripcion: string;
}

interface AreaListPayload {
  items: Area[];
}

interface AreaMutationPayload {
  item: Area;
}

@Injectable({
  providedIn: 'root'
})
export class AreasService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(): Observable<Area[]> {
    return this.http
      .get<ApiEnvelope<AreaListPayload>>(this.endpoint('/areas'), {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.items || []));
  }

  create(payload: AreaPayload): Observable<Area> {
    return this.http
      .post<ApiEnvelope<AreaMutationPayload>>(this.endpoint('/areas'), payload, {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.item));
  }

  update(id: number, payload: AreaPayload): Observable<Area> {
    return this.http
      .put<ApiEnvelope<AreaMutationPayload>>(
        this.endpoint('/areas'),
        { id, ...payload },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  delete(id: number): Observable<void> {
    return this.http
      .request<ApiEnvelope<unknown>>('DELETE', this.endpoint('/areas'), {
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
