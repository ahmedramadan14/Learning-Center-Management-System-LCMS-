import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface CurrentUser {
  _id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface AuthResponse {
  token?: string;
  data: {
    user: CurrentUser;
    profile?: unknown;
  } | CurrentUser;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: CurrentUser | null = null;
  private readonly tokenKey = 'lcms_token';
  private readonly userKey = 'lcms_user';
  private readonly authRoot = `http://${window.location.hostname || 'localhost'}:3000/api/v1/auth`;

  constructor(private readonly http: HttpClient) {
    this.currentUser = this.readStoredUser();
  }

  setCurrentUser(user: CurrentUser): void {
    this.currentUser = user;
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser(): void {
    this.currentUser = null;
    localStorage.removeItem(this.userKey);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  signup(payload: Record<string, unknown>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authRoot}/signup`, payload).pipe(
      tap((response) => this.completeAuthentication(response))
    );
  }

  login(phone: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authRoot}/login`, { phone, password }).pipe(
      tap((response) => this.completeAuthentication(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.clearCurrentUser();
  }

  private completeAuthentication(response: AuthResponse): void {
    const data = response.data;
    const user = 'user' in data ? data.user : data;

    this.setCurrentUser(user);

    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private readStoredUser(): CurrentUser | null {
    const storedUser = localStorage.getItem(this.userKey);
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as CurrentUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
