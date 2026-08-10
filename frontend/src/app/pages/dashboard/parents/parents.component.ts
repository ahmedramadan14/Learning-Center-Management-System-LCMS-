import { Component, OnInit } from '@angular/core';
import { ParentService } from '../../../services/parents/parents.service';
@Component({
  selector: 'app-parents',
  templateUrl: './parents.component.html',
  styleUrls: ['./parents.component.css']
})
export class ParentsComponent implements OnInit {

  parents: any[] = [];

  searchText = '';
  selectedGender = 'All Gender';
  selectedStatus = 'All Status';

  loading = false;
  errorMessage = '';

  constructor(
    private parentService: ParentService
  ) {}

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.parentService.getAllParents().subscribe({
      next: (response) => {

        this.parents = response.parents || [];

        this.loading = false;
      },

      error: (error) => {

        console.error('Error loading parents:', error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to load parents';

        this.loading = false;
      }
    });
  }

  get filteredParents(): any[] {

    const search = this.searchText
      .toLowerCase()
      .trim();

    return this.parents.filter(parent => {

      const user = parent.user || {};

      const name = (user.name || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      const email = (user.email || '').toLowerCase();

      const matchesSearch =
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search);

      const matchesGender =
        this.selectedGender === 'All Gender' ||
        parent.gender === this.selectedGender.toLowerCase();

      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        (this.selectedStatus === 'Active'
          ? user.isActive === true
          : user.isActive === false);

      return (
        matchesSearch &&
        matchesGender &&
        matchesStatus
      );
    });
  }

  get totalParents(): number {
    return this.parents.length;
  }

  get activeParents(): number {
    return this.parents.filter(
      parent => parent.user?.isActive === true
    ).length;
  }

  get inactiveParents(): number {
    return this.parents.filter(
      parent => parent.user?.isActive === false
    ).length;
  }

  get maleParents(): number {
    return this.parents.filter(
      parent => parent.gender === 'male'
    ).length;
  }

  deleteParent(parent: any): void {

    const parentId = parent._id;

    if (!parentId) {
      return;
    }

    const parentName =
      parent.user?.name || 'this parent';

    const confirmed = confirm(
      `Are you sure you want to delete ${parentName}?`
    );

    if (!confirmed) {
      return;
    }

    this.parentService
      .deleteParent(parentId)
      .subscribe({

        next: () => {

          this.parents = this.parents.filter(
            item => item._id !== parentId
          );

        },

        error: (error) => {

          console.error('Error deleting parent:', error);

          alert(
            error?.error?.message ||
            'Failed to delete parent'
          );

        }

      });
  }

  getParentName(parent: any): string {
    return parent.user?.name || 'Unknown';
  }

  getParentPhone(parent: any): string {
    return parent.user?.phone || '-';
  }

  getParentEmail(parent: any): string {
    return parent.user?.email || '-';
  }

  getParentStatus(parent: any): string {
    return parent.user?.isActive ? 'Active' : 'Inactive';
  }

}