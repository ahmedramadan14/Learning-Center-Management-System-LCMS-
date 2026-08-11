import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({ selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.css'] })
export class LoginComponent {
  showPassword = false;
  submitting = false;
  errorMessage = '';
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.submitting) return;
    this.submitting = true; this.errorMessage = '';
    this.auth.login(form.value.phone as string, form.value.password as string).subscribe({
      next: () => { this.submitting = false; this.router.navigate(['/dashboard']); },
      error: (error: { error?: { message?: string } }) => { this.submitting = false; this.errorMessage = error.error?.message || 'Unable to sign in. Please check your phone number and password.'; }
    });
  }
}
