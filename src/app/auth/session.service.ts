import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LoginPayload {
  token: string;
  expires_at: string;
  user: Record<string, unknown>;
  role: Record<string, unknown> | null;
  persona: Record<string, unknown> | null;
}

interface ValidatePayload {
  user: Record<string, unknown>;
  role: Record<string, unknown> | null;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'faro_auth_token';
  private readonly apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  private endpoint(path: string): string {
    return `${this.apiBaseUrl}${path}`;
  }

  login(email: string, password: string): Observable<LoginPayload> {
    return this.http
      .post<ApiEnvelope<LoginPayload>>(this.endpoint('/auth/login'), {
        email,
        password
      })
      .pipe(
        map(response => response.data)
      );
  }

  validate(token: string): Observable<ValidatePayload> {
    return this.http
      .post<ApiEnvelope<ValidatePayload>>(this.endpoint('/auth/validate'), {
        token
      })
      .pipe(
        map(response => response.data)
      );
  }

  logout(token: string): Observable<unknown> {
    return this.http
      .post(this.endpoint('/auth/logout'), {
        token
      });
  }

  storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== '';
  }
}
