import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {SharedTableComponent} from '../../../shared/table/table';
import {Student} from '../../../core/models/student.model';
import {StudentService} from '../../../core/services/student.service';
import {Router} from '@angular/router';
import {finalize} from 'rxjs';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-student',
  imports: [
    SharedTableComponent,
    NgIf
  ],
  templateUrl: './student.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    './student.css',
  ],
  standalone: true
})
export class AdminStudentComponent implements OnInit {
  student: Student[] = [];
  loading = true;
  // @ViewChild('modalRef') modalRef!: SharedModalComponent;
  tableColumns = [
    { key: 'name', label: 'Nama' },
    { key: 'nim', label: 'NIM' },
  ];
  showDeleteModal = false;
  selectedStudent: any = null;
  deleteLoading = false;

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() { this.loadStudents(); }

  private loadStudents() {
    this.studentService.getStudents().subscribe(res => {
      this.student = res.data;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  protected createStudent() {
    this.router.navigate([`/admin/student/form`]);
  }

  protected deleteStudent(item: any) {
    this.selectedStudent = item;
    this.showDeleteModal = true;
  }

  protected editStudent(item: any) {
    this.router.navigate([`/admin/student/form`],{
      queryParams: {
        id: item.id,
        name: item.name,
        nim: item.nim,
      }
    });
  }

  protected studentCourse(item: any) {
    this.router.navigate([`/admin/student/course`],{
      queryParams: {
        nim: item.nim,
        name: item.name,
      }
    })
  }

  confirmDelete(): void {
    if (!this.selectedStudent) return;
    console.log('confirmDelete:', this.selectedStudent);
    this.deleteLoading = true;
    this.studentService.deleteStudent(this.selectedStudent.id)
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
    this.selectedStudent = null;
    this.deleteLoading = false;
  }
}
