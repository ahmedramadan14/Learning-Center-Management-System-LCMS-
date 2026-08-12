
import { Component, OnInit } from '@angular/core';

interface Exam {
  name: string;
  subject: string;
  group: string;
  date: string;
  duration: number;
  status: 'Upcoming' | 'Completed';
}

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent implements OnInit {

  // =========================================================
  // Exams Data
  // =========================================================

  exams: Exam[] = [
    {
      name: 'Mathematics Midterm',
      subject: 'Mathematics',
      group: 'Group A',
      date: '2026-06-25',
      duration: 90,
      status: 'Upcoming'
    },
    {
      name: 'English Final Exam',
      subject: 'English',
      group: 'Group B',
      date: '2026-06-28',
      duration: 120,
      status: 'Upcoming'
    },
    {
      name: 'Physics Quiz',
      subject: 'Physics',
      group: 'Group A',
      date: '2026-06-15',
      duration: 60,
      status: 'Completed'
    },
    {
      name: 'Chemistry Exam',
      subject: 'Chemistry',
      group: 'Group C',
      date: '2026-06-18',
      duration: 90,
      status: 'Completed'
    },
    {
      name: 'Arabic Assessment',
      subject: 'Arabic',
      group: 'Group B',
      date: '2026-06-30',
      duration: 60,
      status: 'Upcoming'
    },
    {
      name: 'Biology Final',
      subject: 'Biology',
      group: 'Group C',
      date: '2026-06-20',
      duration: 120,
      status: 'Completed'
    }
  ];


  // =========================================================
  // Filtered Exams
  // =========================================================

  filteredExams: Exam[] = [];


  // =========================================================
  // Available Subjects / Groups
  // =========================================================

  subjects: string[] = [
    'Mathematics',
    'English',
    'Physics',
    'Chemistry',
    'Arabic',
    'Biology'
  ];

  groups: string[] = [
    'Group A',
    'Group B',
    'Group C'
  ];


  // =========================================================
  // Filters
  // =========================================================

  searchValue: string = '';
  selectedSubject: string = '';
  selectedGroup: string = '';
  selectedStatus: string = '';


  // =========================================================
  // Modals
  // =========================================================

  isModalOpen: boolean = false;
  isDetailsModalOpen: boolean = false;

  selectedExam: Exam | null = null;


  // =========================================================
  // New / Edited Exam
  // =========================================================

  newExam = {
    name: '',
    subject: '',
    group: '',
    date: '',
    duration: 60,
    status: 'Upcoming' as 'Upcoming' | 'Completed'
  };


  // Used to determine add/edit mode

  isEditMode: boolean = false;


  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.filteredExams = [...this.exams];
  }


  // =========================================================
  // Statistics
  // =========================================================

  get totalExams(): number {
    return this.exams.length;
  }


  get upcomingExams(): number {
    return this.exams.filter(
      exam => exam.status === 'Upcoming'
    ).length;
  }


  get completedExams(): number {
    return this.exams.filter(
      exam => exam.status === 'Completed'
    ).length;
  }


  // =========================================================
  // Filters
  // =========================================================

  applyFilters(): void {

    const search = this.searchValue
      .toLowerCase()
      .trim();

    this.filteredExams = this.exams.filter(exam => {

      const matchesSearch =
        !search ||
        exam.name.toLowerCase().includes(search) ||
        exam.subject.toLowerCase().includes(search) ||
        exam.group.toLowerCase().includes(search);

      const matchesSubject =
        !this.selectedSubject ||
        exam.subject === this.selectedSubject;

      const matchesGroup =
        !this.selectedGroup ||
        exam.group === this.selectedGroup;

      const matchesStatus =
        !this.selectedStatus ||
        exam.status === this.selectedStatus;

      return (
        matchesSearch &&
        matchesSubject &&
        matchesGroup &&
        matchesStatus
      );

    });

  }


  // =========================================================
  // Add Exam
  // =========================================================

  onAddExamClick(): void {

    this.isEditMode = false;

    this.selectedExam = null;

    this.newExam = {
      name: '',
      subject: '',
      group: '',
      date: '',
      duration: 60,
      status: 'Upcoming'
    };

    this.isModalOpen = true;
  }


  // =========================================================
  // Close Add/Edit Modal
  // =========================================================

  closeModal(): void {

    this.isModalOpen = false;

    this.selectedExam = null;

    this.isEditMode = false;
  }


  // =========================================================
  // Save Exam
  // =========================================================

  saveExam(): void {

    // Basic validation

    if (
      !this.newExam.name.trim() ||
      !this.newExam.subject ||
      !this.newExam.group ||
      !this.newExam.date ||
      !this.newExam.duration
    ) {
      return;
    }


    // =======================================================
    // Edit Existing Exam
    // =======================================================

    if (this.isEditMode && this.selectedExam) {

      this.selectedExam.name =
        this.newExam.name.trim();

      this.selectedExam.subject =
        this.newExam.subject;

      this.selectedExam.group =
        this.newExam.group;

      this.selectedExam.date =
        this.newExam.date;

      this.selectedExam.duration =
        Number(this.newExam.duration);

      this.selectedExam.status =
        this.newExam.status;

    }


    // =======================================================
    // Add New Exam
    // =======================================================

    else {

      const exam: Exam = {

        name: this.newExam.name.trim(),

        subject: this.newExam.subject,

        group: this.newExam.group,

        date: this.newExam.date,

        duration: Number(this.newExam.duration),

        status: this.newExam.status

      };

      this.exams.push(exam);
    }


    // Refresh table

    this.applyFilters();


    // Close modal

    this.closeModal();
  }


  // =========================================================
  // View Exam
  // =========================================================

  viewExam(exam: Exam): void {

    this.selectedExam = exam;

    this.isDetailsModalOpen = true;
  }


  // =========================================================
  // Close Details Modal
  // =========================================================

  closeDetailsModal(): void {

    this.isDetailsModalOpen = false;

    this.selectedExam = null;
  }


  // =========================================================
  // Edit Exam
  // =========================================================

  editExam(exam: Exam): void {

    this.selectedExam = exam;

    this.isEditMode = true;

    this.newExam = {

      name: exam.name,

      subject: exam.subject,

      group: exam.group,

      date: exam.date,

      duration: exam.duration,

      status: exam.status

    };

    this.isModalOpen = true;
  }


  // =========================================================
  // Delete Exam
  // =========================================================

  deleteExam(exam: Exam): void {

    const index = this.exams.indexOf(exam);

    if (index !== -1) {

      this.exams.splice(index, 1);

      this.applyFilters();
    }
  }

}

