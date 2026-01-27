import {Component, Signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';

import {SidebarComponent} from '../../components/sidebar/sidebar';
import {TopbarComponent} from '../../components/topbar/topbar';

import {LayoutService} from '../../../core/services/layout.service';

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
  isSidebarCollapsed: Signal<boolean>;

  constructor(protected layoutService: LayoutService) {
    this.isSidebarCollapsed = this.layoutService.isSidebarCollapsed;
  }
}
