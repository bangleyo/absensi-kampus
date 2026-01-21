import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassSessionService } from '../../../../core/services/class_session.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../core/models/course.model';
import {ClassSessionForm} from '../../../../core/models/class_session_form.model';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create.html',
  styleUrls: ['./create.css', '../../../../../styles/shared/header.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateClassSessionComponent implements OnInit {
  @ViewChild('sessionForm') sessionForm!: NgForm;
  formData: ClassSessionForm = {
    id: null as any,
    courseId: null as any,
    lecturer: '',
    place: '',
    duration: '',
    startTime: '',
    endTime: '',
    latitude: null as any,
    longitude: null as any,
    isExpired: false,
  };

  courses: Course[] = [];
  mode: 'create' | 'edit' = 'create';
  loading: boolean = true;

  constructor(
    private cdr: ChangeDetectorRef,
    private classSessionService: ClassSessionService,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loadParams();
    this.loadDataCourses();
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.formData.latitude = pos.coords.latitude;
          this.formData.longitude = pos.coords.longitude;
          this.cdr.detectChanges();
          alert('Berhasil! Koordinat GPS telah tersimpan.');
        },
        () => {
          alert('Gagal mengambil lokasi. Pastikan izin lokasi (GPS) di browser aktif.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Browser Anda tidak mendukung fitur lokasi.');
    }
  }

  private loadDataCourses(): void {
    this.courseService.getCourses().subscribe(res => {
      this.courses = res.data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onNameCodeSubmit(form: NgForm): void {
    this.mode === 'create' ? this.addClassSession() : this.updateClassSession();
  }

  resetForm(): void {
    this.sessionForm.resetForm();
    this.formData.latitude = null as any;
    this.formData.longitude = null as any;
    this.cdr.detectChanges();
  }

  private loadParams() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.classSessionService.getClassSessionById(params['id']).subscribe({
          next: (res) => {
            if (res.status === 'success') {
              this.formData = {
                id: res.data.id,
                courseId: res.data.course.id,
                lecturer: res.data.lecturer,
                place: res.data.place,
                startTime: res.data.startTime,
                endTime: res.data.endTime,
                latitude: res.data.latitude,
                longitude: res.data.longitude,
                duration : '',
                isExpired: false,
              };
              this.loading = true;
              this.mode = 'edit';
              console.log(this.formData)
              this.cdr.detectChanges();
            }
          }
        })
      }
    })
  }

  protected back() {
    this.router.navigate(['/admin/class-session']);
  }

  private async addClassSession() {
    this.classSessionService.createClassSession(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/admin/class-session']);
      },
      error: () => alert('Terjadi kesalahan saat menyimpan data.')
    });
  }

  private async updateClassSession() {
    this.classSessionService.updateClassSession(this.formData).subscribe({
      next: () => {
        this.router.navigate(['/admin/class-session']);
      },
      error: () => alert('Terjadi kesalahan saat menyimpan data.')
    });
  }
}
