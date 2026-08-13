import { Component, OnInit } from '@angular/core';

interface Schedule {
  className: string;
  classNumber: string;
  subject: string;
  teacher: string;
  group: string;
  day: string;
  time: string;
  room: string;
  icon: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  // =========================================================
  // Schedule Data
  // =========================================================

  schedules: Schedule[] = [
    {
      className: 'Mathematics',
      classNumber: 'Class 01',
      subject: 'Mathematics',
      teacher: 'Ahmed Hassan',
      group: 'Group A',
      day: 'Saturday',
      time: '09:00 AM',
      room: 'Room 101',
      icon: 'fa-book'
    },
    {
      className: 'English',
      classNumber: 'Class 02',
      subject: 'English',
      teacher: 'Mohamed Ali',
      group: 'Group B',
      day: 'Sunday',
      time: '11:00 AM',
      room: 'Room 202',
      icon: 'fa-language'
    },
    {
      className: 'Physics',
      classNumber: 'Class 03',
      subject: 'Physics',
      teacher: 'Youssef Ahmed',
      group: 'Group A',
      day: 'Monday',
      time: '01:00 PM',
      room: 'Room 103',
      icon: 'fa-atom'
    },
    {
      className: 'Chemistry',
      classNumber: 'Class 04',
      subject: 'Chemistry',
      teacher: 'Ahmed Hassan',
      group: 'Group C',
      day: 'Tuesday',
      time: '10:00 AM',
      room: 'Room 105',
      icon: 'fa-flask'
    },
    {
      className: 'Arabic',
      classNumber: 'Class 05',
      subject: 'Arabic',
      teacher: 'Mohamed Ali',
      group: 'Group B',
      day: 'Wednesday',
      time: '02:00 PM',
      room: 'Room 201',
      icon: 'fa-book-open'
    }
  ];

  filteredSchedules: Schedule[] = [];

  // =========================================================
  // Filter Options
  // =========================================================

  days: string[] = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday'
  ];

  groups: string[] = [];
  teachers: string[] = [];

  searchValue: string = '';
  selectedDay: string = '';
  selectedGroup: string = '';
  selectedTeacher: string = '';

  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedSchedule: Schedule | null = null;

  // =========================================================
  // Add / Edit Schedule
  // =========================================================

  newSchedule = {
    className: '',
    classNumber: '',
    subject: '',
    teacher: '',
    group: '',
    day: '',
    time: '',
    room: '',
    icon: 'fa-calendar-days'
  };

  isEditMode: boolean = false;

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.updateFilterOptions();
    this.filteredSchedules = [...this.schedules];
  }

  // =========================================================
  // Statistics
  // =========================================================

  get todaysClassesCount(): number {

    const todayIndex = new Date().getDay();

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];

    const today = dayNames[todayIndex];

    return this.schedules.filter(
      schedule => schedule.day === today
    ).length;
  }

  get teachersCount(): number {

    return new Set(
      this.schedules
        .map(schedule => schedule.teacher)
        .filter(teacher => teacher.trim())
    ).size;
  }

  get groupsCount(): number {

    return new Set(
      this.schedules
        .map(schedule => schedule.group)
        .filter(group => group.trim())
    ).size;
  }

  // =========================================================
  // Initials
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
  // Filter Options
  // =========================================================

  updateFilterOptions(): void {

    this.groups = [
      ...new Set(
        this.schedules
          .map(schedule => schedule.group)
          .filter(group => group.trim())
      )
    ];

    this.teachers = [
      ...new Set(
        this.schedules
          .map(schedule => schedule.teacher)
          .filter(teacher => teacher.trim())
      )
    ];
  }

  // =========================================================
  // Filters
  // =========================================================

  applyFilters(): void {

    const search = this.searchValue
      .toLowerCase()
      .trim();

    this.filteredSchedules =
      this.schedules.filter(schedule => {

        const matchesSearch =
          !search ||
          schedule.className.toLowerCase().includes(search) ||
          schedule.subject.toLowerCase().includes(search) ||
          schedule.teacher.toLowerCase().includes(search) ||
          schedule.group.toLowerCase().includes(search) ||
          schedule.room.toLowerCase().includes(search);

        const matchesDay =
          !this.selectedDay ||
          schedule.day === this.selectedDay;

        const matchesGroup =
          !this.selectedGroup ||
          schedule.group === this.selectedGroup;

        const matchesTeacher =
          !this.selectedTeacher ||
          schedule.teacher === this.selectedTeacher;

        return (
          matchesSearch &&
          matchesDay &&
          matchesGroup &&
          matchesTeacher
        );
      });
  }

  // =========================================================
  // Add Schedule
  // =========================================================

  onAddScheduleClick(): void {

    this.isEditMode = false;

    this.selectedSchedule = null;

    this.newSchedule = {
      className: '',
      classNumber: '',
      subject: '',
      teacher: '',
      group: '',
      day: '',
      time: '',
      room: '',
      icon: 'fa-calendar-days'
    };

    this.isModalOpen = true;
  }

  // =========================================================
  // Close Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedSchedule = null;

    this.isEditMode = false;
  }

  // =========================================================
  // Save / Update Schedule
  // =========================================================

  saveSchedule(): void {

    if (
      !this.newSchedule.className.trim() ||
      !this.newSchedule.subject.trim() ||
      !this.newSchedule.teacher.trim() ||
      !this.newSchedule.group.trim() ||
      !this.newSchedule.day ||
      !this.newSchedule.time.trim() ||
      !this.newSchedule.room.trim()
    ) {
      return;
    }

    // =======================================================
    // Edit Existing Schedule
    // =======================================================

    if (this.isEditMode && this.selectedSchedule) {

      this.selectedSchedule.className =
        this.newSchedule.className.trim();

      this.selectedSchedule.subject =
        this.newSchedule.subject.trim();

      this.selectedSchedule.teacher =
        this.newSchedule.teacher.trim();

      this.selectedSchedule.group =
        this.newSchedule.group.trim();

      this.selectedSchedule.day =
        this.newSchedule.day;

      this.selectedSchedule.time =
        this.newSchedule.time.trim();

      this.selectedSchedule.room =
        this.newSchedule.room.trim();

    }

    // =======================================================
    // Add New Schedule
    // =======================================================

    else {

      const schedule: Schedule = {

        className:
          this.newSchedule.className.trim(),

        classNumber:
          this.newSchedule.classNumber.trim() ||
          `Class ${String(this.schedules.length + 1).padStart(2, '0')}`,

        subject:
          this.newSchedule.subject.trim(),

        teacher:
          this.newSchedule.teacher.trim(),

        group:
          this.newSchedule.group.trim(),

        day:
          this.newSchedule.day,

        time:
          this.newSchedule.time.trim(),

        room:
          this.newSchedule.room.trim(),

        icon:
          this.newSchedule.icon
      };

      this.schedules.push(schedule);
    }

    this.updateFilterOptions();

    this.applyFilters();

    this.closeModal();
  }

  // =========================================================
  // View Schedule
  // =========================================================

  viewSchedule(schedule: Schedule): void {

    this.selectedSchedule = schedule;

    this.isDetailsModalOpen = true;
  }

  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedSchedule = null;
  }

  // =========================================================
  // Edit Schedule
  // =========================================================

  editSchedule(schedule: Schedule): void {

    this.selectedSchedule = schedule;

    this.isEditMode = true;

    this.newSchedule = {

      className:
        schedule.className,

      classNumber:
        schedule.classNumber,

      subject:
        schedule.subject,

      teacher:
        schedule.teacher,

      group:
        schedule.group,

      day:
        schedule.day,

      time:
        schedule.time,

      room:
        schedule.room,

      icon:
        schedule.icon
    };

    this.isModalOpen = true;
  }

  // =========================================================
  // Delete Schedule
  // =========================================================

  deleteSchedule(schedule: Schedule): void {

    const index =
      this.schedules.indexOf(schedule);

    if (index !== -1) {

      this.schedules.splice(index, 1);

      this.updateFilterOptions();

      this.applyFilters();
    }
  }
}
