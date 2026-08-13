import { Component, OnInit } from '@angular/core';
import { AuthService, CurrentUser } from '../../../services/auth/auth.service';
import { UserRole } from '../../../services/auth/auth.types';
import { ApiService } from '../../../services/api/api.service';

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'You have full access to learning center administration and records.',
  teacher: 'You can manage the classes, students, and records assigned to you.',
  secretary: 'You can support the daily operations assigned to your linked teacher.',
  student: 'You can view your own learning information and progress.',
  parent: 'You can view information for the children linked to your account.'
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: CurrentUser | null = null;
  studentCode = '';
  loading = true;
  error = '';
  childCode = '';
  linkingChild = false;
  childLinkError = '';
  childLinkMessage = '';

  constructor(
    private readonly auth: AuthService,
    private readonly api: ApiService
  ) {}

  ngOnInit(): void {
    this.profile = this.auth.getCurrentUser();
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.auth.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loadStudentCode();
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading = false;
        this.error = error.error?.message || 'Could not refresh your profile. Please try again.';
      }
    });
  }

  get initials(): string {
    const name = this.profile?.name || 'User';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  }

  get roleLabel(): string {
    const role = this.profile?.role;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
  }

  get roleDescription(): string {
    const role = this.profile?.role;
    return role ? ROLE_DESCRIPTIONS[role] : 'Your account details are shown below.';
  }

  get joinedOn(): string {
    const createdAt = this.profile?.createdAt;
    if (!createdAt || Number.isNaN(Date.parse(createdAt))) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(createdAt));
  }

  get accountStatus(): string {
    if (this.profile?.isActive === false) {
      return 'Inactive';
    }

    if (this.profile?.isApproved === false) {
      return 'Pending approval';
    }

    return 'Active';
  }

  get canLinkChild(): boolean {
    return this.profile?.role === 'parent';
  }

  private loadStudentCode(): void {
    this.studentCode = '';
    if (this.profile?.role !== 'student') return;

    this.api.get<{ data?: { studentCode?: string } }>('/students/my-code').subscribe({
      next: (response) => {
        this.studentCode = response.data?.studentCode || '';
      },
      error: () => {
        this.studentCode = '';
      }
    });
  }

  linkChild(): void {
    if (!this.canLinkChild || this.linkingChild) return;

    const studentCode = this.childCode.trim();
    if (!studentCode) {
      this.childLinkError = 'Enter your child\'s student code.';
      this.childLinkMessage = '';
      return;
    }

    this.linkingChild = true;
    this.childLinkError = '';
    this.childLinkMessage = '';

    this.api.post('/parentstudent/link-child', { studentCode }).subscribe({
      next: () => {
        this.linkingChild = false;
        this.childCode = '';
        this.childLinkMessage = 'Your child has been linked to this account.';
      },
      error: (error: { error?: { message?: string } }) => {
        this.linkingChild = false;
        this.childLinkError = error.error?.message || 'Could not link this child. Please check the code and try again.';
      }
    });
  }
}
