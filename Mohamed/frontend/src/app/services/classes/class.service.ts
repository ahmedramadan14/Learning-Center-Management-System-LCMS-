import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClassService {

  private apiUrl =
    'http://localhost:3000/api/v1/groups';

  constructor(
    private http: HttpClient
  ) {}

  // GET ALL GROUPS
  getGroups(): Observable<any> {

    return this.http.get<any>(
      this.apiUrl,
      {
        withCredentials: true
      }
    );

  }

  // GET GROUP BY ID
  getGroupById(
    id: string
  ): Observable<any> {

    return this.http.get<any>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );

  }

  // CREATE GROUP
  createGroup(
    group: any
  ): Observable<any> {

    return this.http.post<any>(
      this.apiUrl,
      group,
      {
        withCredentials: true
      }
    );

  }

  // UPDATE GROUP
  updateGroup(
    id: string,
    group: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      group,
      {
        withCredentials: true
      }
    );

  }

  // DELETE GROUP
  deleteGroup(
    id: string
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      {
        withCredentials: true
      }
    );

  }

}