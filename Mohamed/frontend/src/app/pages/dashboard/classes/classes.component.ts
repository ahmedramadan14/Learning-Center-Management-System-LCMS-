import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../services/classes/class.service';

interface Group {
  _id?: string;

  groupName: string;
  gradeLevelId: string;
  teacherId: string;

  maxCapacity: number;
  sessionPrice: number;
  sessionsPerCycle: number;

  billingAnchorDate?: string | Date | null;

  isActive: boolean;

  // Optional populated objects from backend
  gradeLevel?: {
    _id?: string;
    name?: string;
    gradeName?: string;
  };

  teacher?: {
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

  // =========================================================
  // Data
  // =========================================================

  groups: Group[] = [];

  filteredGroups: Group[] = [];

  // =========================================================
  // Loading / Error
  // =========================================================

  isLoading: boolean = false;

  errorMessage: string = '';

  // =========================================================
  // Filters
  // =========================================================

  gradeLevels: string[] = [];

  teachers: string[] = [];

  searchValue: string = '';

  selectedGradeLevel: string = '';

  selectedTeacher: string = '';

  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;

  isDetailsModalOpen: boolean = false;

  selectedGroup: Group | null = null;

  // =========================================================
  // Edit Mode
  // =========================================================

  isEditMode: boolean = false;

  // =========================================================
  // New Group
  // =========================================================

  newGroup: {
    groupName: string;
    gradeLevelId: string;
    teacherId: string;
    maxCapacity: number;
    sessionPrice: number;
    sessionsPerCycle: number;
    billingAnchorDate: string;
    isActive: boolean;
  } = this.getEmptyGroup();

  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private classService: ClassService
  ) {}

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.loadGroups();
  }

  // =========================================================
  // Empty Group
  // =========================================================

  private getEmptyGroup() {
    return {
      groupName: '',
      gradeLevelId: '',
      teacherId: '',
      maxCapacity: 30,
      sessionPrice: 0,
      sessionsPerCycle: 8,
      billingAnchorDate: '',
      isActive: true
    };
  }

  // =========================================================
  // Load Groups
  // =========================================================

  loadGroups(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.classService.getGroups().subscribe({

      next: (response: any) => {

        console.log('Groups API Response:', response);

        if (response?.data) {

          if (Array.isArray(response.data)) {
            this.groups = response.data;
          }

          else if (Array.isArray(response.data.groups)) {
            this.groups = response.data.groups;
          }

          else {
            this.groups = [];
          }

        }

        else if (Array.isArray(response)) {
          this.groups = response;
        }

        else {
          this.groups = [];
        }

        this.updateFilterOptions();

        this.applyFilters();

        this.isLoading = false;
      },

      error: (error) => {

        console.error('Error loading groups:', error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to load groups.';

        this.groups = [];

        this.filteredGroups = [];

        this.isLoading = false;
      }

    });

  }

  // =========================================================
  // Statistics
  // =========================================================

  get totalStudentsCount(): number {

    return this.groups.reduce(
      (total, group) => {

        const currentStudents =
          this.getStudentsCount(group);

        return total + currentStudents;

      },
      0
    );

  }

  get gradeLevelsCount(): number {

    return new Set(

      this.groups

        .map(group =>
          this.getGradeLevelName(group)
        )

        .filter(level => level.trim())

    ).size;

  }

  get teachersCount(): number {

    return new Set(

      this.groups

        .map(group =>
          this.getTeacherName(group)
        )

        .filter(teacher => teacher.trim())

    ).size;

  }

  // =========================================================
  // Students Count
  // =========================================================

  getStudentsCount(group: Group): number {

    /*
     * Backend Group model currently has maxCapacity,
     * not studentsCount.
     *
     * So we use 0 until the backend provides
     * actual enrolled students count.
     */

    const groupWithStudents = group as any;

    if (
      groupWithStudents.studentsCount !== undefined
    ) {

      return Number(
        groupWithStudents.studentsCount
      ) || 0;

    }

    return 0;
  }

  // =========================================================
  // Grade Level Name
  // =========================================================

  getGradeLevelName(group: Group): string {

    if (group.gradeLevel) {

      return (
        group.gradeLevel.name ||
        group.gradeLevel.gradeName ||
        group.gradeLevel._id ||
        ''
      );

    }

    return group.gradeLevelId || '';

  }

  // =========================================================
  // Backward Compatibility
  // =========================================================

  getGradeName(group: Group): string {

    return this.getGradeLevelName(group);

  }

  // =========================================================
  // Teacher Name
  // =========================================================

  getTeacherName(group: Group): string {

    if (group.teacher) {

      if (group.teacher.name) {
        return group.teacher.name;
      }

      const fullName = [
        group.teacher.firstName,
        group.teacher.lastName
      ]
        .filter(Boolean)
        .join(' ');

      if (fullName) {
        return fullName;
      }

      if (group.teacher._id) {
        return group.teacher._id;
      }

    }

    return group.teacherId || '';

  }

  // =========================================================
  // Initial
  // =========================================================

  getInitial(name: string): string {

    if (!name) {
      return '';
    }

    return name
      .charAt(0)
      .toUpperCase();

  }

  // =========================================================
  // Initials
  // =========================================================

  getInitials(name: string): string {

    if (!name) {
      return '';
    }

    return name

      .split(' ')

      .filter(word => word.length > 0)

      .map(word =>
        word.charAt(0)
      )

      .join('')

      .substring(0, 2)

      .toUpperCase();

  }

  // =========================================================
  // Filter Options
  // =========================================================

  updateFilterOptions(): void {

    this.gradeLevels = [

      ...new Set(

        this.groups

          .map(group =>
            this.getGradeLevelName(group)
          )

          .filter(level =>
            level.trim()
          )

      )

    ];

    this.teachers = [

      ...new Set(

        this.groups

          .map(group =>
            this.getTeacherName(group)
          )

          .filter(teacher =>
            teacher.trim()
          )

      )

    ];

  }

  // =========================================================
  // Filters
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchValue
        .toLowerCase()
        .trim();

    this.filteredGroups =
      this.groups.filter(group => {

        const groupName =
          group.groupName || '';

        const gradeName =
          this.getGradeLevelName(group);

        const teacherName =
          this.getTeacherName(group);

        const schedule =
          this.getSchedule(group);

        const matchesSearch =
          !search ||

          groupName
            .toLowerCase()
            .includes(search) ||

          gradeName
            .toLowerCase()
            .includes(search) ||

          teacherName
            .toLowerCase()
            .includes(search) ||

          schedule
            .toLowerCase()
            .includes(search);

        const matchesGrade =
          !this.selectedGradeLevel ||

          gradeName ===
          this.selectedGradeLevel;

        const matchesTeacher =
          !this.selectedTeacher ||

          teacherName ===
          this.selectedTeacher;

        return (
          matchesSearch &&
          matchesGrade &&
          matchesTeacher
        );

      });

  }

  // =========================================================
  // Schedule
  // =========================================================

  getSchedule(group: Group): string {

    const groupWithSchedule =
      group as any;

    if (groupWithSchedule.schedule) {

      return groupWithSchedule.schedule;

    }

    return 'Not assigned';

  }

  // =========================================================
  // Add Group
  // =========================================================

  onAddGroupClick(): void {

    this.isEditMode = false;

    this.selectedGroup = null;

    this.newGroup =
      this.getEmptyGroup();

    this.isModalOpen = true;

  }

  // =========================================================
  // Close Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedGroup = null;

    this.isEditMode = false;

    this.newGroup =
      this.getEmptyGroup();

  }

  // =========================================================
  // Save Group
  // =========================================================

  saveGroup(): void {

    if (
      !this.newGroup.groupName.trim() ||
      !this.newGroup.gradeLevelId.trim() ||
      !this.newGroup.teacherId.trim()
    ) {

      return;

    }

    const payload = {

      groupName:
        this.newGroup.groupName.trim(),

      gradeLevelId:
        this.newGroup.gradeLevelId.trim(),

      teacherId:
        this.newGroup.teacherId.trim(),

      maxCapacity:
        Number(this.newGroup.maxCapacity),

      sessionPrice:
        Number(this.newGroup.sessionPrice),

      sessionsPerCycle:
        Number(this.newGroup.sessionsPerCycle),

      billingAnchorDate:
        this.newGroup.billingAnchorDate
          ? this.newGroup.billingAnchorDate
          : undefined,

      isActive:
        Boolean(this.newGroup.isActive)

    };

    // =======================================================
    // UPDATE
    // =======================================================

    if (
      this.isEditMode &&
      this.selectedGroup?._id
    ) {

      this.isLoading = true;

      this.classService
        .updateGroup(
          this.selectedGroup._id,
          payload
        )
        .subscribe({

          next: () => {

            this.closeModal();

            this.loadGroups();

          },

          error: (error) => {

            console.error(
              'Error updating group:',
              error
            );

            this.errorMessage =
              error?.error?.message ||
              'Failed to update group.';

            this.isLoading = false;

          }

        });

      return;

    }

    // =======================================================
    // CREATE
    // =======================================================

    this.isLoading = true;

    this.classService
      .createGroup(payload)
      .subscribe({

        next: () => {

          this.closeModal();

          this.loadGroups();

        },

        error: (error) => {

          console.error(
            'Error creating group:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to create group.';

          this.isLoading = false;

        }

      });

  }

  // =========================================================
  // View Group
  // =========================================================

  viewGroup(group: Group): void {

    this.selectedGroup =
      group;

    this.isDetailsModalOpen =
      true;

  }

  // =========================================================
  // Close Details
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen =
      false;

    this.selectedGroup =
      null;

  }

  // =========================================================
  // Edit Group
  // =========================================================

  editGroup(group: Group): void {

    if (!group) {
      return;
    }

    this.selectedGroup =
      group;

    this.isEditMode =
      true;

    this.newGroup = {

      groupName:
        group.groupName || '',

      gradeLevelId:
        group.gradeLevelId || '',

      teacherId:
        group.teacherId || '',

      maxCapacity:
        Number(group.maxCapacity) || 30,

      sessionPrice:
        Number(group.sessionPrice) || 0,

      sessionsPerCycle:
        Number(group.sessionsPerCycle) || 8,

      billingAnchorDate:
        group.billingAnchorDate
          ? this.formatDateForInput(
              group.billingAnchorDate
            )
          : '',

      isActive:
        group.isActive !== false

    };

    this.isModalOpen =
      true;

  }

  // =========================================================
  // Format Date
  // =========================================================

  private formatDateForInput(
    date: string | Date
  ): string {

    const d =
      new Date(date);

    if (isNaN(d.getTime())) {
      return '';
    }

    return d
      .toISOString()
      .substring(0, 10);

  }

  // =========================================================
  // Delete Group
  // =========================================================

  deleteGroup(group: Group): void {

    if (!group?._id) {

      console.error(
        'Group ID is missing.'
      );

      return;

    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${group.groupName}"?`
      );

    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.classService
      .deleteGroup(group._id)
      .subscribe({

        next: () => {

          this.loadGroups();

        },

        error: (error) => {

          console.error(
            'Error deleting group:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete group.';

          this.isLoading = false;

        }

      });

  }

}