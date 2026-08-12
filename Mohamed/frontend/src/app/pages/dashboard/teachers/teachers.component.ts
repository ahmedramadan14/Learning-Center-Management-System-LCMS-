import { Component, OnInit } from '@angular/core';

export interface Teacher {
  id?: number;
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

  // قائمة المعلمين (بيانات تجريبية)
  teachers: Teacher[] = [
    {
      id: 1,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '+20 100 123 4567',
      specialization: 'Mathematics',
      classes: 'Grade 10, Grade 11',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Sarah Ali',
      email: 'sarah.ali@example.com',
      phone: '+20 111 987 6543',
      specialization: 'Physics',
      classes: 'Grade 12',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mohamed Mahmoud',
      email: 'm.mahmoud@example.com',
      phone: '+20 122 555 4433',
      specialization: 'Chemistry',
      classes: 'Grade 10',
      status: 'Inactive'
    }
  ];

  filteredTeachers: Teacher[] = [];

  // متغيّرات البحث والفلترة
  searchText: string = '';
  selectedStatus: string = '';

  // حالة الـ Modals
  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;
  editingTeacher: Teacher | null = null;
  selectedTeacher: Teacher | null = null;

  // نموذج المعلم الجديد / المعدل
  newTeacher: Teacher = this.resetTeacherForm();

  ngOnInit(): void {
    this.applyFilters();
  }

  // --- الإحصائيات (Getters) ---
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
    const specs = this.teachers.map(t => t.specialization.toLowerCase().trim());
    return new Set(specs).size;
  }

  // --- الأحرف الأولى من الاسم للـ Avatar ---
  getInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  // --- الفلترة والبحث ---
  applyFilters(): void {
    this.filteredTeachers = this.teachers.filter(teacher => {
      const matchesSearch = 
        teacher.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        teacher.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        teacher.specialization.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus = this.selectedStatus 
        ? teacher.status === this.selectedStatus 
        : true;

      return matchesSearch && matchesStatus;
    });
  }

  // --- إدارة الـ Modals ---
  onAddTeacherClick(): void {
    this.editingTeacher = null;
    this.newTeacher = this.resetTeacherForm();
    this.isModalOpen = true;
  }

  editTeacher(teacher: Teacher): void {
    this.editingTeacher = teacher;
    this.newTeacher = { ...teacher };
    this.isModalOpen = true;
  }

  viewTeacher(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.isDetailsModalOpen = true;
  }

  deleteTeacher(teacher: Teacher): void {
    if (confirm(`Are you sure you want to delete ${teacher.name}?`)) {
      this.teachers = this.teachers.filter(t => t.id !== teacher.id);
      this.applyFilters();
    }
  }

  saveTeacher(): void {
    if (!this.newTeacher.name || !this.newTeacher.email) {
      alert('Please fill in required fields (Name and Email).');
      return;
    }

    if (this.editingTeacher) {
      // تعديل
      const index = this.teachers.findIndex(t => t.id === this.editingTeacher?.id);
      if (index !== -1) {
        this.teachers[index] = { ...this.newTeacher };
      }
    } else {
      // إضافة جديد
      this.newTeacher.id = Date.now();
      this.teachers.push({ ...this.newTeacher });
    }

    this.applyFilters();
    this.closeModal();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.editingTeacher = null;
    this.newTeacher = this.resetTeacherForm();
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedTeacher = null;
  }

  private resetTeacherForm(): Teacher {
    return {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      classes: '',
      status: 'Active'
    };
  }
}