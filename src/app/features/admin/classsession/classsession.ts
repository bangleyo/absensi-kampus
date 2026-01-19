import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import {SharedTableComponent} from '../../../shared/table/table';
import {Course} from '../../../core/models/course.model';
import {SharedModalComponent} from '../../../shared/modal/modal';
import {CourseService} from '../../../core/services/course.service';
import {Router} from '@angular/router';
import {ModalService} from '../../../core/services/modal.service';
import {finalize} from 'rxjs';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ClassSessionService} from '../../../core/services/class_session.service';
import {ClassSession} from '../../../core/models/class_session.model';
import {QRService} from '../../../core/services/qr.service';

@Component({
  selector: 'app-class-session',
  templateUrl: './classsession.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    './classsession.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent, ReactiveFormsModule]
})
export class ClassSessionComponent  implements OnInit, AfterViewInit {
  classSessions: ClassSession[] = [];
  loading = true;
  @ViewChild('modalRef') modalRef!: SharedModalComponent;
  tableColumns = [
    { key: 'course.name', label: 'Matkul' },
    { key: 'course.code', label: 'Code' },
    { key: 'lecturer', label: 'Dosen' },
    { key: 'place', label: 'Ruangan' },
    { key: 'timeRange', label: 'Jam Masuk' }
  ];

  // DELETE STATE
  showDeleteModal = false;
  selectedClassSession: any = null;
  deleteLoading = false;

  constructor(
    private classSessionService: ClassSessionService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef,
    public modalService: ModalService,
    private qrService : QRService
  ) {}

  ngOnInit() { this.loadCourses(); }

  ngAfterViewInit() {
    // Direct register component instance, bukan VCR
    this.modalService.register(this.modalRef);
    // Pastikan modalRef ada
    console.log('Modal registered:', this.modalRef); // Debug
  }

  loadCourses() {
    this.classSessionService.getClassSession().subscribe(res => {
      this.classSessions = res.data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  createClassSession() {
    this.router.navigate([`/admin/class-session/form`]);
  }
  deleteClassSession(course: any) {
    this.selectedClassSession = course;
    this.showDeleteModal = true;
  }
  editClassSession(classSessions: any) {
    this.router.navigate([`/admin/class-session/form`], {
      queryParams: {
        id: classSessions.id
      }
    });
  }

  confirmDelete(): void {
    // if (!this.selectedClassSession) return;
    // console.log('confirmDelete:', this.selectedClassSession);
    // this.deleteLoading = true;
    // this.classSessions.deleteCourse(this.selectedClassSession.id)
    //   .pipe(
    //     finalize(() => {
    //       this.closeDeleteModal()
    //       this.ngOnInit()
    //     })
    //   )
    //   .subscribe()
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedClassSession = null;
    this.deleteLoading = false;
  }

  protected downloadQR(item: any) {
    this.qrService.downloadQr(item.qrToken).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;

        link.download = `QR_Code_${item.course.name}${item.course.code}.png`;

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.ngOnInit();
      },
      error: (err) => {
        console.error('Download gagal:', err);
        alert('Gagal mendownload QR Code. Pastikan server merespon dengan benar.');
      }
    })
  }
}
