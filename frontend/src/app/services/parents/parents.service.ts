import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  private apiUrl = 'http://localhost:3000/api/v1/parents';

  constructor(private http: HttpClient) {}

  getAllParents(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getParentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createParent(parent: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, parent);
  }

  updateParent(id: string, parent: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      parent
    );
  }

  deleteParent(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }
}