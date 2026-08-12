import { Component, OnInit } from '@angular/core';

<<<<<<< HEAD
interface Teacher {
=======
export interface Teacher {
  id?: number;
>>>>>>> origin/ahmed
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

<<<<<<< HEAD
  // =========================================================
  // Teachers Data
  // =========================================================

  teachers: Teacher[] = [
    {
=======
  // قائمة المعلمين (بيانات تجريبية)
  teachers: Teacher[] = [
    {
      id: 1,
>>>>>>> origin/ahmed
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '+20 100 123 4567',
      specialization: 'Mathematics',
      classes: 'Grade 10, Grade 11',
      status: 'Active'
    },
<<<<<<< HEAD

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

  // =========================================================
  // Filtered Teachers
  // =========================================================

  filteredTeachers: Teacher[] = [];

  // =========================================================
  // Filters
  // =========================================================

  searchText: string = '';
  selectedStatus: string = '';

  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedTeacher: Teacher | null = null;
  editingTeacher: Teacher | null = null;

  // =========================================================
  // New Teacher Form
  // =========================================================

  newTeacher = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    classes: '',
    status: 'Active' as 'Active' | 'Inactive'
  };


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.filteredTeachers = [...this.teachers];
  }


  // =========================================================
  // Statistics
  // =========================================================

=======
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
>>>>>>> origin/ahmed
  get totalTeachers(): number {
    return this.teachers.length;
  }

<<<<<<< HEAD

  get activeTeachers(): number {
    return this.teachers.filter(
      teacher => teacher.status === 'Active'
    ).length;
  }


  get inactiveTeachers(): number {
    return this.teachers.filter(
      teacher => teacher.status === 'Inactive'
    ).length;
  }


  get totalSpecializations(): number {
    return new Set(
      this.teachers.map(
        teacher => teacher.specialization
      )
    ).size;
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

    const search = this.searchText
      .toLowerCase()
      .trim();

    this.filteredTeachers = this.teachers.filter(
      teacher => {

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

        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );

  }


  // =========================================================
  // Add Teacher
  // =========================================================

  onAddTeacherClick(): void {

    this.editingTeacher = null;

    this.newTeacher = {
=======
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
>>>>>>> origin/ahmed
      name: '',
      email: '',
      phone: '',
      specialization: '',
      classes: '',
      status: 'Active'
    };
<<<<<<< HEAD

    this.isModalOpen = true;

  }


  // =========================================================
  // Save / Update Teacher
  // =========================================================

  saveTeacher(): void {

    // Basic validation
    if (
      !this.newTeacher.name.trim() ||
      !this.newTeacher.email.trim() ||
      !this.newTeacher.specialization.trim()
    ) {
      return;
    }


    // =======================================================
    // Update Existing Teacher
    // =======================================================

    if (this.editingTeacher) {

      this.editingTeacher.name =
        this.newTeacher.name.trim();

      this.editingTeacher.email =
        this.newTeacher.email.trim();

      this.editingTeacher.phone =
        this.newTeacher.phone.trim();

      this.editingTeacher.specialization =
        this.newTeacher.specialization.trim();

      this.editingTeacher.classes =
        this.newTeacher.classes.trim();

      this.editingTeacher.status =
        this.newTeacher.status;

    }


    // =======================================================
    // Add New Teacher
    // =======================================================

    else {

      const teacher: Teacher = {

        name: this.newTeacher.name.trim(),

        email: this.newTeacher.email.trim(),

        phone: this.newTeacher.phone.trim(),

        specialization:
          this.newTeacher.specialization.trim(),

        classes:
          this.newTeacher.classes.trim(),

        status:
          this.newTeacher.status

      };

      this.teachers.push(teacher);

    }


    // Refresh table
    this.applyFilters();

    // Close modal
    this.closeModal();

  }


  // =========================================================
  // Edit Teacher
  // =========================================================

  editTeacher(teacher: Teacher): void {

    this.editingTeacher = teacher;

    this.newTeacher = {

      name: teacher.name,

      email: teacher.email,

      phone: teacher.phone,

      specialization:
        teacher.specialization,

      classes:
        teacher.classes,

      status:
        teacher.status

    };

    this.isModalOpen = true;

  }


  // =========================================================
  // View Teacher
  // =========================================================

  viewTeacher(teacher: Teacher): void {

    this.selectedTeacher = teacher;

    this.isDetailsModalOpen = true;

  }


  // =========================================================
  // Delete Teacher
  // =========================================================

  deleteTeacher(teacher: Teacher): void {

    const index =
      this.teachers.indexOf(teacher);

    if (index !== -1) {

      this.teachers.splice(index, 1);

      this.applyFilters();

    }

  }


  // =========================================================
  // Close Add / Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.editingTeacher = null;

  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedTeacher = null;

  }

}
=======
  }
}
>>>>>>> origin/ahmed
