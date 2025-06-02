// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav>
      <ul>
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Wallet Connector</a></li>
        <li><a routerLink="/verify" routerLinkActive="active">Verify Certificate</a></li>
        <li><a routerLink="/my-certificates" routerLinkActive="active">My Certificates</a></li>
        <li><a routerLink="/issue" routerLinkActive="active">Issue Certificate</a></li>
      </ul>
    </nav>
    <main class="content">
      <router-outlet></router-outlet> <!-- Displays routed components -->
    </main>
  `,
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    RouterLink,
    RouterLinkActive
  ]
})
export class AppComponent {}