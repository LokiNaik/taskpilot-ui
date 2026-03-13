import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="auth-box">
        <div class="auth-logo">WorkLog <span>AI</span></div>
        <h2>Create account</h2>
        <p class="sub">Start logging your work smarter</p>

        <div class="error" *ngIf="error">{{ error }}</div>

        <div class="field">
          <label>Full Name</label>
          <input type="text" [(ngModel)]="name" placeholder="Lokesh" />
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" [(ngModel)]="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="min 6 characters"
            (keyup.enter)="register()" />
        </div>

        <button class="btn-primary" (click)="register()" [disabled]="loading">
          {{ loading ? 'Creating...' : 'Create Account' }}
        </button>

        <p class="switch">Already have account? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrap {
      min-height: 100vh; display: flex;
      align-items: center; justify-content: center; background: var(--bg);
    }
    .auth-box {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 40px; width: 100%; max-width: 420px;
    }
    .auth-logo { font-size: 22px; font-weight: 700; font-family: 'DM Serif Display', serif;
      color: var(--text); margin-bottom: 24px; span { color: var(--amber); } }
    h2 { font-size: 20px; margin: 0 0 4px; }
    .sub { color: var(--muted); font-size: 13px; margin: 0 0 24px; }
    .field {
      margin-bottom: 16px;
      label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 6px;
        text-transform: uppercase; letter-spacing: .5px; }
      input { width: 100%; padding: 10px 14px; background: var(--surface2);
        border: 1px solid var(--border); border-radius: 8px; color: var(--text);
        font-size: 14px; outline: none; box-sizing: border-box;
        &:focus { border-color: var(--amber); } }
    }
    .btn-primary { width: 100%; padding: 12px; background: var(--amber); color: #000;
      font-weight: 700; font-size: 14px; border-radius: 8px; margin-top: 8px;
      &:disabled { opacity: .6; } }
    .switch { text-align: center; margin-top: 20px; color: var(--muted); font-size: 13px;
      a { color: var(--amber); text-decoration: none; } }
    .error { background: rgba(240,78,78,.1); border: 1px solid var(--red);
      color: var(--red); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  `]
})
export class RegisterComponent {
  name     = '';
  email    = '';
  password = '';
  loading  = false;
  error    = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    if (!this.name || !this.email || !this.password) { this.error = 'Fill all fields'; return; }
    if (this.password.length < 6) { this.error = 'Password min 6 characters'; return; }
    this.loading = true;
    this.error   = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/today']),
      error: err => {
        this.error   = err.error?.error || 'Registration failed';
        this.loading = false;
      }
    });
  }
}