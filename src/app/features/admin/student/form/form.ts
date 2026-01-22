import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

// Services & Models
import { StudentService } from '../../../../core/services/student.service';
// Jika Student model belum ada field 'major', Anda bisa gunakan 'any' sementara atau update modelnya
import { Student } from '../../../../core/models/student.model';

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

  // Extend interface Student secara lokal jika model belum diupdate
  formData: any = { id: 0, nim: '', name: '', major: null };

  mode: Mode = 'create';
  isLoading = false;

  // List Jurusan (Hardcoded / Enum Style)
  majors: string[] = [
    'Teknik Informatika',
    'Sistem Informasi'
  ];

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
          // Pastikan parameter query juga mengirim 'major' jika ingin auto-populate saat edit
          major: params['major'] || null
        };
        this.cdr.detectChanges();
      }
    });
  }

  // --- ACTIONS ---

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.mode === 'create' ? this.createStudent() : this.updateStudent();
  }

  resetForm(): void {
    this.studentForm.resetForm();
    // Reset ke default value
    this.formData = { id: 0, nim: '', name: '', major: null };
    this.mode = 'create';
    this.cdr.detectChanges();
  }

  back(): void {
    this.router.navigate(['/admin/student']);
  }

  // --- API CALLS ---

  private createStudent(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Update argumen createStudent sesuai kebutuhan backend (tambahkan parameter major)
    this.studentService.createStudent(this.formData.name, this.formData.nim, this.formData.major)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/student']);
        },
        error: (err) => {
          console.error('Gagal membuat student:', err);
          alert('Gagal menambah mahasiswa. Pastikan NIM belum terdaftar.');
        }
      });
  }

  private updateStudent(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    // Update argumen updateStudent sesuai kebutuhan backend
    this.studentService.updateStudent(this.formData.id, this.formData.name, this.formData.nim, this.formData.major)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/student']);
        },
        error: (err) => {
          console.error('Gagal update student:', err);
          alert('Gagal memperbarui data mahasiswa.');
        }
      });
  }
}
