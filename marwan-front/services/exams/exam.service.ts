import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exam {
  _id?: string;
  name: string;
  subject: string;
  group: string;
  examDate?: string;
  date?: string;
  duration: number;
  status: 'Upcoming' | 'Completed' | 'published';
  totalMarks?: number;
  passingMarks?: number;
  teacher?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {

  private apiUrl = 'http://localhost:3000/api/v1/exams';

  constructor(private http: HttpClient) {}

  createExam(examData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, examData);
  }

  getAllExams(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getExamById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateExam(id: string, examData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, examData);
  }

  deleteExam(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  publishExam(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/publish`, {});
  }
}