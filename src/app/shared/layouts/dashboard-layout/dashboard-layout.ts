import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Wajib untuk AsyncPipe/Class binding
import { RouterOutlet } from '@angular/router';

// Imports Components
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TopbarComponent } from '../../components/topbar/topbar';

// Service
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.html',
  styleUrls: ['./dashboard-layout.css'],
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopbarComponent,
    RouterOutlet
  ]
})
export class DashboardLayoutComponent {
  // Signal untuk membaca state sidebar
  isSidebarCollapsed: Signal<boolean>;

  constructor(private layoutService: LayoutService) {
    this.isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
  }
}
