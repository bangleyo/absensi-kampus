// import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Component, ContentChild, Input, TemplateRef} from '@angular/core';

@Component({
  selector: 'app-shared-table',
  templateUrl: './table.html',
  styleUrls: ['./table.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SharedTableComponent {
  @Input() data: any[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() loading: boolean = false;

  // Custom template untuk kolom Actions agar tetap fleksibel
  @ContentChild('actionTemplate') actionTemplate?: TemplateRef<any>;

  // Pagination State
  currentPage = 1;
  itemsPerPage = 5;
  paginationOptions = [5, 10, 50];

  get totalPages(): number {
    return Math.ceil(this.data.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get paginatedData(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.data.slice(start, start + this.itemsPerPage);
  }

  setPage(page: number): void {
    // Validasi agar tidak kurang dari 1 atau lebih dari totalPages
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  resolveValue(item: any, key: string) {
    if (!key) return '';

    // Memecah 'course.name' menjadi ['course', 'name']
    // Lalu masuk ke dalam object satu per satu
    return key.split('.').reduce((obj, property) => {
      return obj ? obj[property] : null;
    }, item);
  }

  protected readonly Math = Math;
}
