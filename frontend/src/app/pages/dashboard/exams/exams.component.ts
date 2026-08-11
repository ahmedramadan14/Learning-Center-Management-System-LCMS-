import { Component } from '@angular/core';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent {

  searchText = '';
  selectedStatus = 'All Status';
  selectedGroup = 'All Groups';
  selectedSubject = 'All Subjects';

  exams = [
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

  get filteredExams() {
    const search = this.searchText.toLowerCase().trim();

    return this.exams.filter(exam => {

      const matchesSearch =
        exam.name.toLowerCase().includes(search) ||
        exam.subject.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'All Status' ||
        exam.status === this.selectedStatus;

      const matchesGroup =
        this.selectedGroup === 'All Groups' ||
        exam.group === this.selectedGroup;

      const matchesSubject =
        this.selectedSubject === 'All Subjects' ||
        exam.subject === this.selectedSubject;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGroup &&
        matchesSubject
      );
    });
  }

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

}