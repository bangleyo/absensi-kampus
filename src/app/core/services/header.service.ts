import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private readonly pageTitleSource = new BehaviorSubject<string>('Dashboard');
  readonly currentPageTitle = this.pageTitleSource.asObservable();

  updateTitle(title: string): void {
    this.pageTitleSource.next(title);
  }
}
