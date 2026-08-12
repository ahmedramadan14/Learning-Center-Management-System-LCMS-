import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      phone: form.value.phone,
      password: form.value.password
    };

    this.authService.login(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        // التوجيه للوحة التحكم بعد النجاح
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        this.isLoading = false;
        // استقبال رسالة الخطأ القادمة من ApiError في الباك إند
        this.errorMessage = err.error?.message || 'Invalid phone or password. Please try again.';
      }
    });
  }
}