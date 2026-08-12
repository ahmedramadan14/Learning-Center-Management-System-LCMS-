import { Component, OnInit } from '@angular/core';

interface Course {
  name: string;
  instructor: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  studentsCount: number;
  duration: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  // =========================================================
  // Courses Data
  // =========================================================

  courses: Course[] = [
    {
      name: 'Web Development',
      instructor: 'Ahmed Hassan',
      category: 'Programming',
      level: 'Beginner',
      studentsCount: 25,
      duration: '12 Weeks',
      status: 'Active',
      createdAt: new Date()
    },
    {
      name: 'Advanced JavaScript',
      instructor: 'Mohamed Omar',
      category: 'Programming',
      level: 'Advanced',
      studentsCount: 18,
      duration: '10 Weeks',
      status: 'Active',
      createdAt: new Date()
    },
    {
      name: 'English Language',
      instructor: 'Sara Ahmed',
      category: 'Languages',
      level: 'Intermediate',
      studentsCount: 32,
      duration: '16 Weeks',
      status: 'Inactive',
      createdAt: new Date()
    }
  ];


  // Courses displayed after filtering

  filteredCourses: Course[] = [];


  // Available categories

  categories: string[] = [
    'Programming',
    'Languages',
    'Mathematics',
    'Science',
    'Design'
  ];


  // =========================================================
  // Filters
  // =========================================================

  searchValue: string = '';

  selectedCategory: string = '';

  selectedStatus: string = '';


  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;

  isDetailsModalOpen: boolean = false;


  selectedCourse: Course | null = null;


  // =========================================================
  // New / Edited Course
  // =========================================================

  newCourse = {
    name: '',
    instructor: '',
    category: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    studentsCount: 0,
    duration: '',
    status: 'Active' as 'Active' | 'Inactive'
  };


  // Used to determine whether we are adding or editing

  isEditMode: boolean = false;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.filteredCourses = [...this.courses];
  }


  // =========================================================
  // Statistics
  // =========================================================

  get activeCoursesCount(): number {

    return this.courses.filter(
      course => course.status === 'Active'
    ).length;

  }


  get inactiveCoursesCount(): number {

    return this.courses.filter(
      course => course.status === 'Inactive'
    ).length;

  }


  get newCoursesCount(): number {

    const currentMonth = new Date().getMonth();

    const currentYear = new Date().getFullYear();

    return this.courses.filter(course => {

      const createdDate = new Date(course.createdAt);

      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );

    }).length;

  }


  // =========================================================
  // Get Course Initials
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


    this.filteredCourses = this.courses.filter(course => {

      const matchesSearch =
        !search ||
        course.name.toLowerCase().includes(search) ||
        course.instructor.toLowerCase().includes(search) ||
        course.category.toLowerCase().includes(search);


      const matchesCategory =
        !this.selectedCategory ||
        course.category === this.selectedCategory;


      const matchesStatus =
        !this.selectedStatus ||
        course.status === this.selectedStatus;


      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );

    });

  }


  // =========================================================
  // Add Course
  // =========================================================

  onAddCourseClick(): void {

    this.isEditMode = false;

    this.selectedCourse = null;


    this.newCourse = {
      name: '',
      instructor: '',
      category: '',
      level: 'Beginner',
      studentsCount: 0,
      duration: '',
      status: 'Active'
    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Close Add/Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedCourse = null;

    this.isEditMode = false;

  }


  // =========================================================
  // Save Course
  // =========================================================

  saveCourse(): void {

    // Basic validation

    if (
      !this.newCourse.name.trim() ||
      !this.newCourse.instructor.trim() ||
      !this.newCourse.category ||
      !this.newCourse.level
    ) {
      return;
    }


    // =======================================================
    // Edit Existing Course
    // =======================================================

    if (this.isEditMode && this.selectedCourse) {

      this.selectedCourse.name =
        this.newCourse.name.trim();

      this.selectedCourse.instructor =
        this.newCourse.instructor.trim();

      this.selectedCourse.category =
        this.newCourse.category;

      this.selectedCourse.level =
        this.newCourse.level;

      this.selectedCourse.studentsCount =
        this.newCourse.studentsCount;

      this.selectedCourse.duration =
        this.newCourse.duration.trim();

      this.selectedCourse.status =
        this.newCourse.status;

    }


    // =======================================================
    // Add New Course
    // =======================================================

    else {

      const course: Course = {

        name: this.newCourse.name.trim(),

        instructor: this.newCourse.instructor.trim(),

        category: this.newCourse.category,

        level: this.newCourse.level,

        studentsCount: this.newCourse.studentsCount,

        duration: this.newCourse.duration.trim(),

        status: this.newCourse.status,

        createdAt: new Date()

      };


      this.courses.push(course);

    }


    // Refresh table

    this.applyFilters();


    // Close modal

    this.closeModal();

  }


  // =========================================================
  // View Course
  // =========================================================

  viewCourse(course: Course): void {

    this.selectedCourse = course;

    this.isDetailsModalOpen = true;

  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedCourse = null;

  }


  // =========================================================
  // Edit Course
  // =========================================================

  editCourse(course: Course): void {

    this.selectedCourse = course;

    this.isEditMode = true;


    this.newCourse = {

      name: course.name,

      instructor: course.instructor,

      category: course.category,

      level: course.level,

      studentsCount: course.studentsCount,

      duration: course.duration,

      status: course.status

    };


    this.isModalOpen = true;

  }


  // =========================================================
  // Delete Course
  // =========================================================

  deleteCourse(course: Course): void {

    const index = this.courses.indexOf(course);


    if (index !== -1) {

      this.courses.splice(index, 1);

      this.applyFilters();

    }

  }

}
