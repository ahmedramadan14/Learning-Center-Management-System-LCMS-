import { Component } from '@angular/core';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent {

  searchText = '';
  selectedStatus = 'All Status';
  selectedGroup = 'All Groups';
  selectedDate = '';

  attendanceRecords = [
    {
      studentName: 'Ahmed Hassan',
      studentId: 'ST-001',
      group: 'Group A',
      date: '2026-06-22',
      status: 'Present',
      time: '08:15 AM'
    },
    {
      studentName: 'Sara Mohamed',
      studentId: 'ST-002',
      group: 'Group A',
      date: '2026-06-22',
      status: 'Late',
      time: '08:37 AM'
    },
    {
      studentName: 'Omar Ali',
      studentId: 'ST-003',
      group: 'Group B',
      date: '2026-06-22',
      status: 'Absent',
      time: '-'
    },
    {
      studentName: 'Mariam Adel',
      studentId: 'ST-004',
      group: 'Group B',
      date: '2026-06-22',
      status: 'Present',
      time: '08:10 AM'
    },
    {
      studentName: 'Youssef Samir',
      studentId: 'ST-005',
      group: 'Group C',
      date: '2026-06-22',
      status: 'Excused',
      time: '-'
    },
    {
      studentName: 'Nour Ahmed',
      studentId: 'ST-006',
      group: 'Group C',
      date: '2026-06-22',
      status: 'Present',
      time: '08:05 AM'
    }
  ];

  get filteredRecords() {
    return this.attendanceRecords.filter(record => {

      const search = this.searchText.toLowerCase().trim();

      const matchesSearch =
        record.studentName.toLowerCase().includes(search) ||
        record.studentId.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        record.status === this.selectedStatus;

      const matchesGroup =
        this.selectedGroup === 'All Groups' ||
        record.group === this.selectedGroup;

      const matchesDate =
        !this.selectedDate ||
        record.date === this.selectedDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGroup &&
        matchesDate
      );
    });
  }

  get totalStudents(): number {
    return this.attendanceRecords.length;
  }

  get presentCount(): number {
    return this.attendanceRecords.filter(
      record => record.status === 'Present'
    ).length;
  }

  get absentCount(): number {
    return this.attendanceRecords.filter(
      record => record.status === 'Absent'
    ).length;
  }

  get lateCount(): number {
    return this.attendanceRecords.filter(
      record => record.status === 'Late'
    ).length;
  }

  get excusedCount(): number {
    return this.attendanceRecords.filter(
      record => record.status === 'Excused'
    ).length;
  }

}