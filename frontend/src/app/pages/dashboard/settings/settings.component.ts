import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api/api.service';
import { AuthService, AuthUser } from '../../../services/auth/auth.service';

interface UserResponse { data: Partial<AuthUser>; }

@Component({ selector: 'app-settings', templateUrl: './settings.component.html', styleUrls: ['./settings.component.css'] })
export class SettingsComponent implements OnInit {
  model = { name: '', email: '', phone: '' };
  role = '';
  saving = false;
  message = '';
  error = '';

  constructor(private readonly api: ApiService, readonly auth: AuthService) {}
  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user) this.setUser(user);
    this.api.get<UserResponse>('/users/getMe').subscribe({ next: (response) => this.setUser(response.data) });
  }
  save(): void {
    this.saving = true; this.error = ''; this.message = '';
    this.api.put<UserResponse>('/users/updateMe', this.model).subscribe({
      next: (response) => { this.saving = false; this.setUser(response.data); this.message = 'Profile saved successfully.'; },
      error: (error: { error?: { message?: string } }) => { this.saving = false; this.error = error.error?.message || 'Could not update your profile.'; }
    });
  }

  initials(name: string): string {
    return (name || 'User').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  roleLabel(role: string): string {
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  }

  private setUser(user: Partial<AuthUser>): void {
    this.model = { name: user.name || this.model.name, email: user.email || '', phone: user.phone || this.model.phone };
    this.role = user.role || this.role;
    this.auth.updateCurrentUser(user);
  }
}
