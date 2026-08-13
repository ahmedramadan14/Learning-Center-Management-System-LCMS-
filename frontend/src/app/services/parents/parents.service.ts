import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ParentService {
  constructor(private readonly api: ApiService) {}

  getAllParents(): Observable<any> {
    return this.api.get<any>('/parents');
  }

  getParentById(id: string): Observable<any> {
    return this.api.get<any>(`/parents/${id}`);
  }

  createParent(parent: any): Observable<any> {
    return this.api.post<any>('/parents', parent);
  }

  updateParent(id: string, parent: any): Observable<any> {
    return this.api.put<any>(`/parents/${id}`, parent);
  }

  deleteParent(id: string): Observable<any> {
    return this.api.delete<any>(`/parents/${id}`);
  }
}
