import { Component, OnInit } from '@angular/core';

interface Group {
  name: string;
  gradelevel: string;
  studentsCount: number;
  schedule: string;
  teacher: string;
}

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

  // =========================================================
  // Groups Data
  // =========================================================

  groups: Group[] = [
    {
      name: 'Group A',
      gradelevel: 'Grade 1',
      studentsCount: 20,
      schedule: 'Saturday - Monday 10:00 AM',
      teacher: 'Ahmed Hassan'
    },
    {
      name: 'Group B',
      gradelevel: 'Grade 2',
      studentsCount: 18,
      schedule: 'Sunday - Tuesday 12:00 PM',
      teacher: 'Mohamed Omar'
    },
    {
      name: 'Group C',
      gradelevel: 'Grade 3',
      studentsCount: 22,
      schedule: 'Monday - Wednesday 02:00 PM',
      teacher: 'Youssef Farag'
    }
  ];

  // Groups displayed after filtering
  filteredGroups: Group[] = [];

  // =========================================================
  // Filter Options
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
  // New / Edited Group
  // =========================================================

  newGroup = {
    name: '',
    gradelevel: '',
    studentsCount: 0,
    schedule: '',
    teacher: ''
  };

  isEditMode: boolean = false;

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.updateFilterOptions();
    this.filteredGroups = [...this.groups];
  }

  // =========================================================
  // Statistics
  // =========================================================

  get totalStudentsCount(): number {
    return this.groups.reduce(
      (total, group) => total + Number(group.studentsCount),
      0
    );
  }

  get gradeLevelsCount(): number {
    return new Set(
      this.groups
        .map(group => group.gradelevel)
        .filter(level => level.trim())
    ).size;
  }

  get teachersCount(): number {
    return new Set(
      this.groups
        .map(group => group.teacher)
        .filter(teacher => teacher.trim())
    ).size;
  }

  // =========================================================
  // Initials
  // =========================================================

  getInitial(name: string): string {
    if (!name) {
      return '';
    }

    return name.charAt(0).toUpperCase();
  }

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

    this.gradeLevels = [
      ...new Set(
        this.groups
          .map(group => group.gradelevel)
          .filter(level => level.trim())
      )
    ];

    this.teachers = [
      ...new Set(
        this.groups
          .map(group => group.teacher)
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

    this.filteredGroups = this.groups.filter(group => {

      const matchesSearch =
        !search ||
        group.name.toLowerCase().includes(search) ||
        group.gradelevel.toLowerCase().includes(search) ||
        group.teacher.toLowerCase().includes(search) ||
        group.schedule.toLowerCase().includes(search);

      const matchesGrade =
        !this.selectedGradeLevel ||
        group.gradelevel === this.selectedGradeLevel;

      const matchesTeacher =
        !this.selectedTeacher ||
        group.teacher === this.selectedTeacher;

      return (
        matchesSearch &&
        matchesGrade &&
        matchesTeacher
      );
    });
  }

  // =========================================================
  // Add Group
  // =========================================================

  onAddGroupClick(): void {

    this.isEditMode = false;
    this.selectedGroup = null;

    this.newGroup = {
      name: '',
      gradelevel: '',
      studentsCount: 0,
      schedule: '',
      teacher: ''
    };

    this.isModalOpen = true;
  }

  // =========================================================
  // Close Add / Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;
    this.selectedGroup = null;
    this.isEditMode = false;
  }

  // =========================================================
  // Save / Update Group
  // =========================================================

  saveGroup(): void {

    if (
      !this.newGroup.name.trim() ||
      !this.newGroup.gradelevel.trim()
    ) {
      return;
    }

    // =======================================================
    // Edit Existing Group
    // =======================================================

    if (this.isEditMode && this.selectedGroup) {

      this.selectedGroup.name =
        this.newGroup.name.trim();

      this.selectedGroup.gradelevel =
        this.newGroup.gradelevel.trim();

      this.selectedGroup.studentsCount =
        Number(this.newGroup.studentsCount);

      this.selectedGroup.schedule =
        this.newGroup.schedule.trim();

      this.selectedGroup.teacher =
        this.newGroup.teacher.trim();
    }

    // =======================================================
    // Add New Group
    // =======================================================

    else {

      const group: Group = {

        name: this.newGroup.name.trim(),

        gradelevel:
          this.newGroup.gradelevel.trim(),

        studentsCount:
          Number(this.newGroup.studentsCount),

        schedule:
          this.newGroup.schedule.trim(),

        teacher:
          this.newGroup.teacher.trim()
      };

      this.groups.push(group);
    }

    // Refresh filter options
    this.updateFilterOptions();

    // Refresh table
    this.applyFilters();

    // Close modal
    this.closeModal();
  }

  // =========================================================
  // View Group
  // =========================================================

  viewGroup(group: Group): void {

    this.selectedGroup = group;

    this.isDetailsModalOpen = true;
  }

  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedGroup = null;
  }

  // =========================================================
  // Edit Group
  // =========================================================

  editGroup(group: Group): void {

    this.selectedGroup = group;

    this.isEditMode = true;

    this.newGroup = {

      name: group.name,

      gradelevel:
        group.gradelevel,

      studentsCount:
        group.studentsCount,

      schedule:
        group.schedule,

      teacher:
        group.teacher
    };

    this.isModalOpen = true;
  }

  // =========================================================
  // Delete Group
  // =========================================================

  deleteGroup(group: Group): void {

    const index =
      this.groups.indexOf(group);

    if (index !== -1) {

      this.groups.splice(index, 1);

      this.updateFilterOptions();

      this.applyFilters();
    }
  }
}
