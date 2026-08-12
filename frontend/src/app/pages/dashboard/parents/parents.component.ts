import { Component, OnInit } from '@angular/core';
import { ParentService } from '../../../services/parents/parents.service';

interface ParentForm {
  name: string;
  email: string;
  phone: string;
  gender: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-parents',
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css']
})
export class ParentsComponent implements OnInit {

  // =========================================================
  // Parents Data
  // =========================================================

  parents: any[] = [];


  // =========================================================
  // Filters
  // =========================================================

  searchText: string = '';

  selectedGender: string = 'All Gender';

  selectedStatus: string = 'All Status';


  // =========================================================
  // State
  // =========================================================

  loading: boolean = false;

  errorMessage: string = '';


  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;

  isDetailsModalOpen: boolean = false;


  // =========================================================
  // Selected Parent
  // =========================================================

  selectedParent: any | null = null;


  // =========================================================
  // Add / Edit
  // =========================================================

  isEditMode: boolean = false;


  newParent: ParentForm = {
    name: '',
    email: '',
    phone: '',
    gender: '',
    status: 'Active'
  };


  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private parentService: ParentService
  ) {}


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.loadParents();
  }


  // =========================================================
  // Load Parents
  // =========================================================

  loadParents(): void {

    this.loading = true;

    this.errorMessage = '';

    this.parentService
      .getAllParents()
      .subscribe({

        next: (response) => {

          this.parents =
            response?.parents || [];

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Error loading parents:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load parents';

          this.loading = false;

        }

      });

  }


  // =========================================================
  // Filtered Parents
  // =========================================================

  get filteredParents(): any[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    return this.parents.filter(parent => {

      const user =
        parent.user || {};


      const name =
        (user.name || '')
          .toLowerCase();


      const phone =
        (user.phone || '')
          .toLowerCase();


      const email =
        (user.email || '')
          .toLowerCase();


      // Search

      const matchesSearch =
        !search ||
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search);


      // Gender

      const matchesGender =
        this.selectedGender === 'All Gender' ||
        parent.gender ===
          this.selectedGender.toLowerCase();


      // Status

      const matchesStatus =
        this.selectedStatus === 'All Status' ||

        (
          this.selectedStatus === 'Active'
            ? user.isActive === true
            : user.isActive === false
        );


      return (
        matchesSearch &&
        matchesGender &&
        matchesStatus
      );

    });

  }


  // =========================================================
  // Apply Filters
  // =========================================================

  applyFilters(): void {

    /*
     * Filtering is handled by
     * the filteredParents getter.
     *
     * This method is called from
     * the HTML when search/filter
     * values change.
     */

  }


  // =========================================================
  // Statistics
  // =========================================================

  get totalParents(): number {

    return this.parents.length;

  }


  get activeParents(): number {

    return this.parents.filter(
      parent =>
        parent.user?.isActive === true
    ).length;

  }


  get inactiveParents(): number {

    return this.parents.filter(
      parent =>
        parent.user?.isActive === false
    ).length;

  }


  get maleParents(): number {

    return this.parents.filter(
      parent =>
        parent.gender === 'male'
    ).length;

  }


  // =========================================================
  // Parent Initials
  // =========================================================

  getParentInitials(
    name: string
  ): string {

    if (!name) {
      return '?';
    }


    return name
      .split(' ')
      .filter(
        word => word.length > 0
      )
      .map(
        word => word.charAt(0)
      )
      .join('')
      .substring(0, 2)
      .toUpperCase();

  }


  // =========================================================
  // Add Parent
  // =========================================================

  onAddParentClick(): void {

    this.isEditMode = false;

    this.selectedParent = null;


    this.newParent = {

      name: '',

      email: '',

      phone: '',

      gender: '',

      status: 'Active'

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Edit Parent
  // =========================================================

  editParent(parent: any): void {

    this.selectedParent = parent;

    this.isEditMode = true;


    this.newParent = {

      name:
        this.getParentName(parent) === 'Unknown'
          ? ''
          : this.getParentName(parent),

      email:
        this.getParentEmail(parent) === '-'
          ? ''
          : this.getParentEmail(parent),

      phone:
        this.getParentPhone(parent) === '-'
          ? ''
          : this.getParentPhone(parent),

      gender:
        parent.gender || '',

      status:
        parent.user?.isActive === true
          ? 'Active'
          : 'Inactive'

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Save Parent
  // =========================================================

  saveParent(): void {

    // Validation

    if (
      !this.newParent.name.trim() ||
      !this.newParent.email.trim() ||
      !this.newParent.gender
    ) {

      alert(
        'Please fill in the required fields.'
      );

      return;

    }


    // =======================================================
    // Edit Existing Parent
    // =======================================================

    if (
      this.isEditMode &&
      this.selectedParent
    ) {

      const parent =
        this.selectedParent;


      // Update frontend data

      if (!parent.user) {

        parent.user = {};

      }


      parent.user.name =
        this.newParent.name.trim();


      parent.user.email =
        this.newParent.email.trim();


      parent.user.phone =
        this.newParent.phone.trim();


      parent.user.isActive =
        this.newParent.status === 'Active';


      parent.gender =
        this.newParent.gender;


    }


    // =======================================================
    // Add New Parent
    // =======================================================

    else {

      const newParent = {

        _id:
          'local-' +
          Date.now(),

        user: {

          name:
            this.newParent.name.trim(),

          email:
            this.newParent.email.trim(),

          phone:
            this.newParent.phone.trim(),

          isActive:
            this.newParent.status === 'Active'

        },

        gender:
          this.newParent.gender

      };


      this.parents.push(
        newParent
      );

    }


    // Refresh filters

    this.applyFilters();


    // Close modal

    this.closeModal();

  }


  // =========================================================
  // Close Add/Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.isEditMode = false;

    this.selectedParent = null;

  }


  // =========================================================
  // View Parent
  // =========================================================

  viewParent(parent: any): void {

    this.selectedParent =
      parent;

    this.isDetailsModalOpen =
      true;

  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen =
      false;

    this.selectedParent =
      null;

  }


  // =========================================================
  // Delete Parent
  // =========================================================

  deleteParent(parent: any): void {

    const parentId =
      parent._id;


    // Local parent

    if (
      typeof parentId === 'string' &&
      parentId.startsWith('local-')
    ) {

      this.parents =
        this.parents.filter(
          item =>
            item !== parent
        );

      return;

    }


    if (!parentId) {

      return;

    }


    const parentName =
      this.getParentName(parent);


    const confirmed =
      confirm(
        `Are you sure you want to delete ${parentName}?`
      );


    if (!confirmed) {

      return;

    }


    this.parentService
      .deleteParent(parentId)
      .subscribe({

        next: () => {

          this.parents =
            this.parents.filter(
              item =>
                item._id !== parentId
            );

        },

        error: (error) => {

          console.error(
            'Error deleting parent:',
            error
          );


          alert(
            error?.error?.message ||
            'Failed to delete parent'
          );

        }

      });

  }


  // =========================================================
  // Parent Information
  // =========================================================

  getParentName(
    parent: any
  ): string {

    return (
      parent?.user?.name ||
      'Unknown'
    );

  }


  getParentPhone(
    parent: any
  ): string {

    return (
      parent?.user?.phone ||
      '-'
    );

  }


  getParentEmail(
    parent: any
  ): string {

    return (
      parent?.user?.email ||
      '-'
    );

  }


  getParentStatus(
    parent: any
  ): string {

    return parent?.user?.isActive
      ? 'Active'
      : 'Inactive';

  }

}
