import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registration = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    grade: '',
    gender: '',
    parentPhone: '',
    terms: false
  };
  saving = false;
  error = '';
  message = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  onRoleChange(): void {
    if (this.registration.role !== 'student') {
      this.registration.grade = '';
      this.registration.gender = '';
      this.registration.parentPhone = '';
    }
  }

  onSubmit(): void {
    if (this.saving) return;

    this.error = '';
    this.message = '';

    if (this.registration.password !== this.registration.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }

    if (!this.registration.terms) {
      this.error = 'Please accept the terms and conditions.';
      return;
    }

    const { confirmPassword, terms, ...registrationData } = this.registration;
    const payload: Record<string, unknown> = {
      ...registrationData,
      name: registrationData.name.trim(),
      phone: registrationData.phone.trim()
    };
    if (!registrationData.email.trim()) delete payload['email'];
    this.saving = true;

    this.auth.signup(payload).subscribe({
      next: (response) => {
        this.saving = false;

        if (response.token) {
          this.router.navigate(['/dashboard']);
          return;
        }

        this.message = response.message || 'Account created successfully. Please wait for admin approval.';
      },
      error: (error) => {
        this.saving = false;
        this.error = error.error?.message || 'Unable to create your account. Please try again.';
      }
    });
  }
}
