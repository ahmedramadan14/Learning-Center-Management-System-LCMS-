import { Component, OnInit } from '@angular/core';
import { TeacherService } from '../../../services/teachers/teacher.service';

export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  classes: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {

  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];

  isLoading: boolean = false;
  isSubmitting: boolean = false;

  searchText: string = '';
  selectedStatus: string = '';

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedTeacher: Teacher | null = null;
  editingTeacher: Teacher | null = null;

  newTeacher = {
    name: '',
    phone: '',
    password: '',
    subject: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  };

  constructor(private teacherService: TeacherService) {}

  ngOnInit(): void {
    this.fetchTeachers();
  }

  fetchTeachers(): void {
    this.isLoading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (res: any) => {
        const rawList = res?.data?.teachers || res?.data || [];

        this.teachers = rawList.map((item: any) => ({
          _id: item._id,
          name: item.userId?.name || item.name || 'N/A',
          email: item.userId?.email || item.email || 'N/A',
          phone: item.userId?.phone || item.phone || 'N/A',
          specialization: item.subject || item.specialization || 'General',
          classes: item.description || 'N/A',
          status: item.isActive !== false ? 'Active' : 'Inactive'
        }));

        this.applyFilters();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load teachers:', err);
        this.isLoading = false;
      }
    });
  }

  // --- Statistics ---
  get totalTeachers(): number {
    return this.teachers.length;
  }

  get activeTeachers(): number {
    return this.teachers.filter(t => t.status === 'Active').length;
  }

  get inactiveTeachers(): number {
    return this.teachers.filter(t => t.status === 'Inactive').length;
  }

  get totalSpecializations(): number {
    return new Set(this.teachers.map(t => t.specialization)).size;
  }

  getInitials(name: string): string {
    if (!name) return 'TC';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredTeachers = this.teachers.filter(teacher => {
      const matchesSearch =
        !search ||
        teacher.name.toLowerCase().includes(search) ||
        teacher.email.toLowerCase().includes(search) ||
        teacher.phone.toLowerCase().includes(search) ||
        teacher.specialization.toLowerCase().includes(search) ||
        teacher.classes.toLowerCase().includes(search);

      const matchesStatus =
        !this.selectedStatus ||
        teacher.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // --- Actions ---
  onAddTeacherClick(): void {
    this.editingTeacher = null;
    this.newTeacher = {
      name: '',
      phone: '',
      password: '',
      subject: '',
      description: '',
      status: 'Active'
    };
    this.isModalOpen = true;
  }

  editTeacher(teacher: Teacher): void {
    this.editingTeacher = teacher;
    this.newTeacher = {
      name: teacher.name,
      phone: teacher.phone,
      password: '',
      subject: teacher.specialization,
      description: teacher.classes,
      status: teacher.status
    };
    this.isModalOpen = true;
  }

  saveTeacher(): void {
    if (!this.newTeacher.name.trim() || !this.newTeacher.phone.trim()) {
      alert('Please fill out Name and Phone number.');
      return;
    }

    this.isSubmitting = true;

    if (this.editingTeacher) {
      const payload = {
        subject: this.newTeacher.subject.trim(),
        description: this.newTeacher.description.trim()
      };

      this.teacherService.updateTeacher(this.editingTeacher._id, payload).subscribe({
        next: () => {
          alert('Teacher updated successfully!');
          this.isSubmitting = false;
          this.closeModal();
          this.fetchTeachers();
        },
        error: (err: any) => {
          console.error('Update error:', err);
          alert('Failed to update teacher: ' + (err.error?.message || err.message));
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.newTeacher.password) {
        alert('Password is required for new teachers.');
        this.isSubmitting = false;
        return;
      }

      const payload = {
        name: this.newTeacher.name.trim(),
        phone: this.newTeacher.phone.trim(),
        password: this.newTeacher.password,
        subject: this.newTeacher.subject.trim(),
        description: this.newTeacher.description.trim()
      };

      this.teacherService.createTeacher(payload).subscribe({
        next: () => {
          alert('Teacher created successfully!');
          this.isSubmitting = false;
          this.closeModal();
          this.fetchTeachers();
        },
        error: (err: any) => {
          console.error('Create error:', err);
          alert('Failed to create teacher: ' + (err.error?.message || err.message));
          this.isSubmitting = false;
        }
      });
    }
  }

  viewTeacher(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.isDetailsModalOpen = true;
  }

  deleteTeacher(teacher: Teacher): void {
    if (confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      this.teacherService.deleteTeacher(teacher._id).subscribe({
        next: () => {
          alert('Teacher deleted successfully!');
          this.fetchTeachers();
        },
        error: (err: any) => {
          console.error('Delete error:', err);
          alert('Failed to delete teacher: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingTeacher = null;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedTeacher = null;
  }
}
