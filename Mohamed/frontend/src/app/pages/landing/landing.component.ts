import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  menuOpen = false;
  isScrolled = false;

  features = [
    {
      icon: '01',
      title: 'Student Management',
      text: 'Manage student profiles, enrollment, academic records, and daily activity from one place.'
    },
    {
      icon: '02',
      title: 'Teacher Management',
      text: 'Organize teachers, assignments, classes, schedules, and workloads with ease.'
    },
    {
      icon: '03',
      title: 'Classes & Groups',
      text: 'Create groups, organize subjects, and keep every class structured and connected.'
    },
    {
      icon: '04',
      title: 'Attendance',
      text: 'Track attendance quickly and get a clear view of student attendance rates.'
    },
    {
      icon: '05',
      title: 'Exams & Results',
      text: 'Manage exams, grades, results, and student performance in one workflow.'
    },
    {
      icon: '06',
      title: 'Payments',
      text: 'Track payments, outstanding balances, and financial activity without spreadsheets.'
    },
    {
      icon: '07',
      title: 'Notifications',
      text: 'Keep students, parents, teachers, and administrators connected with important updates.'
    },
    {
      icon: '08',
      title: 'Schedules',
      text: 'Build organized schedules and make sure teachers and students always know what comes next.'
    }
  ];

  steps = [
    {
      number: '01',
      title: 'Set up your center',
      text: 'Create your center structure, users, classes, subjects, and schedules.'
    },
    {
      number: '02',
      title: 'Connect everyone',
      text: 'Bring students, teachers, parents, and administrators into one connected system.'
    },
    {
      number: '03',
      title: 'Manage everything',
      text: 'Handle attendance, exams, results, payments, schedules, and daily operations.'
    }
  ];

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}