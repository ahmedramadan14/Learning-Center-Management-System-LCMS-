import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ApiListResponse {
  data?: unknown;
  results?: number;
  count?: number;
  pagination?: { total?: number };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly root = `http://${window.location.hostname || 'localhost'}:3000/api/v1`;

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.root}${path}`);
  }

  post<T>(path: string, payload: unknown): Observable<T> {
    return this.http.post<T>(`${this.root}${path}`, payload);
  }

  patch<T>(path: string, payload: unknown): Observable<T> {
    return this.http.patch<T>(`${this.root}${path}`, payload);
  }

  put<T>(path: string, payload: unknown): Observable<T> {
    return this.http.put<T>(`${this.root}${path}`, payload);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.root}${path}`);
  }

  list(path: string): Observable<Record<string, unknown>[]> {
    return this.get<ApiListResponse>(path).pipe(map((response) => this.unwrapList(response)));
  }

  private unwrapList(response: ApiListResponse): Record<string, unknown>[] {
    if (Array.isArray(response.data)) return response.data as Record<string, unknown>[];

    const data = response.data as Record<string, unknown> | undefined;
    if (!data) return [];

    const preferredKeys = ['students', 'teachers', 'payments', 'notifications', 'users'];
    for (const key of preferredKeys) {
      if (Array.isArray(data[key])) return data[key] as Record<string, unknown>[];
    }

    const firstList = Object.values(data).find((value) => Array.isArray(value));
    return Array.isArray(firstList) ? firstList as Record<string, unknown>[] : [];
  }
}
