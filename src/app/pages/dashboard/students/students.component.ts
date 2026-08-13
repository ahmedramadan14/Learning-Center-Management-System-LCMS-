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

  totalStudents: number = 0;
  activeStudents: number = 0;
  inactiveStudents: number = 0;

  searchTerm: string = '';
  selectedStatus: string = 'all';

  constructor(private studentService: StudentService) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents().subscribe({
      next: (res: any) => {
        // فحص الـ response وتخزين المصفوفة
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
        (student.studentCode ?? '').includes(this.searchTerm);

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