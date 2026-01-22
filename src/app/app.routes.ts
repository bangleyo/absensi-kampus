import {authGuard} from './core/services/auth.guard';
import {RegisterComponent} from './features/register/register';
import {LoginComponent} from './features/login/login';
import {Routes} from '@angular/router';
import {DashboardLayoutComponent} from './shared/layouts/dashboard-layout/dashboard-layout';
import {DashboardComponent} from './features/dashboard/dashboard';
import {CourseComponent} from './features/course/course';
import {ProfileComponent} from './features/profile/profile';
import {AdminDashboardComponent} from './features/admin/dashboard/dashboard';
import {AdminCourseComponent} from './features/admin/course/course';
import {CreateCourseComponent} from './features/admin/course/create/form';
import {ClassSessionComponent} from './features/admin/classsession/classsession';
import {CreateClassSessionComponent} from './features/admin/classsession/create/form';
import {AdminStudentComponent} from './features/admin/student/student';
import {StudentFormComponent} from './features/admin/student/form/form';
import {AdminStudentCourseComponent} from './features/admin/student/course/student_course';
import {CreateStudentCourseComponent} from './features/admin/student/course/create/create';
import {AdminDashboardAttendanceComponent} from './features/admin/dashboard/attendance/attendance';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'course', component: CourseComponent },
      { path: 'profile', component: ProfileComponent },
      {
        path: 'admin/dashboard',
        component: AdminDashboardComponent,
      },
      {
        path: 'admin/dashboard/attendance/:id',
        component: AdminDashboardAttendanceComponent,
      },
      {
        path: 'admin/course',
        component: AdminCourseComponent,
      },
      {
        path: 'admin/course/form',
        component: CreateCourseComponent,
      },
      {
        path: 'admin/class-session',
        component: ClassSessionComponent,
      },
      {
        path: 'admin/class-session/form',
        component: CreateClassSessionComponent,
      },
      {
        path: 'admin/student',
        component: AdminStudentComponent,
      },
      {
        path: 'admin/student/form',
        component: StudentFormComponent,
      },
      {
        path: 'admin/student/course',
        component: AdminStudentCourseComponent,
      },
      {
        path: 'admin/student/course/create',
        component: CreateStudentCourseComponent,
      },
      { path: 'admin/profile', component: ProfileComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
