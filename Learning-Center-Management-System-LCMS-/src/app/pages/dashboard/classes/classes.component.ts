import { Component, OnInit } from '@angular/core';
import { ClassService, GroupBackend } from '../../../services/classes/class.service';

export interface GroupUI {
  id?: string;
  name: string;
  gradelevel: string;
  gradeLevelId?: string;
  studentsCount: number;
  schedule: string;
  teacher: string;
  teacherId?: string;
  sessionPrice?: number;
}

export interface OptionItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css']
})
export class ClassesComponent implements OnInit {
  groups: GroupUI[] = [];
  filteredGroups: GroupUI[] = [];

  gradeLevels: string[] = [];
  teachers: string[] = [];

  // Static grade levels so grade selection always works
  gradeLevelOptions: OptionItem[] = [
    { id: '650000000000000000000001', name: 'Grade 1' },
    { id: '650000000000000000000002', name: 'Grade 2' },
    { id: '650000000000000000000003', name: 'Grade 3' },
    { id: '650000000000000000000004', name: 'Grade 4' },
    { id: '650000000000000000000005', name: 'Grade 5' },
    { id: '650000000000000000000006', name: 'Grade 6' }
  ];

  teacherOptions: OptionItem[] = [];

  searchValue: string = '';
  selectedGradeLevel: string = '';
  selectedTeacher: string = '';

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;
  isEditMode: boolean = false;
  isSaving: boolean = false;

  selectedGroup: GroupUI | null = null;

  newGroup = {
    id: '',
    name: '',
    gradelevel: '',
    gradeLevelId: '',
    teacherId: '',
    studentsCount: 0,
    schedule: '',
    teacher: '',
    sessionPrice: 0
  };

  constructor(private classService: ClassService) {}

  ngOnInit(): void {
    this.fetchGroups();
    this.fetchTeachers();
  }

  fetchGroups(): void {
    this.classService.getAllGroups().subscribe({
      next: (res) => {
        const rawList = res?.data || res?.groups || res || [];
        const groupsArray = Array.isArray(rawList) ? rawList : [];
        this.groups = groupsArray.map((g: GroupBackend) => this.mapToUI(g));
        this.updateFilterLists();
        this.applyFilters();
      },
      error: (err) => console.error('Failed to fetch groups:', err)
    });
  }

  fetchTeachers(): void {
    this.classService.getTeachers().subscribe({
      next: (res) => {
        // Logging response to inspect backend structure in F12 Console
        console.log('Teacher API Raw Response:', res);

        const rawData =
          res?.data?.teachers ||
          res?.teachers ||
          res?.data?.data ||
          res?.data ||
          res?.users ||
          res ||
          [];

        const teachersData = Array.isArray(rawData) ? rawData : [];

        this.teacherOptions = teachersData.map((t: any) => ({
          id: t._id || t.id || t.userId?._id,
          name:
            t.fullName ||
            t.name ||
            t.userName ||
            t.userId?.fullName ||
            t.userId?.name ||
            'Teacher'
        }));
      },
      error: (err) => console.error('Failed to load teachers from DB:', err)
    });
  }

  private mapToUI(g: GroupBackend): GroupUI {
    const gradeObj = typeof g.gradeLevelId === 'object' ? g.gradeLevelId : null;
    const gradeName = gradeObj?.name || 'N/A';
    const gradeId = gradeObj?._id || (typeof g.gradeLevelId === 'string' ? g.gradeLevelId : '');

    const teacherObj = typeof g.teacherId === 'object' ? g.teacherId : null;
    const teacherName = teacherObj?.fullName || teacherObj?.name || 'N/A';
    const teacherId = teacherObj?._id || (typeof g.teacherId === 'string' ? g.teacherId : '');

    return {
      id: g._id,
      name: g.groupName || 'Unnamed Group',
      gradelevel: gradeName,
      gradeLevelId: gradeId,
      studentsCount: g.studentsCount || 0,
      schedule: g.schedule || 'N/A',
      teacher: teacherName,
      teacherId: teacherId,
      sessionPrice: g.sessionPrice || 0
    };
  }

  get totalStudentsCount(): number {
    return this.groups.reduce((total, group) => total + Number(group.studentsCount || 0), 0);
  }

  get gradeLevelsCount(): number {
    return new Set(this.groups.map(g => g.gradelevel).filter(l => l && l !== 'N/A')).size;
  }

  get teachersCount(): number {
    return new Set(this.groups.map(g => g.teacher).filter(t => t && t !== 'N/A')).size;
  }

  getInitial(name: string): string {
    return name ? name.trim().charAt(0).toUpperCase() : 'G';
  }

  getInitials(name: string): string {
    if (!name || name === 'N/A') return 'NA';
    return name
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  updateFilterLists(): void {
    this.gradeLevels = [...new Set(this.groups.map(g => g.gradelevel).filter(l => l && l !== 'N/A'))];
    this.teachers = [...new Set(this.groups.map(g => g.teacher).filter(t => t && t !== 'N/A'))];
  }

  applyFilters(): void {
    const search = this.searchValue.toLowerCase().trim();

    this.filteredGroups = this.groups.filter(group => {
      const matchesSearch =
        !search ||
        group.name.toLowerCase().includes(search) ||
        group.gradelevel.toLowerCase().includes(search) ||
        group.teacher.toLowerCase().includes(search) ||
        group.schedule.toLowerCase().includes(search);

      const matchesGrade = !this.selectedGradeLevel || group.gradelevel === this.selectedGradeLevel;
      const matchesTeacher = !this.selectedTeacher || group.teacher === this.selectedTeacher;

      return matchesSearch && matchesGrade && matchesTeacher;
    });
  }

  onAddGroupClick(): void {
    this.isEditMode = false;
    this.selectedGroup = null;

    this.newGroup = {
      id: '',
      name: '',
      gradelevel: '',
      gradeLevelId: this.gradeLevelOptions[0]?.id || '',
      teacherId: this.teacherOptions[0]?.id || '',
      studentsCount: 0,
      schedule: '',
      teacher: '',
      sessionPrice: 0
    };

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedGroup = null;
    this.isEditMode = false;
    this.isSaving = false;
  }

  saveGroup(): void {
    if (!this.newGroup.name.trim()) {
      alert('Group Name is required.');
      return;
    }

    this.isSaving = true;

    const payload: Partial<GroupBackend> = {
      groupName: this.newGroup.name.trim(),
      sessionPrice: Number(this.newGroup.sessionPrice) || 0,
      gradeLevelId: this.newGroup.gradeLevelId
    };

    if (this.newGroup.teacherId) {
      payload.teacherId = this.newGroup.teacherId;
    }

    if (this.isEditMode && this.selectedGroup?.id) {
      this.classService.updateGroup(this.selectedGroup.id, payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.fetchGroups();
          this.closeModal();
        },
        error: (err) => {
          this.isSaving = false;
          alert(`Update failed: ${err?.error?.message || err?.message || 'Server error'}`);
        }
      });
    } else {
      this.classService.createGroup(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.fetchGroups();
          this.closeModal();
        },
        error: (err) => {
          this.isSaving = false;
          alert(`Save failed: ${err?.error?.message || err?.message || 'Server error'}`);
        }
      });
    }
  }

  viewGroup(group: GroupUI): void {
    this.selectedGroup = group;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedGroup = null;
  }

  editGroup(group: GroupUI): void {
    this.selectedGroup = group;
    this.isEditMode = true;

    this.newGroup = {
      id: group.id || '',
      name: group.name,
      gradelevel: group.gradelevel,
      gradeLevelId: group.gradeLevelId || '',
      teacherId: group.teacherId || '',
      studentsCount: group.studentsCount,
      schedule: group.schedule === 'N/A' ? '' : group.schedule,
      teacher: group.teacher,
      sessionPrice: group.sessionPrice || 0
    };

    this.isModalOpen = true;
  }

  deleteGroup(group: GroupUI): void {
    if (!group.id) return;

    if (confirm(`Are you sure you want to delete ${group.name}?`)) {
      this.classService.deleteGroup(group.id).subscribe({
        next: () => this.fetchGroups(),
        error: (err) => alert(`Delete failed: ${err?.error?.message || err?.message}`)
      });
    }
  }
}
