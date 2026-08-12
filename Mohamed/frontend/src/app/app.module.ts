import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layout Components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';

// Landing
import { LandingComponent } from './pages/landing/landing.component';

// Dashboard
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

// Auth
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';

@NgModule({
  declarations: [
    // App
    AppComponent,

    // Layout
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    DashboardLayoutComponent,

    // Landing
    LandingComponent,

    // Dashboard
    DashboardHomeComponent,
    StudentsComponent,
    TeachersComponent,
    CoursesComponent,
    ClassesComponent,
    ParentsComponent,
    SecretariesComponent,
    AttendanceComponent,
    ExamsComponent,
    PaymentsComponent,
    SettingsComponent,
    ResultsComponent,
    ScheduleComponent,

    // Auth
    LoginComponent,
    RegisterComponent
  ],

  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],

  providers: [],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}