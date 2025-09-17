import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Store } from '@ngrx/store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UIActions } from '../../store/ui/ui.actions';
import { selectSidebarOpen, selectMobileView } from '../../store/ui/ui.selectors';
import { AuthActions } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="main-layout">
      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar -->
        <mat-sidenav 
          #drawer
          class="sidenav"
          fixedInViewport
          [attr.role]="isMobile() ? 'dialog' : 'navigation'"
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="sidebarOpen() && !isMobile()"
          (openedChange)="onSidenavToggle($event)">
          <app-sidebar></app-sidebar>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content class="main-content">
          <!-- Header -->
          <app-header 
            [isMobile]="isMobile()"
            (menuToggle)="toggleSidebar()"
            (logout)="logout()">
          </app-header>

          <!-- Content area -->
          <main class="content-area">
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .main-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidenav-container {
      flex: 1;
      display: flex;
    }

    .sidenav {
      width: 280px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }

    .main-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .content-area {
      flex: 1;
      overflow: auto;
      background: #fafafa;
    }

    @media (max-width: 768px) {
      .sidenav {
        width: 256px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private store = inject(Store);
  private breakpointObserver = inject(BreakpointObserver);

  sidebarOpen = this.store.selectSignal(selectSidebarOpen);
  isMobile = signal(false);

  ngOnInit(): void {
    // Check for mobile view
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        const isMobile = result.matches;
        this.isMobile.set(isMobile);
        this.store.dispatch(UIActions.setMobileView({ isMobile }));
      });

    // Load token from storage on app start
    this.store.dispatch(AuthActions.loadTokenFromStorage());
  }

  toggleSidebar(): void {
    this.store.dispatch(UIActions.toggleSidebar());
  }

  onSidenavToggle(opened: boolean): void {
    this.store.dispatch(UIActions.setSidebarOpen({ open: opened }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}