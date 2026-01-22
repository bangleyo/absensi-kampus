import {Component, ContentChild, Input, OnChanges, SimpleChanges, TemplateRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-shared-table',
  templateUrl: './table.html',
  styleUrls: ['./table.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SharedTableComponent<T> implements OnChanges {
  @Input() data: T[] = [];
  @Input() columns: { key: string; label: string }[] = [];
  @Input() loading: boolean = false;

  @ContentChild('actionTemplate') actionTemplate?: TemplateRef<any>;

  currentPage = 1;
  itemsPerPage = 5;
  paginationOptions = [5, 10, 25, 50];
  totalPages = 0;
  paginatedData: T[] = [];
  pages: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['loading']) {
      this.calculatePagination();
    }
  }

  /**
   * Mengambil value dari nested object (ex: 'course.name')
   */
  resolveValue(item: any, key: string): any {
    if (!key) return '';
    return key.split('.').reduce((obj, property) => {
      return obj ? obj[property] : '-'; // Return '-' jika data null
    }, item);
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.calculatePagination();
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  private calculatePagination(): void {
    if (!this.data || this.data.length === 0) {
      this.totalPages = 0;
      this.pages = [];
      this.paginatedData = [];
      return;
    }

    this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedData = this.data.slice(start, end);
  }
}
