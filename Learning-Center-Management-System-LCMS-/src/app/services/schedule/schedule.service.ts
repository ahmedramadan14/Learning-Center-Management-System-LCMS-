import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ScheduleBackend {
  _id?: string;
  className?: string;
  subject?: string;
  teacherId?: string;
  groupId?: string;
  day?: string;
  type: string;        // 'weekly' or 'extra'
  startTime: string;   // 'HH:mm'
  endTime: string;     // 'HH:mm'
  room?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getSchedules(): Observable<any> {
    return this.http.get(`${this.baseUrl}/schedules`, this.getAuthOptions());
  }

  getScheduleById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/schedules/${id}`, this.getAuthOptions());
  }

  createSchedule(data: Partial<ScheduleBackend>): Observable<any> {
    return this.http.post(`${this.baseUrl}/schedules`, data, this.getAuthOptions());
  }

  updateSchedule(id: string, data: Partial<ScheduleBackend>): Observable<any> {
    return this.http.put(`${this.baseUrl}/schedules/${id}`, data, this.getAuthOptions());
  }

  deleteSchedule(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/schedules/${id}`, this.getAuthOptions());
  }

  getTeachers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/teachers`, this.getAuthOptions());
  }

  getGroups(): Observable<any> {
    return this.http.get(`${this.baseUrl}/groups`, this.getAuthOptions());
  }
}
