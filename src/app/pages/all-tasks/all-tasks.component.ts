import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>All Tasks</h2>
        <input class="search" type="text" [(ngModel)]="search"
          placeholder="Search tasks..." (ngModelChange)="onSearch($event)" />
        <span class="count mono">{{ filteredList.length }} tasks</span>
      </div>

      <div class="task-list">
        <div class="loading" *ngIf="loading()">Loading...</div>

        <app-task-card
          *ngFor="let task of filteredList"
          [task]="task"
          (taskUpdated)="onUpdated($event)"
          (taskDeleted)="onDeleted($event)"
        />

        <div class="empty" *ngIf="!loading() && filteredList.length === 0">
          No tasks found.
        </div>
      </div>
    </div>
  `,
styles: [`
  .page { 
    flex: 1;            /* ← height: 100% ki jagah */
    display: flex; 
    flex-direction: column; 
    min-height: 0;
    overflow: hidden;
  }
  .page-header { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    padding: 16px 24px; 
    border-bottom: 1px solid var(--border); 
    flex-shrink: 0;
  }
  h2 { font-size: 19px; white-space: nowrap; }
  .search { 
    width: 260px; padding: 7px 12px; font-size: 13px; 
    background: var(--surface2); border: 1px solid var(--border); 
    border-radius: 6px; color: var(--text); outline: none; 
  }
  .search:focus { border-color: var(--amber); }
  .count { font-size: 12px; color: var(--muted); margin-left: auto; font-family: 'JetBrains Mono', monospace; }
  .task-list { 
    flex: 1; 
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 24px 40px; 
    display: flex; 
    flex-direction: column; 
    gap: 8px;
    min-height: 0;
  }
  .loading, .empty { color: var(--muted); font-size: 13px; padding: 40px 0; text-align: center; }
`]
})
export class AllTasksComponent implements OnInit {

  tasks   = signal<Task[]>([]);
  loading = signal(true);
  search  = '';
  filteredList: Task[] = [];

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private auth: AuthService
  ) {}


ngOnInit() {
  const userId = this.auth.getUserId();
  if (!userId) { this.loading.set(false); return; }

  this.taskService.getTasks(userId).subscribe({
    next: (response: any) => {
      const tasks = Array.isArray(response) ? response : (response?.tasks || []);
      this.tasks.set(tasks);
      this.filteredList = tasks;
      this.loading.set(false);
    },
    error: () => {
      this.tasks.set([]);
      this.filteredList = [];
      this.loading.set(false);
    }
  });
}
  onSearch(query: string) {
    const q = query.toLowerCase().trim();
    const all = this.tasks() || [];
    this.filteredList = q
      ? all.filter(t =>
          t.title.toLowerCase().includes(q) ||
          (t.tags || []).some(tag => tag.toLowerCase().includes(q))
        )
      : all;
  }

  onUpdated(t: Task) {
    this.tasks.update(list => (list || []).map(x => x.id === t.id ? t : x));
    this.filteredList = this.filteredList.map(x => x.id === t.id ? t : x);
  }

  onDeleted(id: string) {
    this.tasks.update(list => (list || []).filter(x => x.id !== id));
    this.filteredList = this.filteredList.filter(x => x.id !== id);
  }
}