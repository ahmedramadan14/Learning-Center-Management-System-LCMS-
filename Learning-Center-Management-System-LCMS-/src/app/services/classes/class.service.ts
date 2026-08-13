import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GroupBackend {
  _id?: string;
  groupName: string;
  gradeLevelId: { _id: string; name?: string } | string;
  teacherId?: { _id: string; fullName?: string; name?: string; userId?: any } | string;
  maxCapacity?: number;
  sessionPrice?: number;
  sessionsPerCycle?: number;
  isActive?: boolean;
  studentsCount?: number;
  schedule?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private baseUrl = 'http://localhost:5000/api/v1';

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

  getAllGroups(): Observable<any> {
    return this.http.get(`${this.baseUrl}/groups`, this.getAuthOptions());
  }

  getGroupById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/groups/${id}`, this.getAuthOptions());
  }

  createGroup(groupData: Partial<GroupBackend>): Observable<any> {
    return this.http.post(`${this.baseUrl}/groups`, groupData, this.getAuthOptions());
  }

  updateGroup(id: string, groupData: Partial<GroupBackend>): Observable<any> {
    return this.http.put(`${this.baseUrl}/groups/${id}`, groupData, this.getAuthOptions());
  }

  deleteGroup(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/groups/${id}`, this.getAuthOptions());
  }

  getTeachers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/teachers`, this.getAuthOptions());
  }
}
