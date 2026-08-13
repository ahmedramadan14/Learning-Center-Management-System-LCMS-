import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { CurrentUser, normalizeUserRole, UserRole } from './auth.types';

export { CurrentUser, UserRole } from './auth.types';

export interface AuthResponse {
  token?: string;
  data: {
    user: CurrentUser;
    profile?: unknown;
  } | CurrentUser;
  message?: string;
}

interface CurrentUserResponse {
  success?: boolean;
  data: CurrentUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: CurrentUser | null = null;
  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  private readonly tokenKey = 'lcms_token';
  private readonly userKey = 'lcms_user';
  private readonly authRoot = `http://${window.location.hostname || 'localhost'}:3000/api/v1/auth`;
  private readonly userRoot = `http://${window.location.hostname || 'localhost'}:3000/api/v1/users`;
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.currentUser = this.readStoredUser();
    this.currentUserSubject.next(this.currentUser);
  }

  setCurrentUser(user: CurrentUser): void {
    this.currentUser = user;
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser(): void {
    this.currentUser = null;
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
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

  /** Loads the authenticated user's own account record and refreshes local session data. */
  getMyProfile(): Observable<CurrentUser> {
    return this.http.get<CurrentUserResponse>(`${this.userRoot}/getMe`).pipe(
      map((response) => this.storeCurrentUser(response.data))
    );
  }

  /**
   * Invalidates the current JWT on the server, then always clears this browser's
   * session. Network failures are intentionally treated as a local sign-out so
   * a stale session is never retained on the device.
   */
  logoutFromServer(): Observable<void> {
    if (!this.token) {
      this.logout();
      return of(void 0);
    }

    return this.http.post<void>(`${this.authRoot}/logout`, {}).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      // Clear before subscribers navigate away; finalize covers cancellation too.
      tap(() => this.logout()),
      finalize(() => this.logout())
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.clearCurrentUser();
  }

  private completeAuthentication(response: AuthResponse): void {
    const data = response.data;
    const user = 'user' in data ? data.user : data;

    this.storeCurrentUser(user);

    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private storeCurrentUser(user: CurrentUser): CurrentUser {
    const role = normalizeUserRole(user.role);
    if (!role) {
      this.logout();
      throw new Error('The account has an unsupported role.');
    }

    const normalizedUser = { ...user, role };
    this.setCurrentUser(normalizedUser);
    return normalizedUser;
  }

  private readStoredUser(): CurrentUser | null {
    const storedUser = localStorage.getItem(this.userKey);
    if (!storedUser) return null;

    try {
      const user = JSON.parse(storedUser) as CurrentUser;
      return normalizeUserRole(user.role) ? user : null;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
