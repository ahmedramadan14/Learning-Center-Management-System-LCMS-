import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private apiUrl = 'http://localhost:3000/api/v1/teachers';

  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTeacherById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: any): Observable<any> {
    return this.http.post(this.apiUrl, teacher);
  }

  updateTeacher(id: string, teacher: any): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}`,
      teacher
    );
  }

  deleteTeacher(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

  approveTeacher(id: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }

  activateTeacher(id: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }

  deactivateTeacher(id: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }
}