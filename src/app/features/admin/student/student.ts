import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {finalize} from 'rxjs';

import {SharedTableComponent} from '../../../shared/table/table';
import {Student} from '../../../core/models/student.model';
import {StudentService} from '../../../core/services/student.service';

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
  students: Student[] = [];
  loading = true;

  tableColumns = [
    { key: 'name', label: 'Nama Lengkap' },
    { key: 'nim', label: 'NIM' },
    { key: 'major', label: 'Program Studi' },
  ];

  showDeleteModal = false;
  selectedStudent: Student | null = null;
  deleteLoading = false;

  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private studentService: StudentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

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
          this.showToast('Gagal memuat data mahasiswa.', 'error');
        }
      });
  }

  createStudent(): void {
    this.router.navigate(['/admin/student/form']);
  }

  editStudent(item: any): void {
    this.router.navigate(['/admin/student/form'], {
      queryParams: {
        id: item.id,
        name: item.name,
        nim: item.nim,
        major: item.major
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
          this.showToast('Data mahasiswa berhasil dihapus!', 'success');
          this.loadStudents();
        },
        error: (err) => {
          console.error('Gagal menghapus mahasiswa:', err);
          this.showToast('Gagal menghapus data mahasiswa.', 'error');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedStudent = null;
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
