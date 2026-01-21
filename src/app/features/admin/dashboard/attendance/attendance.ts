import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedTableComponent} from '../../../../shared/table/table';
import {ActivatedRoute, Router} from '@angular/router';
import {AttendanceService} from '../../../../core/services/attendance.service';
import {AttendanceDetail} from '../../../../core/models/attendance.model';

@Component({
  selector: 'app-admin-course',
  templateUrl: './attendance.html',
  styleUrls: [
    '../../../../../styles/shared/header.css',
    '../../../../shared/table/table.css',
    './attendance.css',
  ],
  standalone: true,
  imports: [CommonModule, FormsModule, SharedTableComponent, ReactiveFormsModule]
})
export class AdminDashboardAttendanceComponent implements OnInit {
  id: number | any;
  attendanceUser: AttendanceDetail[] = []
  loading = true;
  tableColumns = [
    { key: 'name', label: 'Nama' },
    { key: 'nim', label: 'NIM' },
    { key: 'timestamp', label: 'Waktu Absen' },
    { key: 'valid', label: 'Valid' },
  ];

  constructor(
    private attendanceService: AttendanceService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef,
    private route : ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id']
    this.loadAttendance(this.id)
  }

  loadAttendance(id: number) {
    this.attendanceService.getUserAttendance(id).subscribe(res => {
      this.attendanceUser = res.data;
      this.loading = false;
      this.cdr.detectChanges();
    })
  }

  protected back() {
    this.router.navigate([`/admin/dashboard`])
  }

  protected downloadReport() {
    this.attendanceService.downloadReport(this.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-absensi.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      this.cdr.detectChanges();
    });
  }
}
