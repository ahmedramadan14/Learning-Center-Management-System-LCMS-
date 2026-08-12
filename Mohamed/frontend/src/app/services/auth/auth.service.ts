import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthResponse {
  data: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    isApproved: boolean;
  };
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private apiUrl = 'http://localhost:3000/api/v1/auth';
  constructor(private http: HttpClient) {}

  login(credentials: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}