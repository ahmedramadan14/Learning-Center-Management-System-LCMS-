import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() menuToggled = new EventEmitter<void>();

  constructor(readonly auth: AuthService) {}

  initials(name: string | undefined): string {
    return (name || 'User').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  roleLabel(role: string | undefined): string {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  }
}
