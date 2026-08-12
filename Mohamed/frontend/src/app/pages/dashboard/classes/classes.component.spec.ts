import { Component, OnInit } from '@angular/core';
import { ClassService } from '../../../services/classes/class.service';

interface Group {

  _id?: string;

  groupName: string;

  gradeLevelId: any;

  teacherId: any;

  maxCapacity: number;

  sessionPrice: number;

  sessionsPerCycle: number;

  billingAnchorDate?: string | Date;

  isActive: boolean;

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
  // Groups
  // =========================================================

  groups: Group[] = [];

  filteredGroups: Group[] = [];


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
  // New Group
  // =========================================================

  newGroup = {

    groupName: '',

    gradeLevelId: '',

    teacherId: '',

    maxCapacity: 30,

    sessionPrice: 0,

    sessionsPerCycle: 8,

    billingAnchorDate: '',

    isActive: true

  };


  isEditMode: boolean = false;


  // =========================================================
  // Loading
  // =========================================================

  isLoading: boolean = false;


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
  // Load Groups
  // =========================================================

  loadGroups(): void {

    this.isLoading = true;

    this.classService.getGroups().subscribe({

      next: (response: any) => {

        console.log(
          'Groups API Response:',
          response
        );


        // -----------------------------------------------
        // Handle different API response structures
        // -----------------------------------------------

        if (Array.isArray(response?.data)) {

          this.groups = response.data;

        }

        else if (
          Array.isArray(response?.data?.data)
        ) {

          this.groups = response.data.data;

        }

        else if (Array.isArray(response)) {

          this.groups = response;

        }

        else {

          this.groups = [];

        }


        // -----------------------------------------------
        // Filtered Groups
        // -----------------------------------------------

        this.filteredGroups = [
          ...this.groups
        ];


        // -----------------------------------------------
        // Filter Options
        // -----------------------------------------------

        this.updateFilterOptions();


        this.isLoading = false;

      },

      error: (error) => {

        console.error(
          'Error loading groups:',
          error
        );

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

      (total, group) =>

        total +
        Number(group.maxCapacity || 0),

      0

    );

  }


  get gradeLevelsCount(): number {

    return new Set(

      this.groups

        .map(group =>
          this.getGradeLevelName(group)
        )

        .filter(level =>
          level &&
          level !== 'N/A'
        )

    ).size;

  }


  get teachersCount(): number {

    return new Set(

      this.groups

        .map(group =>
          this.getTeacherName(group)
        )

        .filter(teacher =>
          teacher &&
          teacher !== 'N/A'
        )

    ).size;

  }


  // =========================================================
  // Grade Level Name
  // =========================================================

  getGradeLevelName(
    group: Group
  ): string {

    if (!group.gradeLevelId) {

      return 'N/A';

    }


    // If backend populated Grade
    if (
      typeof group.gradeLevelId === 'object'
    ) {

      return (

        group.gradeLevelId.name ||

        group.gradeLevelId.gradeName ||

        group.gradeLevelId.title ||

        group.gradeLevelId._id ||

        'N/A'

      );

    }


    return String(
      group.gradeLevelId
    );

  }


  // =========================================================
  // Teacher Name
  // =========================================================

  getTeacherName(
    group: Group
  ): string {

    if (!group.teacherId) {

      return 'N/A';

    }


    // If backend populated Teacher
    if (
      typeof group.teacherId === 'object'
    ) {

      const teacher =
        group.teacherId;


      if (teacher.name) {

        return teacher.name;

      }


      if (teacher.fullName) {

        return teacher.fullName;

      }


      const fullName =

        `${teacher.firstName || ''} ${teacher.lastName || ''}`
          .trim();


      if (fullName) {

        return fullName;

      }


      return (
        teacher._id ||
        'N/A'
      );

    }


    return String(
      group.teacherId
    );

  }


  // =========================================================
  // Initial
  // =========================================================

  getInitial(
    name: string
  ): string {

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

  getInitials(
    name: string
  ): string {

    if (!name) {

      return '';

    }


    return name

      .split(' ')

      .filter(word =>
        word.length > 0
      )

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
            level &&
            level !== 'N/A'
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
            teacher &&
            teacher !== 'N/A'
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

          group.groupName
            ?.toLowerCase() || '';


        const grade =

          this.getGradeLevelName(group)
            .toLowerCase();


        const teacher =

          this.getTeacherName(group)
            .toLowerCase();


        // -----------------------------------------------
        // Search
        // -----------------------------------------------

        const matchesSearch =

          !search ||

          groupName.includes(search) ||

          grade.includes(search) ||

          teacher.includes(search);


        // -----------------------------------------------
        // Grade
        // -----------------------------------------------

        const matchesGrade =

          !this.selectedGradeLevel ||

          this.getGradeLevelName(group) ===
          this.selectedGradeLevel;


        // -----------------------------------------------
        // Teacher
        // -----------------------------------------------

        const matchesTeacher =

          !this.selectedTeacher ||

          this.getTeacherName(group) ===
          this.selectedTeacher;


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

      groupName: '',

      gradeLevelId: '',

      teacherId: '',

      maxCapacity: 30,

      sessionPrice: 0,

      sessionsPerCycle: 8,

      billingAnchorDate: '',

      isActive: true

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Close Modal
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


    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (

      !this.newGroup.groupName.trim() ||

      !this.newGroup.gradeLevelId ||

      !this.newGroup.teacherId

    ) {

      alert(
        'Please enter Group Name, Grade Level and Teacher.'
      );

      return;

    }


    // -----------------------------------------------
    // Payload
    // -----------------------------------------------

    const payload = {

      groupName:
        this.newGroup.groupName.trim(),

      gradeLevelId:
        this.newGroup.gradeLevelId,

      teacherId:
        this.newGroup.teacherId,

      maxCapacity:
        Number(
          this.newGroup.maxCapacity
        ),

      sessionPrice:
        Number(
          this.newGroup.sessionPrice
        ),

      sessionsPerCycle:
        Number(
          this.newGroup.sessionsPerCycle
        ),

      billingAnchorDate:
        this.newGroup.billingAnchorDate ||
        undefined,

      isActive:
        this.newGroup.isActive

    };


    // =================================================
    // UPDATE
    // =================================================

    if (

      this.isEditMode &&

      this.selectedGroup?._id

    ) {


      this.classService

        .updateGroup(

          this.selectedGroup._id,

          payload

        )

        .subscribe({

          next: (response) => {

            console.log(
              'Group updated:',
              response
            );

            this.loadGroups();

            this.closeModal();

          },

          error: (error) => {

            console.error(
              'Update Group Error:',
              error
            );

            alert(

              error?.error?.message ||

              'Failed to update group.'

            );

          }

        });


      return;

    }


    // =================================================
    // CREATE
    // =================================================

    this.classService

      .createGroup(payload)

      .subscribe({

        next: (response) => {

          console.log(
            'Group created:',
            response
          );

          this.loadGroups();

          this.closeModal();

        },

        error: (error) => {

          console.error(
            'Create Group Error:',
            error
          );

          alert(

            error?.error?.message ||

            'Failed to create group.'

          );

        }

      });

  }


  // =========================================================
  // View Group
  // =========================================================

  viewGroup(
    group: Group
  ): void {

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

  editGroup(
    group: Group
  ): void {

    this.selectedGroup = group;

    this.isEditMode = true;


    this.newGroup = {

      groupName:
        group.groupName,


      gradeLevelId:

        typeof group.gradeLevelId === 'object'

          ? group.gradeLevelId._id

          : group.gradeLevelId,


      teacherId:

        typeof group.teacherId === 'object'

          ? group.teacherId._id

          : group.teacherId,


      maxCapacity:
        group.maxCapacity,


      sessionPrice:
        group.sessionPrice,


      sessionsPerCycle:
        group.sessionsPerCycle,


      billingAnchorDate:

        group.billingAnchorDate

          ? String(
              group.billingAnchorDate
            )

          : '',


      isActive:
        group.isActive

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Delete Group
  // =========================================================

  deleteGroup(
    group: Group
  ): void {


    if (!group._id) {

      return;

    }


    const confirmed =

      confirm(

        `Are you sure you want to delete "${group.groupName}"?`

      );


    if (!confirmed) {

      return;

    }


    this.classService

      .deleteGroup(
        group._id
      )

      .subscribe({

        next: (response) => {

          console.log(
            'Group deleted:',
            response
          );

          this.loadGroups();

        },

        error: (error) => {

          console.error(
            'Delete Group Error:',
            error
          );

          alert(

            error?.error?.message ||

            'Failed to delete group.'

          );

        }

      });

  }

}