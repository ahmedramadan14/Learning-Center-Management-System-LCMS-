import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() pageTitle: string = 'Dashboard';
  @Input() currentUser: any = null; // التعديل الجديد لجلب بيانات المستخدم

  @Output() toggleSidebarEvent = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    // لو الكود القديم بيجيب البيانات من LocalStorage/AuthService احتفظ بيه هنا:
    if (!this.currentUser) {
      const user = localStorage.getItem('user');
      if (user) {
        this.currentUser = JSON.parse(user);
      }
    }
  }

  toggleSidebar(): void {
    this.toggleSidebarEvent.emit();
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/login';
  }
}