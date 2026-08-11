import { Component } from '@angular/core';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent {

  searchText = '';
  selectedStatus = 'All Status';

  teachers = [
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

  get filteredTeachers() {
    return this.teachers.filter(teacher => {

      const matchesSearch =
        teacher.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        teacher.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        teacher.specialization.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        teacher.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

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

}