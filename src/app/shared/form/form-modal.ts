import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-group mb-3">
      <label *ngIf="label" class="form-label fw-bold">{{ label }}</label>
      <input
        [formControl]="control"
        [type]="type"
        [placeholder]="placeholder"
        class="form-control"
        [class.is-invalid]="control?.invalid && (control?.dirty || control?.touched)">
      <div *ngIf="control?.invalid && (control?.dirty || control?.touched)" class="invalid-feedback">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styleUrls: [
    '../modal/modal.css'
  ],
})
export class FormModalComponent {
  @Input() label?: string;
  @Input() control: any;
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() errorMessage = 'Field tidak valid';
}
