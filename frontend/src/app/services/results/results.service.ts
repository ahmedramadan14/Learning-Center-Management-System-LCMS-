import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  constructor(private readonly api: ApiService) {}

  getAllResults(): Observable<any> {
    return this.api.get<any>('/results');
  }

  getResultById(id: string): Observable<any> {
    return this.api.get<any>(`/results/${id}`);
  }

  getResultsByStudent(studentCode: string): Observable<any> {
    return this.api.get<any>(`/results/student/${studentCode}`);
  }

  getResultsByExam(examId: string): Observable<any> {
    return this.api.get<any>(`/results/exam/${examId}`);
  }

  createResult(result: any): Observable<any> {
    return this.api.post<any>('/results', result);
  }

  updateResult(id: string, result: any): Observable<any> {
    return this.api.put<any>(`/results/${id}`, result);
  }

  deleteResult(id: string): Observable<any> {
    return this.api.delete<any>(`/results/${id}`);
  }
}
