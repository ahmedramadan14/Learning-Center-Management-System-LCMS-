import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private readonly api: ApiService) {}

  getAllStudents(): Observable<any> {
    return this.api.get<any>('/students');
  }

  getStudentById(id: string): Observable<any> {
    return this.api.get<any>(`/students/${id}`);
  }

  createStudent(student: any): Observable<any> {
    return this.api.post<any>('/students', student);
  }

  updateStudent(studentCode: string, student: any): Observable<any> {
    return this.api.patch<any>(`/students/${studentCode}`, student);
  }

  deleteStudent(studentCode: string): Observable<any> {
    return this.api.delete<any>(`/students/${studentCode}`);
  }

  getStudentByCode(studentCode: string): Observable<any> {
    return this.api.post<any>('/students/code', { studentCode });
  }
}
