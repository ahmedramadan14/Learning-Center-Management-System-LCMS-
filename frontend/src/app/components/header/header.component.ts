import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() menuToggled = new EventEmitter<void>();

  searchText = '';

  userName = 'Admin';
  userRole = 'Administrator';

  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.userName = user.name;
    this.userRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }
}
