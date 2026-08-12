import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  error = '';
  credentials = {
    phone: '',
    password: ''
  };

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.auth.login(this.credentials.phone.trim(), this.credentials.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'Unable to sign in. Please verify your phone and password.';
      }
    });
  }
}
