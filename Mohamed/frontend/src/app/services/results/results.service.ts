import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  private apiUrl = 'http://localhost:3000/api/v1/results';

  constructor(private http: HttpClient) {}

  getAllResults(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getResultById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getResultsByStudent(studentCode: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/student/${studentCode}`
    );
  }

  getResultsByExam(examId: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/exam/${examId}`
    );
  }

  createResult(result: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      result
    );
  }

  updateResult(id: string, result: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      result
    );
  }

  deleteResult(id: string): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }
}