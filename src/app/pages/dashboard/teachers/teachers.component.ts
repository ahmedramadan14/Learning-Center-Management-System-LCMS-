import { Component, OnInit } from '@angular/core';

interface Teacher {
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

  // =========================================================
  // Teachers Data
  // =========================================================

  teachers: Teacher[] = [
    {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '+20 100 123 4567',
      specialization: 'Mathematics',
      classes: 'Grade 10, Grade 11',
      status: 'Active'
    },
    {
      name: 'Sara Mohamed',
      email: 'sara.mohamed@example.com',
      phone: '+20 101 234 5678',
      specialization: 'English',
      classes: 'Grade 7, Grade 8',
      status: 'Active'
    },
    {
      name: 'Omar Ali',
      email: 'omar.ali@example.com',
      phone: '+20 102 345 6789',
      specialization: 'Physics',
      classes: 'Grade 11, Grade 12',
      status: 'Inactive'
    },
    {
      name: 'Mariam Adel',
      email: 'mariam.adel@example.com',
      phone: '+20 103 456 7890',
      specialization: 'Chemistry',
      classes: 'Grade 10, Grade 12',
      status: 'Active'
    },
    {
      name: 'Youssef Samir',
      email: 'youssef.samir@example.com',
      phone: '+20 104 567 8901',
      specialization: 'Computer Science',
      classes: 'Grade 8, Grade 9',
      status: 'Active'
    }
  ];

  filteredTeachers: Teacher[] = [];

  searchText: string = '';
  selectedStatus: string = '';

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedTeacher: Teacher | null = null;
  editingTeacher: Teacher | null = null;

  newTeacher = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    classes: '',
    status: 'Active' as 'Active' | 'Inactive'
  };

  ngOnInit(): void {
    this.filteredTeachers = [...this.teachers];
  }

  // =========================================================
  // Statistics
  // =========================================================

  get totalTeachers(): number {
    return this.teachers.length;
  }

  get activeTeachers(): number {
    return this.teachers.filter(teacher => teacher.status === 'Active').length;
  }

  get inactiveTeachers(): number {
    return this.teachers.filter(teacher => teacher.status === 'Inactive').length;
  }

  get totalSpecializations(): number {
    return new Set(this.teachers.map(teacher => teacher.specialization)).size;
  }

  // =========================================================
  // Helpers
  // =========================================================

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // =========================================================
  // Filtering
  // =========================================================

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

  // =========================================================
  // Add / Edit Teacher
  // =========================================================

  onAddTeacherClick(): void {
    this.editingTeacher = null;
    this.newTeacher = {
      name: '',
      email: '',
      phone: '',
      specialization: '',
      classes: '',
      status: 'Active'
    };
    this.isModalOpen = true;
  }

  saveTeacher(): void {
    if (
      !this.newTeacher.name.trim() ||
      !this.newTeacher.email.trim() ||
      !this.newTeacher.specialization.trim()
    ) {
      return;
    }

    if (this.editingTeacher) {
      this.editingTeacher.name = this.newTeacher.name.trim();
      this.editingTeacher.email = this.newTeacher.email.trim();
      this.editingTeacher.phone = this.newTeacher.phone.trim();
      this.editingTeacher.specialization = this.newTeacher.specialization.trim();
      this.editingTeacher.classes = this.newTeacher.classes.trim();
      this.editingTeacher.status = this.newTeacher.status;
    } else {
      const teacher: Teacher = {
        name: this.newTeacher.name.trim(),
        email: this.newTeacher.email.trim(),
        phone: this.newTeacher.phone.trim(),
        specialization: this.newTeacher.specialization.trim(),
        classes: this.newTeacher.classes.trim(),
        status: this.newTeacher.status
      };
      this.teachers.push(teacher);
    }

    this.applyFilters();
    this.closeModal();
  }

  editTeacher(teacher: Teacher): void {
    this.editingTeacher = teacher;
    this.newTeacher = {
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      classes: teacher.classes,
      status: teacher.status
    };
    this.isModalOpen = true;
  }

  viewTeacher(teacher: Teacher): void {
    alert('شغال! المدرس هو: ' + teacher.name); // 👈 ضيف السطر ده للتجربة
    this.selectedTeacher = teacher;
    this.isDetailsModalOpen = true;
  }

  deleteTeacher(teacher: Teacher): void {
    const index = this.teachers.indexOf(teacher);
    if (index !== -1) {
      this.teachers.splice(index, 1);
      this.applyFilters();
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