import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SidebarComponent } from './sidebar.component';
import { AccessControlService } from '../../services/auth/access-control.service';
import { AuthService } from '../../services/auth/auth.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarComponent],
      imports: [CommonModule, RouterTestingModule],
      providers: [
        {
          provide: AccessControlService,
          useValue: {
            currentRole: 'admin',
            canView: () => true,
            permissionLabels: () => []
          }
        },
        {
          provide: AuthService,
          useValue: { logoutFromServer: () => of(void 0) }
        }
      ]
    });
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
