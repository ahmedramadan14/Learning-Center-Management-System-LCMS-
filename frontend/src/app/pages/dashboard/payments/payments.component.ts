import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

  payments: any[] = [
  ];


  currentPage: number = 1;
  pageSize: number = 6; 

  get totalEntries(): number {
    return this.payments.length;
  }


  get totalPages(): number {
    return Math.ceil(this.totalEntries / this.pageSize) || 1;
  }

  constructor() { }

  ngOnInit(): void { }

  statusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'badge badge--paid';
      case 'Pending':
        return 'badge badge--pending';
      case 'Overdue':
        return 'badge badge--overdue';
      default:
        return 'badge';
    }
  }
  onFilterClick() { }
  isModalOpen: boolean = false;
  newPayment = {
    studentName: '',
    group: '',
    amount: 0,
    status: 'Paid'
  };
  onRecordPaymentClick() {
    this.newPayment = { studentName: '', group: '', amount: 0, status: 'Paid' };
    this.isModalOpen = true;
   }
  closeModal() {
    this.isModalOpen = false;
  }
  savePayment() {
    if (!this.newPayment.studentName || !this.newPayment.amount) {
      return;
    }

    this.payments.unshift({
      studentName: this.newPayment.studentName,
      group: this.newPayment.group || 'General Group',
      amount: Number(this.newPayment.amount),
      status: this.newPayment.status,
      // dueDate: ,
      paymentDate: this.newPayment.status === 'Paid' ? Date.now: null,
    });

    this.isModalOpen = false;
  }
  onDownloadClick(payment: any) { }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}