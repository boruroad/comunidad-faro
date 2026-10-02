import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { SessionService } from '../../../auth/session.service';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Casa {
  id: number;
  comunidadId: number;
  nombre: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CasaPayload {
  comunidadId: number;
  nombre: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
}

interface CasaListPayload {
  items: Casa[];
}

interface CasaMutationPayload {
  item: Casa;
}

@Injectable({
  providedIn: 'root'
})
export class CasasService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(pagination: { limit: number; offset: number } = { limit: 100, offset: 0 }): Observable<Casa[]> {
    const params = new HttpParams()
      .set('limit', pagination.limit)
      .set('offset', pagination.offset);

    return this.http
      .get<ApiEnvelope<CasaListPayload>>(this.endpoint('/casas'), {
        headers: this.authHeaders(),
        params
      })
      .pipe(map(response => response.data.items || []));
  }

  listAll(): Observable<Casa[]> {
    const pageSize = 100;
    const fetchPage = (offset: number) =>
      this.list({ limit: pageSize, offset }).pipe(
        map(items => ({
          items,
          nextOffset: items.length === pageSize ? offset + pageSize : null
        }))
      );

    return fetchPage(0).pipe(
      expand(page => page.nextOffset === null ? EMPTY : fetchPage(page.nextOffset)),
      reduce((casas, page) => casas.concat(page.items), [] as Casa[])
    );
  }

  create(payload: CasaPayload): Observable<Casa> {
    return this.http
      .post<ApiEnvelope<CasaMutationPayload>>(this.endpoint('/casas'), payload, {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.item));
  }

  update(id: number, payload: CasaPayload): Observable<Casa> {
    return this.http
      .put<ApiEnvelope<CasaMutationPayload>>(
        this.endpoint('/casas'),
        { id, ...payload },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  delete(id: number): Observable<void> {
    return this.http
      .request<ApiEnvelope<unknown>>('DELETE', this.endpoint('/casas'), {
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
