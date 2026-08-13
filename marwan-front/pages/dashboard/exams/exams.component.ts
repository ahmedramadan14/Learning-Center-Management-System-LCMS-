import { Component, OnInit } from '@angular/core';
import { ExamService, Exam } from 'src/app/services/exams/exam.service';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent implements OnInit {

  // =========================================================
  // Exams Data
  // =========================================================

  exams: Exam[] = [];
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

  groups: string[] = [];

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

  newExam: any = {
    name: '',
    subject: '',
    group: '',
    date: '',
    duration: 60,
    status: 'Upcoming',
    totalMarks: 100,
    passingMarks: 50
  };

  isEditMode: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  // =========================================================
  // Constructor
  // =========================================================

  constructor(private examService: ExamService) {}

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.loadExams();
  }

  // =========================================================
  // Load Exams from API
  // =========================================================

  loadExams(): void {
    this.loading = true;
    this.errorMessage = '';

    this.examService.getAllExams().subscribe({
      next: (response: any) => {
        this.exams = response?.data || [];
        this.extractGroups();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading exams:', error);
        this.errorMessage = error?.error?.message || 'Failed to load exams';
        this.loading = false;
      }
    });
  }

  // =========================================================
  // Extract unique groups from exams
  // =========================================================

  extractGroups(): void {
    const groupSet = new Set<string>();
    this.exams.forEach(exam => {
      if (exam.group) {
        groupSet.add(exam.group);
      }
    });
    this.groups = Array.from(groupSet);
  }

  // =========================================================
  // Statistics
  // =========================================================

  get totalExams(): number {
    return this.exams.length;
  }

  get upcomingExams(): number {
    return this.exams.filter(exam => exam.status === 'Upcoming').length;
  }

  get completedExams(): number {
    return this.exams.filter(exam => exam.status === 'Completed').length;
  }

  // =========================================================
  // Filters
  // =========================================================

  applyFilters(): void {
    const search = this.searchValue.toLowerCase().trim();

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

      return matchesSearch && matchesSubject && matchesGroup && matchesStatus;
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
      status: 'Upcoming',
      totalMarks: 100,
      passingMarks: 50
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
  // Save Exam (Create or Update)
  // =========================================================

  saveExam(): void {
    if (
      !this.newExam.name.trim() ||
      !this.newExam.subject ||
      !this.newExam.group ||
      !this.newExam.date ||
      !this.newExam.duration
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    this.loading = true;

    const examData = {
      name: this.newExam.name.trim(),
      subject: this.newExam.subject,
      group: this.newExam.group,
      examDate: this.newExam.date,
      duration: Number(this.newExam.duration),
      totalMarks: Number(this.newExam.totalMarks || 100),
      passingMarks: Number(this.newExam.passingMarks || 50),
      status: this.newExam.status
    };

    if (this.isEditMode && this.selectedExam?._id) {
      // Update existing exam
      this.examService.updateExam(this.selectedExam._id, examData).subscribe({
        next: (response: any) => {
          const updatedExam = response.data;
          const index = this.exams.findIndex(e => e._id === updatedExam._id);
          if (index !== -1) {
            this.exams[index] = updatedExam;
          }
          this.applyFilters();
          this.closeModal();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error updating exam:', error);
          alert(error?.error?.message || 'Failed to update exam');
          this.loading = false;
        }
      });
    } else {
      // Create new exam
      this.examService.createExam(examData).subscribe({
        next: (response: any) => {
          this.exams.push(response.data);
          this.extractGroups();
          this.applyFilters();
          this.closeModal();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error creating exam:', error);
          alert(error?.error?.message || 'Failed to create exam');
          this.loading = false;
        }
      });
    }
  }

  // =========================================================
  // View Exam Details
  // =========================================================

  viewExam(exam: Exam): void {
    // Fetch fresh data from API
    if (exam._id) {
      this.examService.getExamById(exam._id).subscribe({
        next: (response: any) => {
          this.selectedExam = response.data;
          this.isDetailsModalOpen = true;
        },
        error: (error: any) => {
          console.error('Error fetching exam details:', error);
          // Fallback to local data
          this.selectedExam = exam;
          this.isDetailsModalOpen = true;
        }
      });
    } else {
      this.selectedExam = exam;
      this.isDetailsModalOpen = true;
    }
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
      status: exam.status,
      totalMarks: (exam as any).totalMarks || 100,
      passingMarks: (exam as any).passingMarks || 50
    };
    this.isModalOpen = true;
  }

  // =========================================================
  // Delete Exam
  // =========================================================

  deleteExam(exam: Exam): void {
    if (!exam._id) {
      // Fallback for local data
      const index = this.exams.indexOf(exam);
      if (index !== -1) {
        this.exams.splice(index, 1);
        this.applyFilters();
      }
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete the exam "${exam.name}"?`);
    if (!confirmed) return;

    this.loading = true;
    this.examService.deleteExam(exam._id).subscribe({
      next: () => {
        this.exams = this.exams.filter(e => e._id !== exam._id);
        this.extractGroups();
        this.applyFilters();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error deleting exam:', error);
        alert(error?.error?.message || 'Failed to delete exam');
        this.loading = false;
      }
    });
  }

  // =========================================================
  // Publish Exam
  // =========================================================

  publishExam(exam: Exam): void {
    if (!exam._id) return;

    this.loading = true;
    this.examService.publishExam(exam._id).subscribe({
      next: (response: any) => {
        const updatedExam = response.data;
        const index = this.exams.findIndex(e => e._id === updatedExam._id);
        if (index !== -1) {
          this.exams[index] = updatedExam;
        }
        this.applyFilters();
        this.loading = false;
        alert('Exam published successfully!');
      },
      error: (error: any) => {
        console.error('Error publishing exam:', error);
        alert(error?.error?.message || 'Failed to publish exam');
        this.loading = false;
      }
    });
  }
}