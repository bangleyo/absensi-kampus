import {Routes} from '@angular/router';
import {authGuard} from './core/services/auth.guard';

// Layouts
import {DashboardLayoutComponent} from './shared/layouts/dashboard-layout/dashboard-layout';

// Auth Pages
import {LoginComponent} from './features/login/login';
import {RegisterComponent} from './features/register/register';

// Student/General Pages
import {DashboardComponent} from './features/dashboard/dashboard';
import {CourseComponent} from './features/course/course';
import {ProfileComponent} from './features/profile/profile';

// Admin Pages
import {AdminDashboardComponent} from './features/admin/dashboard/dashboard';
import {AdminCourseComponent} from './features/admin/course/course';
import {CreateCourseComponent} from './features/admin/course/create/form';
import {AdminStudentComponent} from './features/admin/student/student';
import {roleGuard} from './core/services/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard], // Guard Dasar (Cek Login)
    children: [
      // HALAMAN UMUM (Bisa diakses Admin & Student)
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },

      // HALAMAN KHUSUS STUDENT
      {
        path: 'course',
        component: CourseComponent,
        canActivate: [roleGuard('STUDENT')] // Hanya Student
      },

      // HALAMAN KHUSUS ADMIN (Proteksi Ketat)
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')], // Cek apakah ADMIN?
        children: [
          { path: 'dashboard', component: AdminDashboardComponent },
          { path: 'course', component: AdminCourseComponent },
          { path: 'course/form', component: CreateCourseComponent },
          // ... route admin lainnya
          { path: 'student', component: AdminStudentComponent },
        ]
      },

      // Fallback
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
