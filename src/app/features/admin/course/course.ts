import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CourseService} from '../../../core/services/course.service';
import {Course} from '../../../core/models/course.model';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedTableComponent} from '../../../shared/table/table';
import {SharedModalComponent} from '../../../shared/modal/modal';
import {ModalService} from '../../../core/services/modal.service';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';

@Component({
  selector: 'app-admin-course',
  templateUrl: './course.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    './course.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent, ReactiveFormsModule]
})
export class AdminCourseComponent implements OnInit {
  courses: Course[] = [];
  loading = true;
  tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' }
  ];

  // DELETE STATE
  showDeleteModal = false;
  selectedCourse: any = null;
  deleteLoading = false;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef, public modalService: ModalService
) {}

  ngOnInit() { this.loadCourses(); }

  loadCourses() {
    this.courseService.getCourses().subscribe(res => {
      this.courses = res.data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  createCourse() {
    this.router.navigate([`/admin/course/form`]);
  }
  deleteCourse(course: any) {
    this.selectedCourse = course;
    this.showDeleteModal = true;
  }
  editCourse(course: any) {
    this.router.navigate([`/admin/course/form`], {
      queryParams: {
        id: course.id,
        name: course.name,
        code: course.code
      }
    });
  }

  confirmDelete(): void {
    if (!this.selectedCourse) return;
    console.log('confirmDelete:', this.selectedCourse);
    this.deleteLoading = true;
    this.courseService.deleteCourse(this.selectedCourse.id)
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
    this.selectedCourse = null;
    this.deleteLoading = false;
  }
}
