import { Component, OnInit } from '@angular/core';
import { ScheduleService, ScheduleBackend } from '../../../services/schedule/schedule.service';

export interface ScheduleUI {
  id?: string;
  className: string;
  classNumber: string;
  subject: string;
  teacher: string;
  teacherId?: string;
  group: string;
  groupId?: string;
  day: string;
  startTime: string;
  endTime: string;
  time: string; // Added for UI binding
  type: string;
  room: string;
  icon: string;
}

export interface OptionItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  schedules: ScheduleUI[] = [];
  filteredSchedules: ScheduleUI[] = [];

  teacherOptions: OptionItem[] = [];
  groupOptions: OptionItem[] = [];

  days: string[] = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  groups: string[] = [];
  teachers: string[] = [];

  searchValue: string = '';
  selectedDay: string = '';
  selectedGroup: string = '';
  selectedTeacher: string = '';

  // Modals
  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;

  selectedSchedule: ScheduleUI | null = null;

  newSchedule = {
    id: '',
    className: '',
    classNumber: '',
    subject: '',
    teacherId: '',
    groupId: '',
    teacher: '',
    group: '',
    day: 'Saturday',
    type: 'weekly',
    startTime: '09:00',
    endTime: '10:00',
    time: '09:00 - 10:00',
    room: 'Room 101',
    icon: 'fa-calendar-days'
  };

  constructor(private scheduleService: ScheduleService) {}

  ngOnInit(): void {
    this.fetchSchedules();
    this.fetchDropdownOptions();
  }

  fetchSchedules(): void {
    this.scheduleService.getSchedules().subscribe({
      next: (res: any) => {
        const rawList = res?.data || res?.schedules || res || [];
        const items = Array.isArray(rawList) ? rawList : [];
        this.schedules = items.map((item: any, index: number) => this.mapToUI(item, index));
        this.updateFilterOptions();
        this.applyFilters();
      },
      error: (err: any) => console.error('Failed to load schedules:', err)
    });
  }

  fetchDropdownOptions(): void {
    this.scheduleService.getTeachers().subscribe({
      next: (res: any) => {
        const rawData = res?.data?.teachers || res?.teachers || res?.data || res || [];
        const teachers = Array.isArray(rawData) ? rawData : [];
        this.teacherOptions = teachers.map((t: any) => ({
          id: t._id || t.id,
          name: t.fullName || t.name || t.userId?.fullName || 'Teacher'
        }));
      },
      error: (err: any) => console.error('Failed to load teachers:', err)
    });

    this.scheduleService.getGroups().subscribe({
      next: (res: any) => {
        const rawData = res?.data?.groups || res?.groups || res?.data || res || [];
        const groups = Array.isArray(rawData) ? rawData : [];
        this.groupOptions = groups.map((g: any) => ({
          id: g._id || g.id,
          name: g.groupName || g.name || 'Group'
        }));
      },
      error: (err: any) => console.error('Failed to load groups:', err)
    });
  }

  private mapToUI(item: any, index: number): ScheduleUI {
    const teacherObj = typeof item.teacherId === 'object' ? item.teacherId : null;
    const groupObj = typeof item.groupId === 'object' ? item.groupId : null;

    const teacherName = teacherObj?.fullName || teacherObj?.name || item.teacher || 'Unassigned';
    const groupName = groupObj?.groupName || groupObj?.name || item.group || 'Unassigned';
    const startTime = item.startTime || '09:00';
    const endTime = item.endTime || '10:00';

    return {
      id: item._id || item.id,
      className: item.className || item.subject || 'Subject Class',
      classNumber: item.classCode || item.classNumber || `Class ${String(index + 1).padStart(2, '0')}`,
      subject: item.subject || item.className || 'General',
      teacher: teacherName,
      teacherId: teacherObj?._id || (typeof item.teacherId === 'string' ? item.teacherId : ''),
      group: groupName,
      groupId: groupObj?._id || (typeof item.groupId === 'string' ? item.groupId : ''),
      day: item.day || 'Saturday',
      startTime: startTime,
      endTime: endTime,
      time: `${startTime} - ${endTime}`,
      type: item.type || 'weekly',
      room: item.room || 'Room 101',
      icon: item.icon || 'fa-book'
    };
  }

  get todaysClassesCount(): number {
    const todayIndex = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[todayIndex];

    return this.schedules.filter(schedule => schedule.day.toLowerCase() === today.toLowerCase()).length;
  }

  get teachersCount(): number {
    return new Set(this.schedules.map(schedule => schedule.teacher).filter(teacher => teacher && teacher.trim() !== 'Unassigned')).size;
  }

  get groupsCount(): number {
    return new Set(this.schedules.map(schedule => schedule.group).filter(group => group && group.trim() !== 'Unassigned')).size;
  }

  getInitials(name: string): string {
    if (!name || name === 'Unassigned') return 'NA';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  updateFilterOptions(): void {
    this.groups = [...new Set(this.schedules.map(schedule => schedule.group).filter(group => group.trim()))];
    this.teachers = [...new Set(this.schedules.map(schedule => schedule.teacher).filter(teacher => teacher.trim()))];
  }

  applyFilters(): void {
    const search = this.searchValue.toLowerCase().trim();

    this.filteredSchedules = this.schedules.filter(schedule => {
      const matchesSearch =
        !search ||
        schedule.className.toLowerCase().includes(search) ||
        schedule.subject.toLowerCase().includes(search) ||
        schedule.teacher.toLowerCase().includes(search) ||
        schedule.group.toLowerCase().includes(search) ||
        schedule.room.toLowerCase().includes(search);

      const matchesDay = !this.selectedDay || schedule.day === this.selectedDay;
      const matchesGroup = !this.selectedGroup || schedule.group === this.selectedGroup;
      const matchesTeacher = !this.selectedTeacher || schedule.teacher === this.selectedTeacher;

      return matchesSearch && matchesDay && matchesGroup && matchesTeacher;
    });
  }

  onAddScheduleClick(): void {
    this.isEditMode = false;
    this.selectedSchedule = null;

    this.newSchedule = {
      id: '',
      className: '',
      classNumber: `Class ${String(this.schedules.length + 1).padStart(2, '0')}`,
      subject: '',
      teacherId: this.teacherOptions[0]?.id || '',
      groupId: this.groupOptions[0]?.id || '',
      teacher: '',
      group: '',
      day: 'Saturday',
      type: 'weekly',
      startTime: '09:00',
      endTime: '10:00',
      time: '09:00 - 10:00',
      room: 'Room 101',
      icon: 'fa-calendar-days'
    };

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedSchedule = null;
    this.isEditMode = false;
    this.isSaving = false;
  }

saveSchedule(): void {
    if (!this.newSchedule.className.trim() || !this.newSchedule.subject.trim()) {
      alert('Class Name and Subject are required.');
      return;
    }

    // Validate Group ID
    if (!this.newSchedule.groupId) {
      alert('Group is required. Please select a valid group.');
      return;
    }

    this.isSaving = true;

    let startTime = this.newSchedule.startTime;
    let endTime = this.newSchedule.endTime;
    if (this.newSchedule.time && this.newSchedule.time.includes('-')) {
      const parts = this.newSchedule.time.split('-').map(p => p.trim());
      if (parts.length === 2) {
        startTime = parts[0];
        endTime = parts[1];
      }
    }

    // Map day string to integer (0-6)
    const dayMap: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    const rawDay = this.newSchedule.day;
    const dayNumber = (dayMap[rawDay] !== undefined) ? Number(dayMap[rawDay]) : 0;

    const payload: any = {
      className: this.newSchedule.className.trim(),
      subject: this.newSchedule.subject.trim(),
      dayOfWeek: dayNumber, // Changed from 'day' to 'dayOfWeek' based on the error message
      day: dayNumber,       // Leaving 'day' as well just in case the backend checks both
      type: this.newSchedule.type,
      startTime: startTime,
      endTime: endTime,
      room: this.newSchedule.room.trim(),
      teacherId: this.newSchedule.teacherId || undefined,
      groupId: this.newSchedule.groupId // Must be a valid selected ID
    };

    console.log('Submitting payload:', payload);

    if (this.isEditMode && this.selectedSchedule?.id) {
      this.scheduleService.updateSchedule(this.selectedSchedule.id, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.fetchSchedules();
          this.closeModal();
        },
        error: (err: any) => {
          this.isSaving = false;
          alert(`Update failed: ${err?.error?.message || err?.message || 'Server error'}`);
        }
      });
    } else {
      this.scheduleService.createSchedule(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.fetchSchedules();
          this.closeModal();
        },
        error: (err: any) => {
          this.isSaving = false;
          alert(`Save failed: ${err?.error?.message || err?.message || 'Server error'}`);
        }
      });
    }
  }

  viewSchedule(schedule: ScheduleUI): void {
    this.selectedSchedule = schedule;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedSchedule = null;
  }

  editSchedule(schedule: ScheduleUI): void {
    this.selectedSchedule = schedule;
    this.isEditMode = true;

    this.newSchedule = {
      id: schedule.id || '',
      className: schedule.className,
      classNumber: schedule.classNumber,
      subject: schedule.subject,
      teacherId: schedule.teacherId || '',
      groupId: schedule.groupId || '',
      teacher: schedule.teacher,
      group: schedule.group,
      day: schedule.day,
      type: schedule.type,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      time: schedule.time,
      room: schedule.room,
      icon: schedule.icon
    };

    this.isModalOpen = true;
  }

  deleteSchedule(schedule: ScheduleUI): void {
    if (!schedule.id) return;

    if (confirm(`Are you sure you want to delete ${schedule.className}?`)) {
      this.scheduleService.deleteSchedule(schedule.id).subscribe({
        next: () => this.fetchSchedules(),
        error: (err: any) => alert(`Delete failed: ${err?.error?.message || err?.message}`)
      });
    }
  }
}
