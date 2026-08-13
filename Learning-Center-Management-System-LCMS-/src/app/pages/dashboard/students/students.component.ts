import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../../services/students/student.service';
import { Student } from './student.model';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  // Modal Flags
  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isViewModalOpen: boolean = false;

  // Selected Student Objects
  selectedStudentForEdit: Student | null = null;
  selectedStudentForView: Student | null = null;

  totalStudents: number = 0;
  activeStudents: number = 0;
  inactiveStudents: number = 0;

  searchTerm: string = '';
  selectedStatus: string = 'all';

  newStudent = {
    name: '',
    phone: '',
    password: '',
    parentPhone: '',
    grade: '',
    gender: 'male',
    role: 'student',
    isActive: true,
    isApproved: true
  };

  editStudentData = {
    studentCode: '',
    name: '',
    phone: '',
    parentPhone: '',
    grade: '',
    gender: 'male',
    isActive: true
  };

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents().subscribe({
      next: (res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.students = res.data;
        } else if (Array.isArray(res)) {
          this.students = res;
        } else {
          this.students = [];
        }

        this.applyFilter();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching students:', err);
        this.isLoading = false;
      }
    });
  }

  // --- Add Student Logic ---
  openAddStudentModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddStudentModal(): void {
    this.isAddModalOpen = false;
    this.resetAddForm();
  }

  resetAddForm(): void {
    this.newStudent = {
      name: '',
      phone: '',
      password: '',
      parentPhone: '',
      grade: '',
      gender: 'male',
      role: 'student',
      isActive: true,
      isApproved: true
    };
  }

  submitAddStudent(): void {
    if (!this.newStudent.name || !this.newStudent.phone || !this.newStudent.password || !this.newStudent.parentPhone || !this.newStudent.grade) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isSubmitting = true;
    this.studentService.createStudent(this.newStudent).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Student created successfully!');
        this.closeAddStudentModal();
        this.fetchStudents();
      },
      error: (err: any) => {
        console.error('Error creating student:', err);
        const message = err.error?.message || err.message || 'Error occurred while saving student';
        alert('Failed to save student: ' + message);
        this.isSubmitting = false;
      }
    });
  }

  // --- Edit Student Logic ---
  openEditModal(student: Student): void {
    this.selectedStudentForEdit = student;
    this.editStudentData = {
      studentCode: student.studentCode,
      name: student.userId?.name || '',
      phone: student.userId?.phone || '',
      parentPhone: student.parentPhone || '',
      grade: student.grade || '',
      gender: student.gender || 'male',
      isActive: student.isActive ?? true
    };
    this.isEditModalOpen = true;
  }

  closeEditStudentModal(): void {
    this.isEditModalOpen = false;
    this.selectedStudentForEdit = null;
  }

  submitEditStudent(): void {
    if (!this.editStudentData.studentCode) return;

    this.isSubmitting = true;
    this.studentService.updateStudent(this.editStudentData.studentCode, this.editStudentData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Student updated successfully!');
        this.closeEditStudentModal();
        this.fetchStudents();
      },
      error: (err: any) => {
        console.error('Error updating student:', err);
        const message = err.error?.message || err.message || 'Failed to update student';
        alert('Error: ' + message);
        this.isSubmitting = false;
      }
    });
  }

  // --- View Student Logic ---
  openViewModal(student: Student): void {
    this.selectedStudentForView = student;
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.selectedStudentForView = null;
  }

  // --- Delete (Deactivate) Student Logic ---
  onDeleteStudent(student: Student): void {
    const studentName = student.userId?.name || 'this student';
    if (confirm(`Are you sure you want to deactivate/delete ${studentName}?`)) {
      this.studentService.deleteStudent(student.studentCode).subscribe({
        next: () => {
          alert('Student deactivated successfully!');
          this.fetchStudents();
        },
        error: (err: any) => {
          console.error('Error deactivating student:', err);
          const message = err.error?.message || err.message || 'Failed to deactivate student';
          alert('Error: ' + message);
        }
      });
    }
  }

  // --- Helpers ---
  calculateStats(): void {
    this.totalStudents = this.students.length;
    this.activeStudents = this.students.filter(s => s.isActive === true).length;
    this.inactiveStudents = this.students.filter(s => s.isActive === false).length;
  }

  applyFilter(): void {
    this.filteredStudents = this.students.filter(student => {
      const matchesSearch =
        (student.userId?.name ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (student.userId?.phone ?? '').includes(this.searchTerm) ||
        (student.studentCode ?? '').toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'all' ? true :
        this.selectedStatus === 'active' ? student.isActive === true :
        student.isActive === false;

      return matchesSearch && matchesStatus;
    });

    this.calculateStats();
  }

  getInitials(name?: string): string {
    if (!name) return 'ST';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
