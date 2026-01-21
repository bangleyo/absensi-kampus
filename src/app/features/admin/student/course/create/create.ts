import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {finalize} from 'rxjs';
import {CourseService} from '../../../../../core/services/course.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Course} from '../../../../../core/models/course.model';
import {StudentCourseService} from '../../../../../core/services/student_course.service';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrls: [
    './create.css',
    '../../../../../../styles/shared/header.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CreateStudentCourseComponent implements OnInit {
  formData: Course | any;
  mode: Mode = 'create';  // Default create
  @ViewChild('nameCodeForm') nameCodeForm!: NgForm;
  course: Course[] | any;
  nim: string | any;
  name: string | any;

  constructor(
    private cdr: ChangeDetectorRef,
    private courseService : CourseService,
    private studentCourseService : StudentCourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['nim']) {
        this.nim = params['nim']
        this.name = params['name']
        this.cdr.detectChanges()
      }
    });
    this.courseService.getCourses().subscribe(data => {
      if (data.status === 'success') {
        this.course = data.data;
        this.cdr.detectChanges()
      }
    })
  }

  resetForm(): void {
    this.nameCodeForm.resetForm();
    this.formData = { id: 0, name: '', code: '' };
    this.cdr.detectChanges()
  }

  protected onNameCodeSubmit(form: NgForm) {
    this.mode === 'create' ? this.addCourse() : this.updateCourse();
  }

  private async addCourse(): Promise<void> {
    this.studentCourseService.enrollCourse(this.nim, this.formData.id)
      .pipe(
        finalize(() => {
          this.router.navigate(['/admin/student/course'], {
            queryParams: {
              nim: this.nim,
              name: this.name
            }
          });
        })
      )
      .subscribe()
  }

  private updateCourse(): void {
    try {
      this.courseService.updateCourse(this.formData.id, this.formData.name, this.formData.code)
        .pipe(
          finalize(() => {
            this.router.navigate(['/admin/course']);
          })
        )
        .subscribe()
    } catch (error: any) {
      console.log(error);
    }
  }

  protected back() {
    this.router.navigate(['/admin/course']);
  }
}
