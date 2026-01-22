import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {finalize} from 'rxjs';

import {SharedTableComponent} from '../../../../shared/table/table';
import {StudentCourseService} from '../../../../core/services/student_course.service';
import {StudentCourse} from '../../../../core/models/student_course.model';

@Component({
  selector: 'app-admin-student-course',
  templateUrl: './student_course.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../shared/table/table.css',
    '../../../../../styles/shared/admin-pages.css'
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStudentCourseComponent implements OnInit {
  studentCourses: StudentCourse[] = [];
  loading = true;

  nim: string = "";
  name: string = "";

  tableColumns = [
    { key: 'name', label: 'Matakuliah' },
    { key: 'code', label: 'Kode' }
  ];

  showDeleteModal = false;
  selectedStudentCourse: any = null;
  deleteLoading = false;

  toastState = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  };

  constructor(
    private studentCourseService: StudentCourseService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  private initData(): void {
    this.route.queryParams.subscribe(params => {
      if (params['nim'] && params['name']) {
        this.nim = params['nim'];
        this.name = params['name'];
        this.loadCourses();
      } else {
        this.back();
      }
    });
  }

  loadCourses(): void {
    this.loading = true;
    this.studentCourseService.getEnrollCourse(this.nim)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.studentCourses = res.data || [];
        },
        error: (err) => {
          console.error('Gagal memuat matakuliah mahasiswa:', err);
          this.showToast('Gagal memuat data.', 'error');
        }
      });
  }

  createStudentCourse(): void {
    this.router.navigate(['/admin/student/course/create'], {
      queryParams: {
        "nim": this.nim,
        "name": this.name
      }
    });
  }

  back(): void {
    this.router.navigate(['/admin/student']);
  }

  deleteStudentCourse(item: any): void {
    this.selectedStudentCourse = item;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedStudentCourse) return;

    this.deleteLoading = true;
    this.cdr.detectChanges();

    this.studentCourseService.deleteEnrollCourse(this.selectedStudentCourse.id)
      .pipe(
        finalize(() => {
          this.deleteLoading = false;
          this.closeDeleteModal();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showToast('Matakuliah berhasil dihapus dari KRS!', 'success');
          this.loadCourses();
        },
        error: (err) => {
          console.error('Gagal menghapus matakuliah:', err);
          this.showToast('Gagal menghapus data.', 'error');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedStudentCourse = null;
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
