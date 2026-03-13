import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, DailyDigest, DigestResponse } from '../models/task.model';
import { AuthService } from './auth.service';


@Injectable({ providedIn: 'root' })
export class TaskService {

  private apiUrl = environment.apiUrl;

  // Hardcoded for now — replace with auth later
  readonly userId = ''; // Will be set after fetching from DB

  constructor(private http: HttpClient,
    private auth: AuthService) { }


  // ── Users ──────────────────────────────────────────────────
  getUsers(): Observable<{ id: string; name: string; email: string }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  // ── Tasks ──────────────────────────────────────────────────
  getTasks(userId?: string, date?: string) {
    const uid = userId || this.auth.getUserId();
    let url = `${this.apiUrl}/tasks?userId=${uid}`;
    if (date) url += `&date=${date}`;
    return this.http.get<any>(url); // ← any use karo, array directly aata hai
  }

  createTask(task: Partial<Task> & { userId: string }): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}`, updates);
  }

  deleteTask(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/tasks/${id}`);
  }

  // ── AI ─────────────────────────────────────────────────────
  addFromNaturalLanguage(text: string) {
    return this.http.post<Task>(`${this.apiUrl}/ai/add`, {
      text,
      userId: this.auth.getUserId() // ← hardcoded userId hatao
    });
  }

  reprioritize(userId?: string) {
    return this.http.post(`${this.apiUrl}/ai/reprioritize`, {
      userId: userId || this.auth.getUserId()
    });
  }

  // ── Digest ─────────────────────────────────────────────────
 getDigest(userId?: string) {
  const uid = userId || this.auth.getUserId();
  return this.http.get<any>(`${this.apiUrl}/digest?userId=${uid}`);
}

generateDigest(userId?: string) {
  const uid = userId || this.auth.getUserId();
  return this.http.post<any>(`${this.apiUrl}/digest/generate`, { userId: uid });
}

  getUserId(): string {
    return this.auth.getUserId();
  }
  updateNote(noteId: string, note: string) {
    return this.http.patch<any>(`/api/notes/${noteId}`, { note });
  }
  getNotes(taskId: string) {
    return this.http.get<any[]>(`/api/notes/${taskId}`);
  }
  addNote(taskId: string, note: string) {
    return this.http.post<any>(`/api/notes/${taskId}`, { note });
  }
  deleteNote(noteId: string) {
    return this.http.delete(`/api/notes/${noteId}`);
  }
}
