import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// Components & Services
import { SharedTableComponent } from '../../../shared/table/table';
import { Student } from '../../../core/models/student.model';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-admin-student',
  templateUrl: './student.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    '../../../../styles/shared/admin-pages.css'
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStudentComponent implements OnInit {
  // Data State
  students: Student[] = [];
  loading = true;

  // Table Configuration
  tableColumns = [
    { key: 'name', label: 'Nama Lengkap' },
    { key: 'nim', label: 'NIM' },
    { key: 'major', label: 'Program Studi' }, // <-- KOLOM BARU DITAMBAHKAN
  ];

  // Delete Modal State
  showDeleteModal = false;
  selectedStudent: Student | null = null;
  deleteLoading = false;

  constructor(
    private studentService: StudentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  /**
   * Load data mahasiswa dari API
   */
  loadStudents(): void {
    this.loading = true;
    this.studentService.getStudents()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.students = res.data || [];
        },
        error: (err) => {
          console.error('Gagal memuat data mahasiswa:', err);
        }
      });
  }

  // --- ACTIONS ---

  createStudent(): void {
    this.router.navigate(['/admin/student/form']);
  }

  editStudent(item: any): void {
    this.router.navigate(['/admin/student/form'], {
      queryParams: {
        id: item.id,
        name: item.name,
        nim: item.nim,
        major: item.major // Pastikan major juga dikirim saat edit
      }
    });
  }

  studentCourse(item: any): void {
    this.router.navigate(['/admin/student/course'], {
      queryParams: {
        nim: item.nim,
        name: item.name,
      }
    });
  }

  // --- DELETE LOGIC ---

  deleteStudent(item: any): void {
    this.selectedStudent = item;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedStudent) return;

    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.studentService.deleteStudent(this.selectedStudent.id)
      .pipe(
        finalize(() => {
          this.deleteLoading = false;
          this.closeDeleteModal();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.loadStudents();
        },
        error: (err) => {
          console.error('Gagal menghapus mahasiswa:', err);
          alert('Gagal menghapus data mahasiswa.');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedStudent = null;
  }
}
