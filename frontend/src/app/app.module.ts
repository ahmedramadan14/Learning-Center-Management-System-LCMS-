import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LandingComponent } from './pages/landing/landing.component';
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
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';
import { DashboardLayoutComponent as ResponsiveDashboardLayoutComponent } from './pages/dashboard/dashboard-layout/dashboard-layout.component';
import { ManagementPageComponent } from './pages/dashboard/management-page/management-page.component';
import { ResultsComponent } from './pages/dashboard/results/results.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ScheduleComponent } from './pages/dashboard/schedule/schedule.component';
import { AuthInterceptor } from './services/auth/auth.interceptor';



@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    LandingComponent,
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
    DashboardLayoutComponent,
    ResponsiveDashboardLayoutComponent,
    ManagementPageComponent,
    ResultsComponent,
    ScheduleComponent,

  ],
  imports: [
  BrowserModule,
  FormsModule,
  CommonModule,
  AppRoutingModule,
  HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
