import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {finalize} from 'rxjs';

import {UserService} from '../../core/services/user.service';
import {MatchDirective} from './match.directive';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: [
    '../../../styles/shared/header.css',
    './profile.css',
    '../../../styles/shared/admin-pages.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, MatchDirective]
})
export class ProfileComponent {
  @ViewChild('passwordForm') passwordForm!: NgForm;

  // Form state
  status: FormStatus = 'idle';
  statusMessage = '';

  // Form data model
  formData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Visibility Toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  /**
   * Submit form handler.
   */
  onPasswordChange(form: NgForm): void {
    if (form.invalid) {
      this.setStatus('error', 'Mohon lengkapi form dengan benar.');
      return;
    }
    this.changePassword();
  }

  /**
   * Reset form dan state visual.
   * Menggunakan NgForm.resetForm() alih-alih DOM manipulation.
   */
  resetForm(): void {
    this.passwordForm.resetForm();

    this.formData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    this.resetVisibility();
    this.setStatus('idle', '');
  }

  /**
   * Toggle visibility password dinamis.
   * Menggunakan index signature type-safe.
   */
  togglePasswordVisibility(type: 'current' | 'new' | 'confirm'): void {
    const prop = `show${this.capitalize(type)}Password` as keyof this;
    // TypeScript trick untuk toggle boolean property dynamic
    (this as any)[prop] = !(this as any)[prop];
  }

  private changePassword(): void {
    this.setStatus('loading', 'Mengubah password...');

    this.userService.changePassword(this.formData)
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.setStatus('success', 'Password berhasil diubah!');
          setTimeout(() => this.resetForm(), 2000);
        },
        error: (err) => {
          const errMsg = err.error?.data?.message || err.error?.message || 'Gagal mengubah password';
          this.setStatus('error', errMsg);
        }
      });
  }

  private setStatus(status: FormStatus, message: string): void {
    this.status = status;
    this.statusMessage = message;
    this.cdr.markForCheck();
  }

  private resetVisibility(): void {
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
