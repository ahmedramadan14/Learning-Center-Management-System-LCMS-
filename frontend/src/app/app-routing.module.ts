import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard/dashboard-home/dashboard-home.component';
import { StudentsComponent } from './pages/dashboard/students/students.component';
import { TeachersComponent } from './pages/dashboard/teachers/teachers.component';
import { CoursesComponent } from './pages/dashboard/courses/courses.component';
import { ClassesComponent } from './pages/dashboard/classes/classes.component';
import { ParentsComponent } from './pages/dashboard/parents/parents.component';
import { SecretariesComponent } from './pages/dashboard/secretaries/secretaries.component';
import { AttendanceComponent } from './pages/dashboard/attendance/attendance.component';
import { ExamsComponent } from './pages/dashboard/exams/exams.component';
import { PaymentsComponent } from './pages/dashboard/payments/payments.component';
import { SettingsComponent } from './pages/dashboard/settings/settings.component';
import { ResultsComponent } from './pages/dashboard/results/results.component';
import { ScheduleComponent } from './pages/dashboard/schedule/schedule.component';
import { ManagementPageComponent } from './pages/dashboard/management-page/management-page.component';
import { NotificationsComponent } from './pages/dashboard/notifications/notifications.component';
import { ProfileComponent } from './pages/dashboard/profile/profile.component';
import { AuthGuard } from './services/auth/auth.guard';
import { RoleGuard } from './services/auth/role.guard';
const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },

  {
    path: 'login',
    component : LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [RoleGuard],
    children: [
      {
        path: '',
        component: DashboardHomeComponent,
        data: { resource: 'dashboard' }
      },
      {
        path: 'students',
        component: ManagementPageComponent,
        data: { resource: 'students' }
      },
      {
        path: 'teachers',
        component: ManagementPageComponent,
        data: { resource: 'teachers' }
      },
      {
        path: 'courses',
        component: ManagementPageComponent,
        data: { resource: 'courses' }
      },
      {
        path: 'classes',
        component: ManagementPageComponent,
        data: { resource: 'classes' }
      },
      {
        path: 'grades',
        component: ManagementPageComponent,
        data: { resource: 'grades' }
      },
      {
        path: 'schedule',
        component: ManagementPageComponent,
        data: { resource: 'schedule' }
      },
      {
        path: 'parents',
        component: ManagementPageComponent,
        data: { resource: 'parents' }
      },
      {
        path: 'secretaries',
        component: ManagementPageComponent,
        data: { resource: 'secretaries' }
      },
      {
        path: 'attendance',
        component: ManagementPageComponent,
        data: { resource: 'attendance' }
      },
      {
        path: 'exams',
        component: ManagementPageComponent,
        data: { resource: 'exams' }
      },
      {
        path: 'payments',
        component: ManagementPageComponent,
        data: { resource: 'payments' }
      },
      {
        path: 'results',
        component: ManagementPageComponent,
        data: { resource: 'results' }
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        data: { resource: 'notifications' }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { resource: 'profile' }
      },
      {
        path: 'settings',
        component: SettingsComponent,
        data: { resource: 'settings' }
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}
