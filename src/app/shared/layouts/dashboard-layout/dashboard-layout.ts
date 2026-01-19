import {Component} from '@angular/core';
import {SidebarComponent} from '../../components/sidebar/sidebar';
import {TopbarComponent} from '../../components/topbar/topbar';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-layout-dashboard',
  templateUrl: './dashboard-layout.html',
  imports: [
    SidebarComponent,
    TopbarComponent,
    RouterOutlet
  ],
  styleUrls: ['./dashboard-layout.css']
})
export class DashboardLayoutComponent {
}
