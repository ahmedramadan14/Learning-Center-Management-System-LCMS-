import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = 'http://localhost:3000/api/v1/students';

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getStudentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, student);
  }

  updateStudent(studentCode: string, student: any): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${studentCode}`,
      student
    );
  }

  deleteStudent(studentCode: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${studentCode}`
    );
  }

  getStudentByCode(studentCode: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/code`,
      { studentCode }
    );
  }
}