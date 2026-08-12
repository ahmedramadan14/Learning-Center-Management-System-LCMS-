import { Component, OnInit } from '@angular/core';

interface AttendanceRecord {
  studentName: string;
  studentId: string;
  group: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  time: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  // =========================================================
  // Attendance Data
  // =========================================================

  attendanceRecords: AttendanceRecord[] = [
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


  // =========================================================
  // Groups
  // =========================================================

  groups: string[] = [
    'Group A',
    'Group B',
    'Group C'
  ];


  // =========================================================
  // Filters
  // =========================================================

  searchText: string = '';

  selectedStatus: string = 'All Status';

  selectedGroup: string = 'All Groups';

  selectedDate: string = '';


  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;

  isDetailsModalOpen: boolean = false;

  selectedRecord: AttendanceRecord | null = null;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
  }


  // =========================================================
  // Filtered Records
  // =========================================================

  get filteredRecords(): AttendanceRecord[] {

    const search = this.searchText
      .toLowerCase()
      .trim();

    return this.attendanceRecords.filter(record => {

      const matchesSearch =
        !search ||
        record.studentName
          .toLowerCase()
          .includes(search) ||
        record.studentId
          .toLowerCase()
          .includes(search);


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


  // =========================================================
  // Statistics
  // =========================================================

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


  // =========================================================
  // Get Initials
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
  // View Attendance
  // =========================================================

  viewAttendance(record: AttendanceRecord): void {

    this.selectedRecord = record;

    this.isDetailsModalOpen = true;

  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedRecord = null;

  }


  // =========================================================
  // Edit Attendance
  // =========================================================

  editAttendance(record: AttendanceRecord): void {

    this.selectedRecord = record;

    this.isModalOpen = true;

  }


  // =========================================================
  // Close Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedRecord = null;

  }


  // =========================================================
  // Save Attendance
  // =========================================================

  saveAttendance(): void {

    if (!this.selectedRecord) {
      return;
    }

    this.isModalOpen = false;

    this.selectedRecord = null;

  }

}
