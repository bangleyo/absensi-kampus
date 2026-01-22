import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {StudentService} from '../../../../core/services/student.service';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-admin-student-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../../styles/shared/admin-pages.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFormComponent implements OnInit {
  @ViewChild('studentForm') studentForm!: NgForm;

  formData: any = { id: 0, nim: '', name: '', major: null };
  mode: Mode = 'create';
  isLoading = false;

  majors: string[] = [
    'Teknik Informatika',
    'Sistem Informasi'
  ];

  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private studentService: StudentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.mode = 'edit';
        this.formData = {
          id: Number(params['id']),
          name: params['name'] || '',
          nim: params['nim'] || '',
          major: params['major'] || null
        };
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.mode === 'create' ? this.createStudent() : this.updateStudent();
  }

  resetForm(): void {
    this.studentForm.resetForm();
    this.formData = { id: 0, nim: '', name: '', major: null };
    this.mode = 'create';
    this.cdr.detectChanges();
  }

  back(): void {
    this.router.navigate(['/admin/student']);
  }

  private createStudent(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.studentService.createStudent(this.formData.name, this.formData.nim, this.formData.major)
      .subscribe({
        next: () => {
          // Sukses: Toast -> Delay -> Redirect
          this.showToast('Mahasiswa berhasil ditambahkan!', 'success');
          setTimeout(() => {
            this.back();
          }, 1500);
        },
        error: (err) => {
          console.error('Gagal membuat student:', err);
          this.showToast('Gagal menambah mahasiswa. Pastikan NIM belum terdaftar.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private updateStudent(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.studentService.updateStudent(this.formData.id, this.formData.name, this.formData.nim, this.formData.major)
      .subscribe({
        next: () => {
          // Sukses: Toast -> Delay -> Redirect
          this.showToast('Data mahasiswa berhasil diperbarui!', 'success');
          setTimeout(() => {
            this.back();
          }, 1500);
        },
        error: (err) => {
          console.error('Gagal update student:', err);
          this.showToast('Gagal memperbarui data mahasiswa.', 'error');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toastState = { show: true, message, type };
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastState.show = false;
      this.cdr.detectChanges();
    }, 3000);
  }
}
