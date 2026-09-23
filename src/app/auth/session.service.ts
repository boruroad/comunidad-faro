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

interface RegisterPayload {
  user: Record<string, unknown>;
}

interface ValidateResetTokenPayload {
  valid: boolean;
  expiresAt: string | null;
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

  register(email: string, password: string, confirmPassword: string): Observable<RegisterPayload> {
    return this.http
      .post<ApiEnvelope<RegisterPayload>>(this.endpoint('/auth/register'), {
        email,
        password,
        confirmPassword
      })
      .pipe(
        map(response => response.data)
      );
  }

  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<ApiEnvelope<unknown>>(this.endpoint('/auth/forgot-password'), {
        email
      })
      .pipe(map(() => undefined));
  }

  validateResetToken(token: string): Observable<ValidateResetTokenPayload> {
    return this.http
      .post<ApiEnvelope<ValidateResetTokenPayload>>(this.endpoint('/auth/validate-reset-token'), {
        token
      })
      .pipe(map(response => response.data));
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<ApiEnvelope<unknown>>(this.endpoint('/auth/reset-password'), {
        token,
        new_password: newPassword
      })
      .pipe(map(() => undefined));
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
