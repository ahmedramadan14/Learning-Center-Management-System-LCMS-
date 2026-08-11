import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  sidebarOpen = true;

  ngOnInit(): void {
    this.sidebarOpen = window.innerWidth > 920;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.sidebarOpen = window.innerWidth > 920;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
