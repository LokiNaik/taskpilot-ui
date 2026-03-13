import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  today = new Date();

  @Output() openDigest = new EventEmitter<void>();

  constructor(public auth: AuthService) {}

  get userInitial(): string {
    const name = this.auth.currentUser()?.name || '';
    return name.charAt(0).toUpperCase();
  }
}