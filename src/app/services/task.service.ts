import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, DailyDigest, DigestResponse } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private api = environment.apiUrl;

  // Hardcoded for now — replace with auth later
  readonly userId = ''; // Will be set after fetching from DB

  constructor(private http: HttpClient) {}

  // ── Users ──────────────────────────────────────────────────
  getUsers(): Observable<{ id: string; name: string; email: string }[]> {
    return this.http.get<any[]>(`${this.api}/users`);
  }

  // ── Tasks ──────────────────────────────────────────────────
  getTasks(userId: string, date?: string, status?: string): Observable<{ tasks: Task[] }> {
    let params = new HttpParams().set('userId', userId);
    if (date)   params = params.set('date', date);
    if (status) params = params.set('status', status);
    return this.http.get<{ tasks: Task[] }>(`${this.api}/tasks`, { params });
  }

  createTask(task: Partial<Task> & { userId: string }): Observable<Task> {
    return this.http.post<Task>(`${this.api}/tasks`, task);
  }

  updateTask(id: string, updates: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.api}/tasks/${id}`, updates);
  }

  deleteTask(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.api}/tasks/${id}`);
  }

  // ── AI ─────────────────────────────────────────────────────
  addFromNaturalLanguage(text: string, userId: string): Observable<{ task: Task; parsed: any }> {
    return this.http.post<{ task: Task; parsed: any }>(`${this.api}/ai/add`, { text, userId });
  }

  reprioritize(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/ai/reprioritize`, { userId });
  }

  // ── Digest ─────────────────────────────────────────────────
  getDigest(userId: string, date?: string): Observable<DigestResponse> {
    let params = new HttpParams().set('userId', userId);
    if (date) params = params.set('date', date);
    return this.http.get<DigestResponse>(`${this.api}/digest`, { params });
  }

  generateDigest(userId: string, date?: string): Observable<DigestResponse> {
    return this.http.post<DigestResponse>(`${this.api}/digest/generate`, { userId, date });
  }
}
