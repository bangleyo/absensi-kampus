import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    const savedUsername = localStorage.getItem('savedUsername');
    if (savedUsername) {
      this.loginForm.patchValue({ username: savedUsername, remember: true });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Mohon isi username dan kata sandi dengan benar.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, password, remember } = this.loginForm.value;

    this.authService.login({ username, password })
      .pipe(
        finalize(() => {
          // finalize tidak digunakan untuk set isLoading = false disini
          // karena kita mau loading tetap jalan saat delay redirect sukses
          // kita handle manual di error block
        })
      )
      .subscribe({
        next: () => {
          this.handleSuccess(username, remember);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Username atau kata sandi salah.';
          this.loginForm.get('password')?.reset();
        }
      });
  }

  private handleSuccess(username: string, remember: boolean): void {
    this.successMessage = 'Login Berhasil! Mengalihkan...';

    // Handle "Remember Me"
    if (remember) {
      localStorage.setItem('savedUsername', username);
    } else {
      localStorage.removeItem('savedUsername');
    }

    // Delay sedikit untuk UX, lalu redirect sesuai Role
    setTimeout(() => {
      this.navigateByRole();
    }, 1500);
  }

  private navigateByRole(): void {
    const user = this.authService.getUser();
    const role = user?.role?.toUpperCase(); // Jaga-jaga case sensitive

    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'STUDENT':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']); // Fallback route
        break;
    }

    // Matikan loading setelah navigasi dimulai
    this.isLoading = false;
  }
}
