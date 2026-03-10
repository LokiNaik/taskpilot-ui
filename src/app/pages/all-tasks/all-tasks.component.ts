import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>All Tasks</h2>
        <input class="search" type="text" [(ngModel)]="search" placeholder="Search tasks..." />
        <span class="count mono">{{ filteredTasks.length }} tasks</span>
      </div>

      <div class="task-list">
        <div class="loading" *ngIf="loading()">Loading...</div>

        <app-task-card
          *ngFor="let task of filteredTasks"
          [task]="task"
          (taskUpdated)="onUpdated($event)"
          (taskDeleted)="onDeleted($event)"
        />

        <div class="empty" *ngIf="!loading() && filteredTasks.length === 0">
          No tasks found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .page-header { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    h2 { font-size: 19px; white-space: nowrap; }
    .search { width: 260px; padding: 7px 12px; font-size: 13px; }
    .count { font-size: 12px; color: var(--muted); margin-left: auto; font-family: 'JetBrains Mono', monospace; }
    .task-list { flex: 1; overflow-y: auto; padding: 16px 24px 40px; display: flex; flex-direction: column; gap: 8px; }
    .loading, .empty { color: var(--muted); font-size: 13px; padding: 40px 0; text-align: center; }
  `]
})
export class AllTasksComponent implements OnInit {

  tasks   = signal<Task[]>([]);
  loading = signal(true);
  search  = '';

  constructor(private taskService: TaskService, private userService: UserService) {}

  ngOnInit() {
    setTimeout(() => {
      const userId = this.userService.getUserId();
      if (!userId) { this.loading.set(false); return; }
      this.taskService.getTasks(userId).subscribe({
        next: ({ tasks }) => { this.tasks.set(tasks); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }, 800);
  }

  get filteredTasks(): Task[] {
    const q = this.search.toLowerCase();
    return q
      ? this.tasks().filter(t => t.title.toLowerCase().includes(q) || t.tags?.some(tag => tag.includes(q)))
      : this.tasks();
  }

  onUpdated(t: Task)    { this.tasks.update(list => list.map(x => x.id === t.id ? t : x)); }
  onDeleted(id: string) { this.tasks.update(list => list.filter(x => x.id !== id)); }
}
