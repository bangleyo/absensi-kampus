import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClassSession} from '../../../core/models/class_session.model';
import {ClassSessionService} from '../../../core/services/class_session.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: [
    '../../../../styles/shared/header.css',
    '../../../../styles/shared/course-card.css',
    './dashboard.css'
  ],
  standalone: true,
  imports: [CommonModule]
})
export class AdminDashboardComponent implements OnInit {
  // --- Data Properties ---
  classSessions: ClassSession[] = [];
  loading: boolean = true;

  constructor(
    private classSessionService: ClassSessionService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    this.loadActiveSessions();
  }

  /** Mengambil daftar sesi kelas yang sedang aktif */
  private loadActiveSessions(): void {
    this.loading = true;
    this.classSessionService.getAllActiveSession().subscribe({
      next: (response) => {
        this.classSessions = response.data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load sessions:', err);
        this.loading = false;
      }
    });
  }

  processAttendance(id: number) {
    this.router.navigate([`/admin/dashboard/attendance/${id}`]);
  }
}
