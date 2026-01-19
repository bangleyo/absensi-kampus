import {ChangeDetectorRef, Component} from '@angular/core';
import {SharedTableComponent} from '../../../shared/table/table';
import {Student} from '../../../core/models/student.model';
import {StudentService} from '../../../core/services/student.service';

@Component({
  selector: 'app-student',
  imports: [
    SharedTableComponent
  ],
  templateUrl: './student.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../shared/table/table.css',
    './student.css',
  ],
})
export class StudentComponent {
  student: Student[] = [];
  loading = true;
  // @ViewChild('modalRef') modalRef!: SharedModalComponent;
  tableColumns = [
    { key: 'name', label: 'Nama' },
    { key: 'nim', label: 'NIM' },
  ];

  constructor(
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
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

  }

  protected deleteStudent(item: any) {

  }

  protected editStudent(item: any) {

  }

  protected studentCourse(item: any) {
    
  }
}
