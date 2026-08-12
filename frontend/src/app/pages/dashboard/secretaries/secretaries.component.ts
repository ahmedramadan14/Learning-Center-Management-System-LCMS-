import { Component, OnInit } from '@angular/core';

interface Secretary {
  userId: string;
  name: string;
  email: string;
  department: string;
  permission: string[];
  status: 'Active' | 'Inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-secretaries',
  templateUrl: './secretaries.component.html',
  styleUrls: ['./secretaries.component.css']
})
export class SecretariesComponent implements OnInit {

  // =========================================================
  // Secretaries Data
  // =========================================================

  secretaries: Secretary[] = [

    {
      userId: 'USR001',
      name: 'Sara Ahmed',
      email: 'sara@gmail.com',
      department: 'Administration',
      permission: [
        'Students',
        'Groups'
      ],
      status: 'Active',
      createdAt: new Date()
    },

    {
      userId: 'USR002',
      name: 'Mariam Hassan',
      email: 'mariam@gmail.com',
      department: 'Finance',
      permission: [
        'Payments',
        'Students'
      ],
      status: 'Active',
      createdAt: new Date()
    },

    {
      userId: 'USR003',
      name: 'Nour Mohamed',
      email: 'nour@gmail.com',
      department: 'Registration',
      permission: [
        'Students',
        'Groups',
        'Attendance'
      ],
      status: 'Inactive',
      createdAt: new Date()
    }

  ];


  // Secretaries displayed after filtering

  filteredSecretaries: Secretary[] = [];


  // =========================================================
  // Departments
  // =========================================================

  departments: string[] = [
    'Administration',
    'Finance',
    'Registration',
    'Student Affairs',
    'Academic Affairs'
  ];


  // =========================================================
  // Available Permissions
  // =========================================================

  availablePermissions: string[] = [
    'Students',
    'Groups',
    'Teachers',
    'Attendance',
    'Payments',
    'Reports'
  ];


  // =========================================================
  // Filters
  // =========================================================

  searchValue: string = '';

  selectedDepartment: string = '';

  selectedStatus: string = '';


  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;

  isDetailsModalOpen: boolean = false;


  selectedSecretary: Secretary | null = null;


  // =========================================================
  // New / Edited Secretary
  // =========================================================

  newSecretary = {

    userId: '',

    name: '',

    email: '',

    department: '',

    permission: [] as string[],

    status: 'Active' as 'Active' | 'Inactive'

  };


  // Used to determine whether we are adding or editing

  isEditMode: boolean = false;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {

    this.filteredSecretaries = [
      ...this.secretaries
    ];

  }


  // =========================================================
  // Statistics
  // =========================================================

  get activeSecretariesCount(): number {

    return this.secretaries.filter(
      secretary => secretary.status === 'Active'
    ).length;

  }


  get inactiveSecretariesCount(): number {

    return this.secretaries.filter(
      secretary => secretary.status === 'Inactive'
    ).length;

  }


  // =========================================================
  // Get Secretary Initials
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
  // Filters
  // =========================================================

  applyFilters(): void {

    const search = this.searchValue
      .toLowerCase()
      .trim();


    this.filteredSecretaries =
      this.secretaries.filter(secretary => {

        const matchesSearch =
          !search ||
          secretary.name
            .toLowerCase()
            .includes(search) ||

          secretary.email
            .toLowerCase()
            .includes(search) ||

          secretary.department
            .toLowerCase()
            .includes(search);


        const matchesDepartment =
          !this.selectedDepartment ||
          secretary.department === this.selectedDepartment;


        const matchesStatus =
          !this.selectedStatus ||
          secretary.status === this.selectedStatus;


        return (
          matchesSearch &&
          matchesDepartment &&
          matchesStatus
        );

      });

  }


  // =========================================================
  // Add Secretary
  // =========================================================

  onAddSecretaryClick(): void {

    this.isEditMode = false;

    this.selectedSecretary = null;


    this.newSecretary = {

      userId: '',

      name: '',

      email: '',

      department: '',

      permission: [],

      status: 'Active'

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Close Add / Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedSecretary = null;

    this.isEditMode = false;

  }


  // =========================================================
  // Toggle Permission
  // =========================================================

  togglePermission(permission: string): void {

    const index =
      this.newSecretary.permission.indexOf(permission);


    if (index === -1) {

      this.newSecretary.permission.push(permission);

    } else {

      this.newSecretary.permission.splice(index, 1);

    }

  }


  // =========================================================
  // Save Secretary
  // =========================================================

  saveSecretary(): void {

    // Basic validation

    if (
      !this.newSecretary.name.trim() ||
      !this.newSecretary.email.trim() ||
      !this.newSecretary.department
    ) {

      return;

    }


    // =======================================================
    // Edit Existing Secretary
    // =======================================================

    if (
      this.isEditMode &&
      this.selectedSecretary
    ) {

      this.selectedSecretary.name =
        this.newSecretary.name.trim();


      this.selectedSecretary.email =
        this.newSecretary.email.trim();


      this.selectedSecretary.department =
        this.newSecretary.department;


      this.selectedSecretary.permission =
        [...this.newSecretary.permission];


      this.selectedSecretary.status =
        this.newSecretary.status;

    }


    // =======================================================
    // Add New Secretary
    // =======================================================

    else {

      const secretary: Secretary = {

        userId:
          'USR' +
          String(this.secretaries.length + 1)
            .padStart(3, '0'),

        name:
          this.newSecretary.name.trim(),

        email:
          this.newSecretary.email.trim(),

        department:
          this.newSecretary.department,

        permission:
          [...this.newSecretary.permission],

        status:
          this.newSecretary.status,

        createdAt:
          new Date()

      };


      this.secretaries.push(secretary);

    }


    // Refresh table

    this.applyFilters();


    // Close modal

    this.closeModal();

  }


  // =========================================================
  // View Secretary
  // =========================================================

  viewSecretary(secretary: Secretary): void {

    this.selectedSecretary = secretary;

    this.isDetailsModalOpen = true;

  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedSecretary = null;

  }


  // =========================================================
  // Edit Secretary
  // =========================================================

  editSecretary(secretary: Secretary): void {

    this.selectedSecretary = secretary;

    this.isEditMode = true;


    this.newSecretary = {

      userId:
        secretary.userId,

      name:
        secretary.name,

      email:
        secretary.email,

      department:
        secretary.department,

      permission:
        [...secretary.permission],

      status:
        secretary.status

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Delete Secretary
  // =========================================================

  deleteSecretary(secretary: Secretary): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete ${secretary.name}?`
      );


    if (!confirmed) {
      return;
    }


    const index =
      this.secretaries.indexOf(secretary);


    if (index !== -1) {

      this.secretaries.splice(index, 1);

      this.applyFilters();

    }

  }

}
