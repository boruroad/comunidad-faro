import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  numeroControl: string | null;
  origen: 'MIEMBRO' | 'INTERESADO';
  nombre: string;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  comoSeEntero: string | null;
  medioContactoPreferido: string | null;
  observaciones: string | null;
  estatus: string;
  fechaAlta: string | null;
  createdAt: string | null;
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
}

interface PersonaListPayload {
  items: Persona[];
}

@Injectable({
  providedIn: 'root'
})
export class PersonasService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  list(filters: PersonaFilters = {}): Observable<Persona[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(this.toSnakeCase(key), value);
      }
    }

    return this.http
      .get<ApiEnvelope<PersonaListPayload>>(this.endpoint('/personas'), {
        headers: this.authHeaders(),
        params
      })
      .pipe(map(response => response.data.items || []));
  }

  private toSnakeCase(value: string): string {
    return value.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
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

