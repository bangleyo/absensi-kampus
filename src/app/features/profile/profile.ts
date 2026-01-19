import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {MatchDirective} from './match.directive';
import {UserService} from '../../core/services/user.service';
import {finalize} from 'rxjs';
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, FormsModule, MatchDirective]
})
export class ProfileComponent implements OnInit {
  // Form state
  status: FormStatus = 'idle';
  statusMessage = '';

  // Form data
  formData: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserSession();
  }

  // ========== PUBLIC METHODS ==========

  /**
   * Submit form - validate then call API.
   */
  onPasswordChange(form: NgForm): void {
    if (form.invalid) {
      this.setStatus('error', 'Mohon lengkapi form dengan benar.');
      return;
    }
    this.changePassword();
  }

  /**
   * Reset form inputs dan validation state.
   */
  resetForm(): void {
    // Native form reset
    const form = document.querySelector('form.change-password-form') as HTMLFormElement;
    form?.reset();

    // Clear data
    this.formData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.resetVisibility();
    this.cdr.detectChanges();
  }

  /**
   * Toggle password visibility untuk field tertentu.
   */
  togglePasswordVisibility(type: 'current' | 'new' | 'confirm'): void {
    (this as any)[`show${this.capitalize(type)}Password`] =
      !(this as any)[`show${this.capitalize(type)}Password`];
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Check session validity, redirect if invalid.
   */
  private checkUserSession(): void {
    if (!sessionStorage.getItem('userSession')) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Call password change API.
   */
  private async changePassword(): Promise<void> {
    this.setStatus('loading', 'Mengubah password...');

    try {
      this.userService.changePassword(this.formData)
        .pipe(
          finalize(() => {
            this.resetForm();
          })
        )
        .subscribe({
          next: result => {
            this.setStatus('success', 'Password berhasil diubah!');
          },
          error: error => {
            this.setStatus('error', error.error.data.message);
          }
        })
    } catch (error: any) {
      console.error('Change password error:', error);
      this.setStatus('error', error.error?.message || 'Server error');
    }
  }

  /**
   * Reset semua password visibility ke hidden.
   */
  private resetVisibility(): void {
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  /**
   * Update status dengan change detection.
   */
  private setStatus(status: FormStatus, message: string): void {
    this.status = status;
    this.statusMessage = message;
    this.cdr.markForCheck();
  }

  /**
   * Utility: Capitalize string first letter.
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Mock delay untuk testing.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
