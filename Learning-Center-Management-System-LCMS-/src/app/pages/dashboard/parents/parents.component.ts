import { Component, OnInit } from '@angular/core';
import { ParentService } from '../../../services/parents/parents.service';

interface ParentForm {
  name: string;
  email: string;
  phone: string;
  password?: string;
  gender: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-parents',
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css']
})
export class ParentsComponent implements OnInit {

  parents: any[] = [];

  searchText: string = '';
  selectedGender: string = 'All Gender';
  selectedStatus: string = 'All Status';

  loading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedParent: any | null = null;
  isEditMode: boolean = false;

  newParent: ParentForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: '',
    status: 'Active'
  };

  constructor(private parentService: ParentService) {}

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.parentService.getAllParents().subscribe({
      next: (response) => {
        this.parents = response?.data || response?.parents || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        this.errorMessage = error?.error?.message || 'Failed to load parents';
        this.loading = false;
      }
    });
  }

  get filteredParents(): any[] {
    const search = this.searchText.toLowerCase().trim();

    return this.parents.filter(parent => {
      const user = parent.user || parent.userId || {};

      const name = (user.name || parent.name || '').toLowerCase();
      const phone = (user.phone || parent.phone || '').toLowerCase();
      const email = (user.email || parent.email || '').toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search);

      const parentGender = (parent.gender || user.gender || '').toLowerCase();
      const matchesGender =
        this.selectedGender === 'All Gender' ||
        parentGender === this.selectedGender.toLowerCase();

      const isActive = user.isActive !== undefined ? user.isActive : parent.isActive;
      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        (this.selectedStatus === 'Active' ? isActive === true : isActive === false);

      return matchesSearch && matchesGender && matchesStatus;
    });
  }

  applyFilters(): void {}

  // --- Statistics ---
  get totalParents(): number {
    return this.parents.length;
  }

  get activeParents(): number {
    return this.parents.filter(parent => {
      const user = parent.user || parent.userId || {};
      return (user.isActive !== undefined ? user.isActive : parent.isActive) !== false;
    }).length;
  }

  get inactiveParents(): number {
    return this.parents.filter(parent => {
      const user = parent.user || parent.userId || {};
      return (user.isActive !== undefined ? user.isActive : parent.isActive) === false;
    }).length;
  }

  get maleParents(): number {
    return this.parents.filter(parent => (parent.gender || '').toLowerCase() === 'male').length;
  }

  // --- Helpers ---
  getParentInitials(name: string): string {
    if (!name || name === 'Unknown') return '?';
    return name
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getParentName(parent: any): string {
    return parent?.user?.name || parent?.userId?.name || parent?.name || 'Unknown';
  }

  getParentPhone(parent: any): string {
    return parent?.user?.phone || parent?.userId?.phone || parent?.phone || '-';
  }

  getParentEmail(parent: any): string {
    return parent?.user?.email || parent?.userId?.email || parent?.email || '-';
  }

  getParentStatus(parent: any): string {
    const isActive = parent?.user?.isActive ?? parent?.userId?.isActive ?? parent?.isActive;
    return isActive !== false ? 'Active' : 'Inactive';
  }

  // --- Actions ---
  onAddParentClick(): void {
    this.isEditMode = false;
    this.selectedParent = null;
    this.newParent = {
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: '',
      status: 'Active'
    };
    this.isModalOpen = true;
  }

  editParent(parent: any): void {
    this.selectedParent = parent;
    this.isEditMode = true;

    this.newParent = {
      name: this.getParentName(parent) === 'Unknown' ? '' : this.getParentName(parent),
      email: this.getParentEmail(parent) === '-' ? '' : this.getParentEmail(parent),
      phone: this.getParentPhone(parent) === '-' ? '' : this.getParentPhone(parent),
      password: '',
      gender: parent.gender || '',
      status: this.getParentStatus(parent) as 'Active' | 'Inactive'
    };

    this.isModalOpen = true;
  }

  saveParent(): void {
    if (!this.newParent.name.trim() || !this.newParent.phone.trim() || !this.newParent.gender) {
      alert('Please fill in required fields: Name, Phone, and Gender.');
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode && this.selectedParent) {
      const payload = {
        name: this.newParent.name.trim(),
        email: this.newParent.email.trim(),
        phone: this.newParent.phone.trim(),
        gender: this.newParent.gender,
        isActive: this.newParent.status === 'Active'
      };

      this.parentService.updateParent(this.selectedParent._id, payload).subscribe({
        next: () => {
          alert('Parent updated successfully!');
          this.isSubmitting = false;
          this.closeModal();
          this.loadParents();
        },
        error: (err) => {
          console.error('Error updating parent:', err);
          alert(err?.error?.message || 'Failed to update parent');
          this.isSubmitting = false;
        }
      });
    } else {
      if (!this.newParent.password) {
        alert('Password is required when creating a new parent.');
        this.isSubmitting = false;
        return;
      }

      const payload = {
        name: this.newParent.name.trim(),
        email: this.newParent.email.trim(),
        phone: this.newParent.phone.trim(),
        password: this.newParent.password,
        gender: this.newParent.gender
      };

      this.parentService.createParent(payload).subscribe({
        next: () => {
          alert('Parent created successfully!');
          this.isSubmitting = false;
          this.closeModal();
          this.loadParents();
        },
        error: (err) => {
          console.error('Error creating parent:', err);
          alert(err?.error?.message || 'Failed to create parent');
          this.isSubmitting = false;
        }
      });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.selectedParent = null;
  }

  viewParent(parent: any): void {
    this.selectedParent = parent;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedParent = null;
  }

  deleteParent(parent: any): void {
    const parentId = parent._id;
    if (!parentId) return;

    const parentName = this.getParentName(parent);
    if (!confirm(`Are you sure you want to delete ${parentName}?`)) return;

    this.parentService.deleteParent(parentId).subscribe({
      next: () => {
        alert('Parent deleted successfully!');
        this.loadParents();
      },
      error: (error) => {
        console.error('Error deleting parent:', error);
        alert(error?.error?.message || 'Failed to delete parent');
      }
    });
  }
}
