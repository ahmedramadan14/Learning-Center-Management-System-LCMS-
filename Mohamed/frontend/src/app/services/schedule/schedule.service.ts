import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = 'http://localhost:3000/api/v1/schedules';

  constructor(private http: HttpClient) {}

  getSchedules(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );
  }

  getScheduleById(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }

  createSchedule(schedule: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      schedule,
      {
        withCredentials: true
      }
    );
  }

  updateSchedule(id: string, schedule: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      schedule,
      {
        withCredentials: true
      }
    );
  }

  deleteSchedule(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );
  }
}