import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentsResponse, Student } from '../../pages/dashboard/students/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:3000/api/v1/students';

  constructor(private http: HttpClient) {}

  /**
   * Helper method to attach JWT token stored during login
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('token'); // Replace 'token' if stored under a different key
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getAllStudents(): Observable<StudentsResponse> {
    return this.http.get<StudentsResponse>(this.apiUrl, this.getAuthHeaders());
  }

  getStudentById(id: string): Observable<{ success: boolean; data: Student }> {
    return this.http.get<{ success: boolean; data: Student }>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  createStudent(student: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, student, this.getAuthHeaders());
  }

  updateStudent(studentCode: string, student: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${studentCode}`, student, this.getAuthHeaders());
  }

  deleteStudent(studentCode: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${studentCode}`, this.getAuthHeaders());
  }

  getStudentByCode(studentCode: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/code`, { studentCode }, this.getAuthHeaders());
  }
}
