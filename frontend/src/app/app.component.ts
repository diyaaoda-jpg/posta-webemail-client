import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { AuthActions } from './store/auth/auth.actions';
import { UIActions } from './store/ui/ui.actions';
import { selectTheme } from './store/ui/ui.selectors';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div [class]="theme() + '-theme'">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private breakpointObserver = inject(BreakpointObserver);

  theme = this.store.selectSignal(selectTheme);

  ngOnInit(): void {
    // Initialize auth state from localStorage
    this.store.dispatch(AuthActions.loadTokenFromStorage());

    // Apply theme to document body
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.store.dispatch(UIActions.setMobileView({ isMobile: result.matches }));
      });

    // Apply theme changes to document
    document.body.className = this.theme() === 'dark' ? 'dark-theme' : '';
  }
}
