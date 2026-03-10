import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User {
  id:    string;
  name:  string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadUser();
  }

  private loadUser() {
    // Load the first user from DB (replace with login later)
    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          this.currentUser.set(users[0]);
          localStorage.setItem('userId', users[0].id);
        }
      },
      error: () => {
        // Fallback to localStorage
        const id = localStorage.getItem('userId');
        if (id) this.currentUser.set({ id, name: 'User', email: '' });
      }
    });
  }

  getUserId(): string {
    return this.currentUser()?.id || localStorage.getItem('userId') || '';
  }
}
