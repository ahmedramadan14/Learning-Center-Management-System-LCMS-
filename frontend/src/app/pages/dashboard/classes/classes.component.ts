import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {

  groups: any[] = [];

  filteredGroups: any[] = [];
  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;
  selectedGroup: any = null;

  newGroup = {
    name: '',
    gradelevel: '',
    studentsCount: 0,
    schedule: '',
    teacher: ''
  };

  constructor() { }

  ngOnInit(): void {
    this.filteredGroups = [...this.groups];
  }

  onSearch(item: any) {
    const value = item.target.value.toLowerCase();
    this.filteredGroups = this.groups.filter(g =>
      g.name.toLowerCase().includes(value) ||
      g.teacher.toLowerCase().includes(value)
    );
  }

  onAddGroupClick() {
    this.newGroup = { name: '', gradelevel: '', studentsCount: 0, schedule: '', teacher: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveGroup() {
    if (!this.newGroup.name) {
      return;
    }

    this.groups.push({
      name: this.newGroup.name,
      gradelevel: this.newGroup.gradelevel,
      studentsCount: Number(this.newGroup.studentsCount),
      schedule: this.newGroup.schedule,
      teacher: this.newGroup.teacher
    });

    this.filteredGroups = [...this.groups];
    this.isModalOpen = false;
  }

  openGroupDetails(group: any) {
    this.selectedGroup = group;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedGroup = null;
  }
}