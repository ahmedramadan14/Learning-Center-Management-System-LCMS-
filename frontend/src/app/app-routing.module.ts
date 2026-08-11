import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { DashboardLayoutComponent } from './pages/dashboard/dashboard-layout/dashboard-layout.component';
import { DashboardHomeComponent } from './pages/dashboard/dashboard-home/dashboard-home.component';
import { ManagementPageComponent } from './pages/dashboard/management-page/management-page.component';
import { SettingsComponent } from './pages/dashboard/settings/settings.component';
import { AuthGuard } from './services/auth/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard', component: DashboardLayoutComponent, canActivate: [AuthGuard], children: [
      { path: '', component: DashboardHomeComponent, pathMatch: 'full' },
      { path: 'students', component: ManagementPageComponent, data: { resource: 'students' } },
      { path: 'teachers', component: ManagementPageComponent, data: { resource: 'teachers' } },
      { path: 'courses', component: ManagementPageComponent, data: { resource: 'courses' } },
      { path: 'classes', component: ManagementPageComponent, data: { resource: 'classes' } },
      { path: 'exams', component: ManagementPageComponent, data: { resource: 'exams' } },
      { path: 'attendance', component: ManagementPageComponent, data: { resource: 'attendance' } },
      { path: 'payments', component: ManagementPageComponent, data: { resource: 'payments' } },
      { path: 'messages', component: ManagementPageComponent, data: { resource: 'messages' } },
      { path: 'profile', component: SettingsComponent },
      { path: 'settings', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule { }
