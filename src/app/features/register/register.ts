import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // Validasi agar password dan confirm password sama
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Mohon lengkapi data dengan benar.';
      if (this.registerForm.hasError('mismatch')) {
        this.errorMessage = 'Konfirmasi kata sandi tidak cocok.';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // this.authService.register(this.registerForm.value).subscribe({
    //   next: (res) => {
    //     this.isLoading = false;
    //     this.successMessage = 'Pendaftaran berhasil! Silakan login.';
    //     setTimeout(() => this.router.navigate(['/login']), 2000);
    //   },
    //   error: (err) => {
    //     this.isLoading = false;
    //     this.errorMessage = err.error?.message || 'Gagal melakukan pendaftaran.';
    //   }
    // });
  }
}

export class Register {
}
