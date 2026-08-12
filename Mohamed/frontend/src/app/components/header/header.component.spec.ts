import { Component, OnInit } from '@angular/core';

export interface User {
  name: string;
  role: string;
  email?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUser: User = {
    name: 'User',
    role: 'Guest'
  };

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    // جلب بيانات المستخدم المخزنة أثناء الـ Login
    const savedUser = localStorage.getItem('user'); // أو حسب الاسم المخزن لديك في الـ LocalStorage
    
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }

  // دالة لحساب الأحرف الأولى للـ Profile Avatar
  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.name) return 'U';
    
    const names = this.currentUser.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }
}