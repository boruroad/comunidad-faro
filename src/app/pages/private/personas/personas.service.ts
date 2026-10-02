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

export interface Persona {
  id: number;
  comunidadId: number | null;
  casaId: number | null;
  casaNombre: string | null;
  liderId: number | null;
  liderNombre: string | null;
  areaId: number | null;
  areaNombre: string | null;
  numeroControl: string | null;
  origen: 'MIEMBRO' | 'INTERESADO';
  nombre: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  fechaNacimiento: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  direccion: string | null;
  barrio: string | null;
  seccion: string | null;
  comoSeEntero: string | null;
  medioContactoPreferido: string | null;
  asisteReunionGeneral: boolean;
  asisteCasa: boolean;
  esLider: boolean;
  esServidor: boolean;
  registradoPorNombre: string | null;
  observaciones: string | null;
  estatus: string;
  fechaAlta: string | null;
  createdAt: string | null;
}

export interface PersonaEditPayload {
  comunidadId?: number | null;
  casaId?: number | null;
  liderId?: number | null;
  areaId?: number | null;
  numeroControl?: string;
  origen?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  direccion?: string;
  barrio?: string;
  seccion?: string;
  estatus?: string;
  comoSeEntero?: string;
  medioContactoPreferido?: string;
  asisteReunionGeneral?: boolean;
  asisteCasa?: boolean;
  esLider?: boolean;
  esServidor?: boolean;
  observaciones?: string;
}

export interface PersonaFilters {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  numeroControl?: string;
  comoSeEntero?: string;
  medioContactoPreferido?: string;
  estatus?: string;
  origen?: string;
  liderId?: number | string;
  areaId?: number | string;
  soloActivos?: boolean;
  busqueda?: string;
  conCasa?: boolean | string;
  conLider?: boolean | string;
}

interface PersonaListPayload {
  items: Persona[];
}

interface PersonaMutationPayload {
  item: Persona;
}

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(
    filters: PersonaFilters = {},
    pagination: { limit: number; offset: number } = { limit: 100, offset: 0 }
  ): Observable<Persona[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(this.toSnakeCase(key), value);
      }
    }
    params = params.set('limit', pagination.limit).set('offset', pagination.offset);

    return this.http
      .get<ApiEnvelope<PersonaListPayload>>(this.endpoint('/personas'), {
        headers: this.authHeaders(),
        params
      })
      .pipe(map(response => response.data.items || []));
  }

  listAll(filters: PersonaFilters = {}): Observable<Persona[]> {
    const pageSize = 100;
    const fetchPage = (offset: number) =>
      this.list(filters, { limit: pageSize, offset }).pipe(
        map(items => ({
          items,
          nextOffset: items.length === pageSize ? offset + pageSize : null
        }))
      );

    return fetchPage(0).pipe(
      expand(page => page.nextOffset === null ? EMPTY : fetchPage(page.nextOffset)),
      reduce((people, page) => people.concat(page.items), [] as Persona[])
    );
  }

  // Catalogo para el filtro "Lider": solo personas que ya lideran a alguien.
  listLideres(): Observable<Persona[]> {
    return this.http
      .get<ApiEnvelope<PersonaListPayload>>(this.endpoint('/personas/lideres'), {
        headers: this.authHeaders()
      })
      .pipe(map(response => response.data.items || []));
  }

  private toSnakeCase(value: string): string {
    return value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  update(id: number, payload: PersonaEditPayload): Observable<Persona> {
    return this.http
      .put<ApiEnvelope<PersonaMutationPayload>>(
        this.endpoint('/personas'),
        { id, ...payload },
        { headers: this.authHeaders() }
      )
      .pipe(map(response => response.data.item));
  }

  create(payload: PersonaEditPayload): Observable<Persona> {
    return this.http
      .post<ApiEnvelope<PersonaMutationPayload>>(this.endpoint('/personas'), payload, {
        headers: this.authHeaders()
      })
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
