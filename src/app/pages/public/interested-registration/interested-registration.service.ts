import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type MedioContactoPreferido = 'WHATSAPP' | 'LLAMADA' | 'EMAIL';

export interface InterestedRegistrationPayload {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  whatsapp: string;
  email: string;
  comoSeEntero: string;
  medioContactoPreferido: MedioContactoPreferido;
  comentario: string;
  aceptoPrivacidad: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class InterestedRegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  register(payload: InterestedRegistrationPayload): Observable<void> {
    return this.http
      .post<ApiEnvelope<{ registered: boolean }>>(`${this.apiBaseUrl}/personas-interesadas`, payload)
      .pipe(map(() => undefined));
  }
}
