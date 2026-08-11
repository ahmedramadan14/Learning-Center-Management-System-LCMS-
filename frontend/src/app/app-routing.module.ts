import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './pages/auth/register/register.component';
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
const routes: Routes = [

  {
    path: '',
    component: LandingComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

{
  path: 'dashboard',
  component: DashboardLayoutComponent,
  children: [

    {
      path: '',
      component: DashboardHomeComponent
    },

    {
      path: 'students',
      component: StudentsComponent
    },

    {
      path: 'teachers',
      component: TeachersComponent
    },

    {
      path: 'courses',
      component: CoursesComponent
    },

    {
      path: 'classes',
      component: ClassesComponent
    },

    {
      path: 'parents',
      component: ParentsComponent
    },

    {
      path: 'secretaries',
      component: SecretariesComponent
    },

    {
      path: 'attendance',
      component: AttendanceComponent
    },

    {
      path: 'exams',
      component: ExamsComponent
    },

    {
      path: 'payments',
      component: PaymentsComponent
    },

    {
      path: 'results',
      component: ResultsComponent
    },

    {
      path: 'settings',
      component: SettingsComponent
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