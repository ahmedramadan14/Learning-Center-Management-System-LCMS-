import { Injectable } from '@angular/core';

export interface CurrentUser {
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUser: CurrentUser | null = null;

  constructor() {}

  setCurrentUser(user: CurrentUser): void {
    this.currentUser = user;
  }

  getCurrentUser(): CurrentUser | null {
    return this.currentUser;
  }

  clearCurrentUser(): void {
    this.currentUser = null;
  }
}