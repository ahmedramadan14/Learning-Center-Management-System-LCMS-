import { Component, OnInit } from '@angular/core';
import { ResultService } from 'src/app/services/results/result.service';
import { ExamService } from 'src/app/services/exams/exam.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  // =========================================================
  // Results Data
  // =========================================================

  results: any[] = [];
  exams: any[] = [];
  students: any[] = [];

  // =========================================================
  // Filters
  // =========================================================

  searchText: string = '';
  selectedStatus: string = 'All Status';
  selectedExam: string = '';

  // =========================================================
  // Loading / Error
  // =========================================================

  loading: boolean = false;
  errorMessage: string = '';

  // =========================================================
  // Modals
  // =========================================================

  showAddModal: boolean = false;
  showViewModal: boolean = false;
  showEditModal: boolean = false;

  // =========================================================
  // Selected Result
  // =========================================================

  selectedResult: any = null;

  // =========================================================
  // New Result
  // =========================================================

  newResult = {
    exam: '',
    studentCode: '',
    marks: 0
  };

  // =========================================================
  // Edit Result
  // =========================================================

  editMarks: number = 0;

  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private resultService: ResultService,
    private examService: ExamService
  ) {}

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.loadResults();
    this.loadExams();
  }

  // =========================================================
  // Load Exams for dropdown
  // =========================================================

  loadExams(): void {
    this.examService.getAllExams().subscribe({
      next: (response: any) => {
        this.exams = response?.data || [];
      },
      error: (error: any) => {
        console.error('Error loading exams:', error);
      }
    });
  }

  // =========================================================
  // Load Results
  // =========================================================

  loadResults(): void {
    this.loading = true;
    this.errorMessage = '';

    this.resultService.getAllResults().subscribe({
      next: (response: any) => {
        this.results = response?.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading results:', error);
        this.errorMessage = error?.error?.message || 'Failed to load results';
        this.loading = false;
      }
    });
  }

  // =========================================================
  // Filtered Results
  // =========================================================

  get filteredResults(): any[] {
    const search = this.searchText.toLowerCase().trim();

    return this.results.filter((result: any) => {
      const studentName = this.getStudentName(result).toLowerCase();
      const studentCode = this.getStudentCode(result).toLowerCase();
      const examTitle = this.getExamTitle(result).toLowerCase();

      const matchesSearch =
        !search ||
        studentName.includes(search) ||
        studentCode.includes(search) ||
        examTitle.includes(search);

      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        (this.selectedStatus === 'Passed' && result.isPassed === true) ||
        (this.selectedStatus === 'Failed' && result.isPassed === false);

      const matchesExam =
        !this.selectedExam ||
        result.exam?._id === this.selectedExam ||
        result.exam === this.selectedExam;

      return matchesSearch && matchesStatus && matchesExam;
    });
  }

  // =========================================================
  // Statistics
  // =========================================================

  get totalResults(): number {
    return this.results.length;
  }

  get passedResults(): number {
    return this.results.filter((result: any) => result.isPassed === true).length;
  }

  get failedResults(): number {
    return this.results.filter((result: any) => result.isPassed === false).length;
  }

  get averagePercentage(): number {
    if (!this.results.length) return 0;
    const totalPercentage = this.results.reduce((sum: number, result: any) => {
      return sum + this.getPercentage(result);
    }, 0);
    return totalPercentage / this.results.length;
  }

  // =========================================================
  // Student Helpers
  // =========================================================

  getStudentName(result: any): string {
    return result?.student?.userId?.name || 'Unknown';
  }

  getStudentCode(result: any): string {
    return result?.student?.studentCode || '-';
  }

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
  // Exam Helpers
  // =========================================================

  getExamTitle(result: any): string {
    return result?.exam?.title || 'Unknown Exam';
  }

  getExamId(result: any): string {
    return result?.exam?._id || result?.exam || '';
  }

  // =========================================================
  // Marks
  // =========================================================

  getMarks(result: any): number {
    return Number(result?.marks || 0);
  }

  getTotalMarks(result: any): number {
    return Number(result?.exam?.totalMarks || result?.totalMarks || 0);
  }

  // =========================================================
  // Percentage
  // =========================================================

  getPercentage(result: any): number {
    const marks = this.getMarks(result);
    const total = this.getTotalMarks(result);
    if (!total) return 0;
    return (marks / total) * 100;
  }

  // =========================================================
  // Add Result
  // =========================================================

  openAddResult(): void {
    this.newResult = {
      exam: '',
      studentCode: '',
      marks: 0
    };
    this.showAddModal = true;
  }

  closeAddResult(): void {
    this.showAddModal = false;
  }

  // =========================================================
  // Save Result (Create)
  // =========================================================

  saveResult(): void {
    if (!this.newResult.exam || !this.newResult.studentCode.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    this.loading = true;

    const resultData = {
      exam: this.newResult.exam,
      studentCode: this.newResult.studentCode.trim(),
      marks: Number(this.newResult.marks)
    };

    this.resultService.createResult(resultData).subscribe({
      next: (response: any) => {
        this.results.push(response.data);
        this.closeAddResult();
        this.loading = false;
        alert('Result created successfully!');
      },
      error: (error: any) => {
        console.error('Error creating result:', error);
        alert(error?.error?.message || 'Failed to create result');
        this.loading = false;
      }
    });
  }

  // =========================================================
  // View Result
  // =========================================================

  viewResult(result: any): void {
    if (result._id) {
      this.resultService.getResultById(result._id).subscribe({
        next: (response: any) => {
          this.selectedResult = response.data;
          this.showViewModal = true;
        },
        error: (error: any) => {
          console.error('Error fetching result details:', error);
          this.selectedResult = result;
          this.showViewModal = true;
        }
      });
    } else {
      this.selectedResult = result;
      this.showViewModal = true;
    }
  }

  closeViewResult(): void {
    this.showViewModal = false;
    this.selectedResult = null;
  }

  // =========================================================
  // Edit Result
  // =========================================================

  editResult(result: any): void {
    this.selectedResult = result;
    this.editMarks = this.getMarks(result);
    this.showEditModal = true;
  }

  closeEditResult(): void {
    this.showEditModal = false;
    this.selectedResult = null;
    this.editMarks = 0;
  }

  // =========================================================
  // Update Result
  // =========================================================

  updateResult(): void {
    if (!this.selectedResult || !this.selectedResult._id) {
      alert('Invalid result selected.');
      return;
    }

    this.loading = true;

    const updateData = {
      marks: Number(this.editMarks)
    };

    this.resultService.updateResult(this.selectedResult._id, updateData).subscribe({
      next: (response: any) => {
        const updatedResult = response.data;
        const index = this.results.findIndex(r => r._id === updatedResult._id);
        if (index !== -1) {
          this.results[index] = updatedResult;
        }
        this.closeEditResult();
        this.loading = false;
        alert('Result updated successfully!');
      },
      error: (error: any) => {
        console.error('Error updating result:', error);
        alert(error?.error?.message || 'Failed to update result');
        this.loading = false;
      }
    });
  }

  // =========================================================
  // Delete Result
  // =========================================================

  deleteResult(result: any): void {
    const id = result?._id;
    if (!id) {
      console.error('Result ID not found.');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the result of ${this.getStudentName(result)}?`
    );
    if (!confirmed) return;

    this.loading = true;

    this.resultService.deleteResult(id).subscribe({
      next: () => {
        this.results = this.results.filter((item: any) => item._id !== id);
        this.loading = false;
        alert('Result deleted successfully!');
      },
      error: (error: any) => {
        console.error('Error deleting result:', error);
        alert(error?.error?.message || 'Failed to delete result');
        this.loading = false;
      }
    });
  }

}