import { Component, OnInit } from '@angular/core';
import { ResultService } from '../../../services/results/results.service';

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

  // =========================================================
  // Filters
  // =========================================================

  searchText: string = '';
  selectedStatus: string = 'All Status';

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
    student: '',
    exam: '',
    marks: 0,
    totalMarks: 100
  };

  // =========================================================
  // Edit Result
  // =========================================================

  editMarks: number = 0;

  // =========================================================
  // Constructor
  // =========================================================

  constructor(
    private resultService: ResultService
  ) {}

  // =========================================================
  // Lifecycle
  // =========================================================

  ngOnInit(): void {
    this.loadResults();
  }

  // =========================================================
  // Load Results
  // =========================================================

  loadResults(): void {

    this.loading = true;
    this.errorMessage = '';

    this.resultService
      .getAllResults()
      .subscribe({

        next: (response: any) => {

          this.results = response?.data || [];

          this.loading = false;
        },

        error: (error: any) => {

          console.error(
            'Error loading results:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to load results';

          this.loading = false;
        }

      });
  }

  // =========================================================
  // Filtered Results
  // =========================================================

  get filteredResults(): any[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();

    return this.results.filter(
      (result: any) => {

        const studentName =
          this.getStudentName(result)
            .toLowerCase();

        const studentCode =
          this.getStudentCode(result)
            .toLowerCase();

        const examTitle =
          this.getExamTitle(result)
            .toLowerCase();

        const matchesSearch =
          !search ||
          studentName.includes(search) ||
          studentCode.includes(search) ||
          examTitle.includes(search);

        const matchesStatus =
          this.selectedStatus === 'All Status' ||
          (
            this.selectedStatus === 'Passed' &&
            result.isPassed === true
          ) ||
          (
            this.selectedStatus === 'Failed' &&
            result.isPassed === false
          );

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }

  // =========================================================
  // Statistics
  // =========================================================

  get totalResults(): number {
    return this.results.length;
  }

  get passedResults(): number {

    return this.results.filter(
      (result: any) =>
        result.isPassed === true
    ).length;
  }

  get failedResults(): number {

    return this.results.filter(
      (result: any) =>
        result.isPassed === false
    ).length;
  }

  get averagePercentage(): number {

    if (!this.results.length) {
      return 0;
    }

    const totalPercentage =
      this.results.reduce(
        (
          sum: number,
          result: any
        ) => {

          return (
            sum +
            this.getPercentage(result)
          );

        },
        0
      );

    return (
      totalPercentage /
      this.results.length
    );
  }

  // =========================================================
  // Student Helpers
  // =========================================================

  getStudentName(result: any): string {

    return (
      result?.student?.userId?.name ||
      'Unknown'
    );
  }

  getStudentCode(result: any): string {

    return (
      result?.student?.studentCode ||
      '-'
    );
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

    return (
      result?.exam?.title ||
      'Unknown Exam'
    );
  }

  // =========================================================
  // Marks
  // =========================================================

  getMarks(result: any): number {

    return Number(
      result?.marks || 0
    );
  }

  getTotalMarks(result: any): number {

    return Number(
      result?.exam?.totalMarks ||
      result?.totalMarks ||
      0
    );
  }

  // =========================================================
  // Percentage
  // =========================================================

  getPercentage(result: any): number {

    const marks =
      this.getMarks(result);

    const total =
      this.getTotalMarks(result);

    if (!total) {
      return 0;
    }

    return (
      (marks / total) * 100
    );
  }

  // =========================================================
  // Add Result
  // =========================================================

  openAddResult(): void {

    this.newResult = {
      student: '',
      exam: '',
      marks: 0,
      totalMarks: 100
    };

    this.showAddModal = true;
  }

  // =========================================================
  // Close Add Result Modal
  // =========================================================

  closeAddResult(): void {

    this.showAddModal = false;
  }

  // =========================================================
  // Save Result
  // =========================================================

  saveResult(): void {

    if (
      !this.newResult.student.trim() ||
      !this.newResult.exam.trim()
    ) {
      return;
    }

    /*
      Currently this keeps the same behavior
      as your original Results module.

      When createResult() is available inside
      ResultService, connect the API here.
    */

    console.log(
      'New result:',
      this.newResult
    );

    this.closeAddResult();
  }

  // =========================================================
  // View Result
  // =========================================================

  viewResult(result: any): void {

    this.selectedResult = result;

    this.showViewModal = true;
  }

  // =========================================================
  // Close Details Modal
  // =========================================================

  closeViewResult(): void {

    this.showViewModal = false;

    this.selectedResult = null;
  }

  // =========================================================
  // Edit Result
  // =========================================================

  editResult(result: any): void {

    this.selectedResult = result;

    this.editMarks =
      this.getMarks(result);

    this.showEditModal = true;
  }

  // =========================================================
  // Close Edit Modal
  // =========================================================

  closeEditResult(): void {

    this.showEditModal = false;

    this.selectedResult = null;

    this.editMarks = 0;
  }

  // =========================================================
  // Update Result
  // =========================================================

  updateResult(): void {

    if (!this.selectedResult) {
      return;
    }

    this.selectedResult.marks =
      Number(this.editMarks);

    const total =
      this.getTotalMarks(
        this.selectedResult
      );

    if (total > 0) {

      const percentage =
        (
          Number(this.editMarks) /
          total
        ) * 100;

      this.selectedResult.isPassed =
        percentage >= 50;
    }

    this.closeEditResult();
  }

  // =========================================================
  // Delete Result
  // =========================================================

  deleteResult(result: any): void {

    const id =
      result?._id;

    if (!id) {

      console.error(
        'Result ID not found.'
      );

      return;
    }

    const confirmed =
      confirm(
        `Are you sure you want to delete the result of ${this.getStudentName(result)}?`
      );

    if (!confirmed) {
      return;
    }

    this.resultService
      .deleteResult(id)
      .subscribe({

        next: () => {

          this.results =
            this.results.filter(
              (item: any) =>
                item._id !== id
            );
        },

        error: (error: any) => {

          console.error(
            'Error deleting result:',
            error
          );

          alert(
            error?.error?.message ||
            'Failed to delete result'
          );
        }

      });
  }

}
