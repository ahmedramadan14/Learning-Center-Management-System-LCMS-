import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Result {
  _id?: string;
  exam: string | any;
  student: string | any;
  studentCode?: string;
  marks: number;
  isPassed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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
    return this.http.get<any>(`${this.apiUrl}/student/${studentCode}`);
  }

  getResultsByExam(examId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/exam/${examId}`);
  }

  createResult(resultData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, resultData);
  }

  updateResult(id: string, resultData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, resultData);
  }

  deleteResult(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}