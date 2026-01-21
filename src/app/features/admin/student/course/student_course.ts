import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedTableComponent} from '../../../../shared/table/table';
import {ActivatedRoute, Router} from '@angular/router';
import {StudentCourseService} from '../../../../core/services/student_course.service';
import {StudentCourse} from '../../../../core/models/student_course.model';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-admin-course',
  templateUrl: './student_course.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../shared/table/table.css',
    './student_course.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent, ReactiveFormsModule]
})
export class AdminStudentCourseComponent implements OnInit {
  studentCourse: StudentCourse[] = [];
  loading = true;
  tableColumns = [
    { key: 'name', label: 'Matakuliah' },
    { key: 'code', label: 'Kode' }
  ];
  nim: string = ""
  name: string = ""

  // DELETE STATE
  showDeleteModal = false;
  selectedStudentCourse: any = null;
  deleteLoading = false;

  constructor(
    private studentCourseService: StudentCourseService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef,
    private route : ActivatedRoute
  ) {}

  ngOnInit() { this.loadCourses(); }

  loadCourses() {
    this.setNim();
    this.studentCourseService.getEnrollCourse(this.nim).subscribe(res => {
      this.studentCourse = res.data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  setNim() {
    this.route.queryParams.subscribe(param => {
      if (param['nim']) {
        this.nim = param['nim'];
        this.name = param['name'];
      } else {
        this.router.navigate([`/admin/student`])
      }
    })
  }

  createStudentCourse() {
    this.router.navigate([`/admin/student/course/create`], {
      queryParams: {
        "nim": this.nim,
        "name": this.name
      }
    });
  }

  deleteStudentCourse(studentCourse: any) {
    this.selectedStudentCourse = studentCourse;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedStudentCourse) return;
    console.log('confirmDelete:', this.selectedStudentCourse);
    this.deleteLoading = true;
    this.studentCourseService.deleteEnrollCourse(this.selectedStudentCourse.id)
      .pipe(
        finalize(() => {
          this.closeDeleteModal()
          this.ngOnInit()
        })
      )
      .subscribe()
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedStudentCourse = null;
    this.deleteLoading = false;
  }

  protected back() {
    this.router.navigate([`/admin/student`])
  }
}
