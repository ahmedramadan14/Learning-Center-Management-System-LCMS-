import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  private apiUrl = 'http://localhost:3000/api/v1/parents';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAllParents(): Observable<any> {
    return this.http.get<any>(this.apiUrl, this.getAuthHeaders());
  }

  getParentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  createParent(parent: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, parent, this.getAuthHeaders());
  }

  updateParent(id: string, parent: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, parent, this.getAuthHeaders());
  }

  deleteParent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
