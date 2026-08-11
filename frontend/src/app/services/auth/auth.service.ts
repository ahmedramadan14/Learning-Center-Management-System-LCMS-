import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface AuthUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'secretary';
  isActive?: boolean;
}

interface AuthResponse {
  token?: string;
  data: AuthUser | { user: AuthUser };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'lcms_token';
  private readonly userKey = 'lcms_user';
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  login(phone: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { phone, password }).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  register(payload: Record<string, unknown>): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/signup', payload).pipe(
      tap((response) => {
        if (response.token) this.storeSession(response);
      })
    );
  }

  logout(): Observable<unknown> {
    return this.api.post('/auth/logout', {}).pipe(tap(() => this.clearSession()));
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    return Boolean(this.token && this.currentUser);
  }

  updateCurrentUser(changes: Partial<AuthUser>): void {
    const currentUser = this.currentUser;
    if (!currentUser) return;

    const user = { ...currentUser, ...changes };
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private storeSession(response: AuthResponse): void {
    const user = this.responseUser(response);
    if (!response.token || !user) return;
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private responseUser(response: AuthResponse): AuthUser | null {
    return 'user' in response.data ? response.data.user : response.data;
  }

  private readUser(): AuthUser | null {
    const saved = localStorage.getItem(this.userKey);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
