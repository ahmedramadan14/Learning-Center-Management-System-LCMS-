import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './pages/auth/register/register.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { PaymentsComponent } from './pages/dashboard/payments/payments.component';
import { ClassesComponent } from './pages/dashboard/classes/classes.component';

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent
  },{
    path: 'login',
    component: LoginComponent
  },
  {
    path:'payment',
    component:PaymentsComponent
  },
  {
    path:'classes',
    component: ClassesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
