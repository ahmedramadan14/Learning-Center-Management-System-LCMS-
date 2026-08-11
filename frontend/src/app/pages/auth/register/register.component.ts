import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({ selector: 'app-register', templateUrl: './register.component.html', styleUrls: ['./register.component.css'] })
export class RegisterComponent {
  submitting = false;
  errorMessage = '';
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.submitting) return;
    this.submitting = true; this.errorMessage = '';
    const value = form.value as Record<string, unknown>;
    const payload: Record<string, unknown> = { name: value['name'], phone: value['phone'], email: value['email'], password: value['password'], role: value['role'] };
    if (value['role'] === 'student') { payload['gender'] = value['gender']; payload['grade'] = value['grade']; payload['parentPhone'] = value['parentPhone']; }
    this.auth.register(payload).subscribe({
      next: (response) => { this.submitting = false; this.router.navigate([response.token ? '/dashboard' : '/login'], { state: { registered: true } }); },
      error: (error: { error?: { message?: string } }) => { this.submitting = false; this.errorMessage = error.error?.message || 'Could not create your account.'; }
    });
  }
}
