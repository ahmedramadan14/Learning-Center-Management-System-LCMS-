import { Component, OnInit } from '@angular/core';
import { ResultService } from '../../../services/results/results.service';
@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  results: any[] = [];

  searchText = '';
  selectedStatus = 'All Status';

  loading = false;
  errorMessage = '';

  constructor(
    private resultService: ResultService
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this.loading = true;
    this.errorMessage = '';

    this.resultService.getAllResults().subscribe({

      next: (response: any) => {

        this.results = response.data || [];

        this.loading = false;
      },

      error: (error: any) => {

        console.error('Error loading results:', error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to load results';

        this.loading = false;
      }

    });
  }

  get filteredResults(): any[] {

    const search =
      this.searchText.toLowerCase().trim();

    return this.results.filter(result => {

      const studentName =
        result.student?.userId?.name?.toLowerCase() || '';

      const studentCode =
        result.student?.studentCode?.toLowerCase() || '';

      const examTitle =
        result.exam?.title?.toLowerCase() || '';

      const matchesSearch =
        studentName.includes(search) ||
        studentCode.includes(search) ||
        examTitle.includes(search);

      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        (this.selectedStatus === 'Passed'
          ? result.isPassed === true
          : result.isPassed === false);

      return matchesSearch && matchesStatus;
    });
  }

  get totalResults(): number {
    return this.results.length;
  }

  get passedResults(): number {
    return this.results.filter(
      result => result.isPassed === true
    ).length;
  }

  get failedResults(): number {
    return this.results.filter(
      result => result.isPassed === false
    ).length;
  }

  get averageMarks(): number {

    if (!this.results.length) {
      return 0;
    }

    const total = this.results.reduce(
      (sum, result) =>
        sum + Number(result.marks || 0),
      0
    );

    return total / this.results.length;
  }

  getStudentName(result: any): string {
    return result.student?.userId?.name || 'Unknown';
  }

  getStudentCode(result: any): string {
    return result.student?.studentCode || '-';
  }

  getExamTitle(result: any): string {
    return result.exam?.title || 'Unknown Exam';
  }

  getMarks(result: any): number {
    return Number(result.marks || 0);
  }

  getTotalMarks(result: any): number {
    return Number(result.exam?.totalMarks || 0);
  }

  getPercentage(result: any): number {

    const marks = this.getMarks(result);
    const total = this.getTotalMarks(result);

    if (!total) {
      return 0;
    }

    return (marks / total) * 100;
  }

  deleteResult(result: any): void {

    const id = result._id;

    if (!id) {
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete the result of ${this.getStudentName(result)}?`
    );

    if (!confirmed) {
      return;
    }

    this.resultService.deleteResult(id).subscribe({

      next: () => {

        this.results = this.results.filter(
          item => item._id !== id
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