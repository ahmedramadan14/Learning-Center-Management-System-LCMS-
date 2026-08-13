import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl = 'http://localhost:3000/api/v1/teachers';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAllTeachers(): Observable<any> {
    return this.http.get(this.apiUrl, this.getAuthHeaders());
  }

  getTeacherById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  createTeacher(teacher: any): Observable<any> {
    return this.http.post(this.apiUrl, teacher, this.getAuthHeaders());
  }

  updateTeacher(id: string, teacher: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, teacher, this.getAuthHeaders());
  }

  deleteTeacher(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  activateTeacher(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/activate`, {}, this.getAuthHeaders());
  }

  deactivateTeacher(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/deactivate`, {}, this.getAuthHeaders());
  }
}
