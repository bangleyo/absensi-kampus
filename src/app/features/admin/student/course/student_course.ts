import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

// Components & Services
import { SharedTableComponent } from '../../../../shared/table/table';
import { StudentCourseService } from '../../../../core/services/student_course.service';
import { StudentCourse } from '../../../../core/models/student_course.model';

@Component({
  selector: 'app-admin-student-course', // Selector diperbaiki (unik)
  templateUrl: './student_course.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',      // Header Style
    '../../../../shared/table/table.css',           // Table Style
    '../../../../../styles/shared/admin-pages.css'  // Shared Admin Style
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStudentCourseComponent implements OnInit {
  // Data State
  studentCourses: StudentCourse[] = []; // Renamed to plural
  loading = true;

  // Student Info from Params
  nim: string = "";
  name: string = "";

  // Table Config
  tableColumns = [
    { key: 'name', label: 'Matakuliah' },
    { key: 'code', label: 'Kode' }
  ];

  // Delete State
  showDeleteModal = false;
  selectedStudentCourse: any = null;
  deleteLoading = false;

  constructor(
    private studentCourseService: StudentCourseService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  /**
   * Inisialisasi data berdasarkan Query Params
   */
  private initData(): void {
    this.route.queryParams.subscribe(params => {
      if (params['nim'] && params['name']) {
        this.nim = params['nim'];
        this.name = params['name'];
        this.loadCourses();
      } else {
        // Jika tidak ada param NIM, kembali ke list mahasiswa
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
        }
      });
  }

  // --- ACTIONS ---

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

  // --- DELETE LOGIC ---

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
          // Reload data setelah hapus berhasil
          this.loadCourses();
        },
        error: (err) => {
          console.error('Gagal menghapus matakuliah:', err);
          alert('Gagal menghapus data.');
        }
      });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedStudentCourse = null;
  }
}
