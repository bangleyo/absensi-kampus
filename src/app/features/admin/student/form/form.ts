import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, NgForm} from '@angular/forms';
import {finalize} from 'rxjs';
import {CourseService} from '../../../../core/services/course.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Course} from '../../../../core/models/course.model';
import {Student} from '../../../../core/models/student.model';
import {StudentService} from '../../../../core/services/student.service';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrls: [
    './form.css',
    '../../../../../styles/shared/header.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class StudentFormComponent implements OnInit {
  formData: Student = { id: 0, nim: '', name: '' };
  mode: Mode = 'create';  // Default create
  @ViewChild('nameCodeForm') nameCodeForm!: NgForm;

  constructor(
    private cdr: ChangeDetectorRef,
    private studentService : StudentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.formData.id = params['id'];
        this.formData.name = params['name'];
        this.formData.nim = params['nim'];
        this.mode = 'edit'
        this.cdr.detectChanges()
      }
    });
  }

  resetForm(): void {
    this.nameCodeForm.resetForm();
    this.formData = { id: 0, nim: '', name: '' };
    this.cdr.detectChanges()
  }

  protected onNameCodeSubmit(form: NgForm) {
    this.mode === 'create' ? this.addCourse() : this.updateCourse();
  }

  private async addCourse(): Promise<void> {
    try {
      this.studentService.createStudent(this.formData.name, this.formData.nim)
        .pipe(
          finalize(() => {
            this.router.navigate(['/admin/student']);
          })
        )
        .subscribe()
    } catch (error: any) {
      console.log(error);
    }
  }

  private updateCourse(): void {
    try {
      this.studentService.updateStudent(this.formData.id, this.formData.name, this.formData.nim)
        .pipe(
          finalize(() => {
            this.router.navigate(['/admin/student']);
          })
        )
        .subscribe()
    } catch (error: any) {
      console.log(error);
    }
  }

  protected back() {
    this.router.navigate(['/admin/student']);
  }
}
