import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  _id: string;
  name: string;
  phone: string;
  role: 'admin' | 'secretary' | 'teacher' | 'student' | 'parent';
  isApproved: boolean;
}

export interface LoginResponse {
  data: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { phone: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      })
    );
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  getUserRole(): string {
    const user = this.getCurrentUser();
    return user ? user.role : '';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}