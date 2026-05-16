import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../..//environments/enviroment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiBaseUrl}/auth`;
  private readonly tokenKey = 'resumeai_token';
  private readonly userKey = 'resumeai_user';
  private readonly authState = new BehaviorSubject<boolean>(this.hasToken());

  readonly isLoggedIn$ = this.authState.asObservable();

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.setSession(response)),
      catchError((error) => this.handleAuthError(error)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap((response) => this.setSession(response)),
        catchError((error) => this.handleAuthError(error)),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.authState.next(false);
    void this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthUser | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.authState.next(true);
  }

  private hasToken(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey));
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const message =
      typeof error.error?.message === 'string'
        ? error.error.message
        : 'Something went wrong. Please try again.';

    return throwError(() => new Error(message));
  }
}
