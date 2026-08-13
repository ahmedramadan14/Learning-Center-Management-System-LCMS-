import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  constructor(private readonly api: ApiService) {}

  getAllTeachers(): Observable<any> {
    return this.api.get('/teachers');
  }

  getTeacherById(id: string): Observable<any> {
    return this.api.get(`/teachers/${id}`);
  }

  createTeacher(teacher: any): Observable<any> {
    return this.api.post('/teachers', teacher);
  }

  updateTeacher(id: string, teacher: any): Observable<any> {
    return this.api.patch(`/teachers/${id}`, teacher);
  }

  deleteTeacher(id: string): Observable<any> {
    return this.api.delete(`/teachers/${id}`);
  }

  approveTeacher(id: string): Observable<any> {
    return this.api.patch(`/teachers/${id}/approve`, {});
  }

  activateTeacher(id: string): Observable<any> {
    return this.api.patch(`/teachers/${id}/activate`, {});
  }

  deactivateTeacher(id: string): Observable<any> {
    return this.api.patch(`/teachers/${id}/deactivate`, {});
  }
}
