import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { DigestPanelComponent } from './components/digest-panel/digest-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, DigestPanelComponent],
  template: `
    <div class="app-shell">
      <app-header (openDigest)="digestOpen = true" />
      <div class="app-body">
        <app-sidebar />
        <main class="app-main">
          <router-outlet />
        </main>
      </div>
      <app-digest-panel [open]="digestOpen" (close)="digestOpen = false" />
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: relative;
      z-index: 1;
    }
    .app-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .app-main {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class AppComponent {
  digestOpen = false;
}
