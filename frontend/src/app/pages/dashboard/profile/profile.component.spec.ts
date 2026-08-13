import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../services/auth/auth.service';
import { ApiService } from '../../../services/api/api.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({ name: 'Test User', role: 'student', phone: '01000000000' }),
            getMyProfile: () => of({
              name: 'Test User',
              role: 'student',
              phone: '01000000000',
              createdAt: '2026-01-01T00:00:00.000Z'
            })
          }
        },
        {
          provide: ApiService,
          useValue: {
            get: () => of({ data: { studentCode: 'STU-12345' } }),
            post: () => of({})
          }
        }
      ]
    });
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the authenticated user name', () => {
    expect(fixture.nativeElement.textContent).toContain('Test User');
  });

  it('shows the student code for a student profile', () => {
    expect(fixture.nativeElement.textContent).toContain('STU-12345');
  });
});
