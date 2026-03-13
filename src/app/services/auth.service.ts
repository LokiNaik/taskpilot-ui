import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  currentUser = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('wl_user');
    if (stored) this.currentUser.set(JSON.parse(stored));
  }

  register(name: string, email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.saveSession(res)));
  }

  logout() {
    localStorage.removeItem('wl_token');
    localStorage.removeItem('wl_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('wl_token');
  }

  getUserId(): string {
    return this.currentUser()?.id || '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private saveSession(res: any) {
    localStorage.setItem('wl_token', res.token);
    localStorage.setItem('wl_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }
}