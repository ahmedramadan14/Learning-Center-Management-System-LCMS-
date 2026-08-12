import { Component, OnInit } from '@angular/core';

interface Student {
  name: string;
  email: string;
  group: string;
  phone: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {

  // =========================================================
  // Students Data
  // =========================================================

  students: Student[] = [
    {
      name: 'Ahmed Hassan',
      email: 'ahmed@gmail.com',
      group: 'Group A',
      phone: '01012345678',
      status: 'Active',
      createdAt: new Date()
    },
    {
      name: 'Mohamed Omar',
      email: 'mohamed@gmail.com',
      group: 'Group B',
      phone: '01098765432',
      status: 'Active',
      createdAt: new Date()
    },
    {
      name: 'Youssef Farag',
      email: 'youssef@gmail.com',
      group: 'Group C',
      phone: '01055555555',
      status: 'Inactive',
      createdAt: new Date()
    }
  ];

  // Students displayed after filtering
  filteredStudents: Student[] = [];

  // Available groups
  groups: string[] = [
    'Group A',
    'Group B',
    'Group C'
  ];

  // =========================================================
  // Filters
  // =========================================================

  searchValue: string = '';
  selectedGroup: string = '';
  selectedStatus: string = '';

  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedStudent: Student | null = null;

  // =========================================================
  // New / Edited Student
  // =========================================================

  newStudent = {
    name: '',
    email: '',
    group: '',
    phone: '',
    status: 'Active' as 'Active' | 'Inactive'
  };

  // Used to determine whether we are adding or editing
  isEditMode: boolean = false;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.filteredStudents = [...this.students];
  }


  // =========================================================
  // Statistics
  // =========================================================

  get activeStudentsCount(): number {
    return this.students.filter(
      student => student.status === 'Active'
    ).length;
  }


  get inactiveStudentsCount(): number {
    return this.students.filter(
      student => student.status === 'Inactive'
    ).length;
  }


  get newStudentsCount(): number {

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return this.students.filter(student => {

      const createdDate = new Date(student.createdAt);

      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );

    }).length;
  }


  // =========================================================
  // Get Student Initials
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
  // Filters
  // =========================================================

  applyFilters(): void {

    const search = this.searchValue
      .toLowerCase()
      .trim();

    this.filteredStudents = this.students.filter(student => {

      const matchesSearch =
        !search ||
        student.name.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.phone.toLowerCase().includes(search);

      const matchesGroup =
        !this.selectedGroup ||
        student.group === this.selectedGroup;

      const matchesStatus =
        !this.selectedStatus ||
        student.status === this.selectedStatus;

      return (
        matchesSearch &&
        matchesGroup &&
        matchesStatus
      );

    });

  }


  // =========================================================
  // Add Student
  // =========================================================

  onAddStudentClick(): void {

    this.isEditMode = false;

    this.selectedStudent = null;

    this.newStudent = {
      name: '',
      email: '',
      group: '',
      phone: '',
      status: 'Active'
    };

    this.isModalOpen = true;

  }


  // =========================================================
  // Close Add/Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedStudent = null;

    this.isEditMode = false;

  }


  // =========================================================
  // Save Student
  // =========================================================

  saveStudent(): void {

    // Basic validation
    if (
      !this.newStudent.name.trim() ||
      !this.newStudent.email.trim() ||
      !this.newStudent.group
    ) {
      return;
    }


    // =======================================================
    // Edit Existing Student
    // =======================================================

    if (this.isEditMode && this.selectedStudent) {

      this.selectedStudent.name = this.newStudent.name.trim();
      this.selectedStudent.email = this.newStudent.email.trim();
      this.selectedStudent.group = this.newStudent.group;
      this.selectedStudent.phone = this.newStudent.phone.trim();
      this.selectedStudent.status = this.newStudent.status;

    }


    // =======================================================
    // Add New Student
    // =======================================================

    else {

      const student: Student = {

        name: this.newStudent.name.trim(),

        email: this.newStudent.email.trim(),

        group: this.newStudent.group,

        phone: this.newStudent.phone.trim(),

        status: this.newStudent.status,

        createdAt: new Date()

      };

      this.students.push(student);

    }


    // Refresh table
    this.applyFilters();

    // Close modal
    this.closeModal();

  }


  // =========================================================
  // View Student
  // =========================================================

  viewStudent(student: Student): void {

    this.selectedStudent = student;

    this.isDetailsModalOpen = true;

  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedStudent = null;

  }


  // =========================================================
  // Edit Student
  // =========================================================

  editStudent(student: Student): void {

    this.selectedStudent = student;

    this.isEditMode = true;

    this.newStudent = {

      name: student.name,

      email: student.email,

      group: student.group,

      phone: student.phone,

      status: student.status

    };

    this.isModalOpen = true;

  }


  // =========================================================
  // Delete Student
  // =========================================================

  deleteStudent(student: Student): void {

    const index = this.students.indexOf(student);

    if (index !== -1) {

      this.students.splice(index, 1);

      this.applyFilters();

    }

  }

}
