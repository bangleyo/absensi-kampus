import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';
import { roleGuard } from './core/services/role.guard';

// Layouts
import { DashboardLayoutComponent } from './shared/layouts/dashboard-layout/dashboard-layout';

// Auth Pages
import { LoginComponent } from './features/login/login';

// Student/General Pages
import { DashboardComponent } from './features/dashboard/dashboard';
import { CourseComponent } from './features/course/course';
import { ProfileComponent } from './features/profile/profile';

// Admin Pages - Dashboard
import { AdminDashboardComponent } from './features/admin/dashboard/dashboard';
import { AdminDashboardAttendanceComponent } from './features/admin/dashboard/attendance/attendance';

// Admin Pages - Course
import { AdminCourseComponent } from './features/admin/course/course';
import { CreateCourseComponent } from './features/admin/course/create/form';

// Admin Pages - Class Session
import { ClassSessionComponent } from './features/admin/classsession/classsession';
import { CreateClassSessionComponent } from './features/admin/classsession/create/form';

// Admin Pages - Student Management
import { AdminStudentComponent } from './features/admin/student/student';
import { StudentFormComponent } from './features/admin/student/form/form';
import { AdminStudentCourseComponent } from './features/admin/student/course/student_course';
import { CreateStudentCourseComponent } from './features/admin/student/course/create/create';

export const routes: Routes = [
  // --- PUBLIC ROUTES ---
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // --- PROTECTED ROUTES (Butuh Login) ---
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard], // Cek apakah sudah login
    children: [

      // 1. GENERAL PAGES (Bisa diakses Admin & Student)
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },

      // 2. STUDENT SPECIFIC PAGES (Hanya Student)
      {
        path: 'course',
        component: CourseComponent,
        canActivate: [roleGuard('STUDENT')]
      },

      // 3. ADMIN SPECIFIC PAGES (Hanya Admin)
      // Semua route di bawah ini otomatis diawali dengan "/admin/..."
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')],
        children: [
          // Dashboard & Attendance
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'dashboard/attendance/:id', component: AdminDashboardAttendanceComponent },

          // Course Management
          { path: 'course', component: AdminCourseComponent },
          { path: 'course/form', component: CreateCourseComponent },

          // Class Session Management
          { path: 'class-session', component: ClassSessionComponent },
          { path: 'class-session/form', component: CreateClassSessionComponent },

          // Student Management
          { path: 'student', component: AdminStudentComponent },
          { path: 'student/form', component: StudentFormComponent },

          // Student Course (KRS) Management
          { path: 'student/course', component: AdminStudentCourseComponent },
          { path: 'student/course/create', component: CreateStudentCourseComponent },

          // Admin Profile
          { path: 'profile', component: ProfileComponent },
        ]
      },

      // Fallback Route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
