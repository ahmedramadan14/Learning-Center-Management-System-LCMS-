import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DashboardHomeComponent } from './dashboard-home.component';
import { AccessControlService } from '../../../services/auth/access-control.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ApiService } from '../../../services/api/api.service';

describe('DashboardHomeComponent', () => {
  let component: DashboardHomeComponent;
  let fixture: ComponentFixture<DashboardHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardHomeComponent],
      imports: [CommonModule, FormsModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: { getCurrentUser: () => ({ name: 'Test User', role: 'admin' }) }
        },
        {
          provide: AccessControlService,
          useValue: {
            currentRole: 'admin',
            can: () => true
          }
        },
        {
          provide: ApiService,
          useValue: {
            list: () => of([]),
            get: () => of({ data: [] }),
            post: () => of({})
          }
        }
      ]
    });
    fixture = TestBed.createComponent(DashboardHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
