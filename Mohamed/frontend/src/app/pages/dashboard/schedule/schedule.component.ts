import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../../services/schedule/schedule.service';
import { ClassService } from '../../../services/classes/class.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  schedules: any[] = [];
  groups: any[] = [];

  loading = false;
  loadingGroups = false;

  errorMessage = '';
  successMessage = '';

  showModal = false;
  showDetails = false;

  editingSchedule: any = null;
  selectedSchedule: any = null;

  searchTerm = '';
  selectedDay = '';

  form: any = {
    groupId: '',
    type: 'weekly',
    dayOfWeek: '',
    specificDate: '',
    startTime: '',
    endTime: '',
    isActive: true
  };

  days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  constructor(
    private scheduleService: ScheduleService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.loadSchedules();
    this.loadGroups();
  }

  // =========================
  // LOAD SCHEDULES
  // =========================

  loadSchedules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.scheduleService.getSchedules().subscribe({
      next: (response: any) => {
        this.schedules = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Failed to load schedules';

        this.loading = false;
      }
    });
  }

  // =========================
  // LOAD GROUPS
  // =========================

  loadGroups(): void {
    this.loadingGroups = true;

    this.classService.getGroups().subscribe({
      next: (response: any) => {
        this.groups = response.data || response.groups || response || [];
        this.loadingGroups = false;
      },
      error: (error: any) => {
        console.error(error);

        this.errorMessage =
          error?.error?.message || 'Failed to load groups';

        this.loadingGroups = false;
      }
    });
  }

  // =========================
  // OPEN CREATE MODAL
  // =========================

  openCreateModal(): void {
    this.editingSchedule = null;

    this.form = {
      groupId: '',
      type: 'weekly',
      dayOfWeek: '',
      specificDate: '',
      startTime: '',
      endTime: '',
      isActive: true
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showModal = true;
  }

  // =========================
  // OPEN EDIT MODAL
  // =========================

  openEditModal(schedule: any): void {
    this.editingSchedule = schedule;

    this.form = {
      groupId: schedule.groupId?._id || schedule.groupId,
      type: schedule.type,
      dayOfWeek:
        schedule.dayOfWeek !== undefined
          ? schedule.dayOfWeek
          : '',
      specificDate: schedule.specificDate
        ? this.formatDateForInput(schedule.specificDate)
        : '',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.isActive
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showModal = true;
  }

  // =========================
  // CLOSE MODAL
  // =========================

  closeModal(): void {
    this.showModal = false;
    this.editingSchedule = null;
  }

  // =========================
  // SUBMIT
  // =========================

  submitSchedule(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.form.groupId) {
      this.errorMessage = 'Please select a group';
      return;
    }

    if (!this.form.startTime || !this.form.endTime) {
      this.errorMessage = 'Start time and end time are required';
      return;
    }

    if (this.form.startTime >= this.form.endTime) {
      this.errorMessage = 'End time must be after start time';
      return;
    }

    if (
      this.form.type === 'weekly' &&
      (this.form.dayOfWeek === '' || this.form.dayOfWeek === null)
    ) {
      this.errorMessage = 'Please select a day';
      return;
    }

    if (
      this.form.type === 'extra' &&
      !this.form.specificDate
    ) {
      this.errorMessage = 'Please select a date';
      return;
    }

    const data: any = {
      groupId: this.form.groupId,
      type: this.form.type,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      isActive: this.form.isActive
    };

    if (this.form.type === 'weekly') {
      data.dayOfWeek = Number(this.form.dayOfWeek);
    }

    if (this.form.type === 'extra') {
      data.specificDate = this.form.specificDate;
    }

    // CREATE
    if (!this.editingSchedule) {

      this.scheduleService.createSchedule(data).subscribe({
        next: (response: any) => {

          this.successMessage =
            response?.message || 'Schedule created successfully';

          this.closeModal();
          this.loadSchedules();
        },

        error: (error: any) => {
          console.error(error);

          this.errorMessage =
            error?.error?.message || 'Failed to create schedule';
        }
      });

      return;
    }

    // UPDATE
    this.scheduleService
      .updateSchedule(this.editingSchedule._id, data)
      .subscribe({
        next: (response: any) => {

          this.successMessage =
            response?.message || 'Schedule updated successfully';

          this.closeModal();
          this.loadSchedules();
        },

        error: (error: any) => {
          console.error(error);

          this.errorMessage =
            error?.error?.message || 'Failed to update schedule';
        }
      });
  }

  // =========================
  // DELETE
  // =========================

  deleteSchedule(schedule: any): void {

    const groupName =
      schedule.groupId?.groupName || 'this schedule';

    if (!confirm(`Delete schedule for ${groupName}?`)) {
      return;
    }

    this.scheduleService
      .deleteSchedule(schedule._id)
      .subscribe({

        next: () => {
          this.successMessage =
            'Schedule deleted successfully';

          this.loadSchedules();
        },

        error: (error: any) => {
          console.error(error);

          this.errorMessage =
            error?.error?.message || 'Failed to delete schedule';
        }
      });
  }

  // =========================
  // DETAILS
  // =========================

  openDetails(schedule: any): void {
    this.selectedSchedule = schedule;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedSchedule = null;
  }

  // =========================
  // HELPERS
  // =========================

  getDayName(day: number): string {
    const dayObject = this.days.find(
      d => d.value === Number(day)
    );

    return dayObject?.label || '-';
  }

  getGroupName(schedule: any): string {
    return schedule.groupId?.groupName || '-';
  }

  getGradeName(schedule: any): string {
    return schedule.groupId?.gradeLevelId?.name || '-';
  }

  getTeacherName(schedule: any): string {
    const teacher = schedule.groupId?.teacherId;

    if (!teacher) {
      return '-';
    }

    if (teacher.userId?.name) {
      return teacher.userId.name;
    }

    if (teacher.name) {
      return teacher.name;
    }

    return '-';
  }

  formatDateForInput(date: string): string {
    if (!date) {
      return '';
    }

    return new Date(date)
      .toISOString()
      .split('T')[0];
  }

  formatDate(date: string): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString();
  }

  // =========================
  // FILTER
  // =========================

  get filteredSchedules(): any[] {

    return this.schedules.filter(schedule => {

      const groupName =
        schedule.groupId?.groupName?.toLowerCase() || '';

      const teacherName =
        this.getTeacherName(schedule).toLowerCase();

      const search =
        this.searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        groupName.includes(search) ||
        teacherName.includes(search);

      const matchesDay =
        !this.selectedDay ||
        schedule.dayOfWeek?.toString() === this.selectedDay;

      return matchesSearch && matchesDay;
    });
  }

  // =========================
  // STATISTICS
  // =========================

  get totalSchedules(): number {
    return this.schedules.length;
  }

  get weeklySchedules(): number {
    return this.schedules.filter(
      s => s.type === 'weekly'
    ).length;
  }

  get extraSchedules(): number {
    return this.schedules.filter(
      s => s.type === 'extra'
    ).length;
  }

  get activeSchedules(): number {
    return this.schedules.filter(
      s => s.isActive
    ).length;
  }
}