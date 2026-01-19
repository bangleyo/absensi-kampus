import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {finalize} from 'rxjs';
import {CourseService} from '../../../../core/services/course.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Course} from '../../../../core/models/course.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrls: [
    './create.css',
    '../../../../../styles/shared/header.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CreateCourseComponent implements OnInit {
  formData: Course = { id: 0, name: '', code: '' };
  mode: Mode = 'create';  // Default create
  @ViewChild('nameCodeForm') nameCodeForm!: NgForm;

  constructor(
    private cdr: ChangeDetectorRef,
    private courseService : CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.formData.id = params['id'];
        this.formData.code = params['code'];
        this.formData.name = params['name'];
        this.mode = 'edit'
        this.cdr.detectChanges()
      }
    });
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
    try {
      this.courseService.addCourse(this.formData.name, this.formData.code)
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
