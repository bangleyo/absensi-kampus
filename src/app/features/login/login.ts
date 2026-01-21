import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Mohon isi email dan kata sandi dengan benar.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Login Berhasil!';

        // 1. Simpan Data dari format: res.data.token
        if (res.status === 'success' && res.data) {

          const expiryTime = Date.now() + (30 * 60 * 1000);
          const sessionData = {
            role: res.data.role,
            username : res.data.username,
            name : res.data.name,
            nim : res.data.nim,
            major : res.data.major,
            expiry: expiryTime
          };
          sessionStorage.setItem('nim', res.data.nim);
          sessionStorage.setItem('token', res.data.token);
          sessionStorage.setItem('userSession', JSON.stringify(sessionData));
        }

        if (this.loginForm.value.remember) {
          localStorage.setItem('savedUsername', this.loginForm.value.username); // Pastikan key sesuai dengan formControlName
        } else {
          localStorage.removeItem('savedUsername');
        }

        setTimeout(() => {
          const role = res.data.role;
          if (role === 'ADMIN' || role === 'admin') {
            this.router.navigate(['/admin/dashboard']);  // Admin dashboard
          } else if (role === 'STUDENT' || role === 'student') {
            this.router.navigate(['/dashboard']); // Student dashboard
          } else {
            // Default fallback
            this.router.navigate(['/dashboard']);
          }
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email atau kata sandi salah.';
        this.loginForm.get('password')?.reset();
      }
    });
  }
}

export class Login {
}
