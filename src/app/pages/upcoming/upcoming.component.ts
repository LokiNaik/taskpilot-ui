import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-upcoming',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Upcoming Tasks</h2>
        <span class="count mono" *ngIf="tasks().length">{{ tasks().length }} tasks</span>
      </div>

      <div class="task-list">
        <div class="loading" *ngIf="loading()">Loading...</div>

        <ng-container *ngFor="let group of groupedTasks">
          <div class="group-header">
            <span>{{ group.label }}</span>
            <div class="line"></div>
          </div>
          <app-task-card
            *ngFor="let task of group.tasks"
            [task]="task"
            (taskUpdated)="onUpdated($event)"
            (taskDeleted)="onDeleted($event)"
          />
        </ng-container>

        <div class="empty" *ngIf="!loading() && tasks().length === 0">
          No upcoming tasks with deadlines. 🎉
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    .page-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px 12px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    h2 { font-size: 19px; }
    .count { font-size: 12px; color: var(--muted); }
    .task-list { flex: 1; overflow-y: auto; padding: 16px 24px 40px; display: flex; flex-direction: column; gap: 8px; }
    .group-header { display: flex; align-items: center; gap: 12px; padding: 8px 0 4px; color: var(--muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; }
    .line { flex: 1; height: 1px; background: var(--border); }
    .loading, .empty { color: var(--muted); font-size: 13px; padding: 40px 0; text-align: center; }
  `]
})
export class UpcomingComponent implements OnInit {

  tasks   = signal<Task[]>([]);
  loading = signal(true);

  constructor(private taskService: TaskService, private userService: UserService) {}

  ngOnInit() {
    setTimeout(() => {
      const userId = this.userService.getUserId();
      if (!userId) { this.loading.set(false); return; }
      this.taskService.getTasks(userId).subscribe({
        next: ({ tasks }) => {
          const upcoming = tasks
            .filter(t => t.due_date && t.status !== 'done')
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
          this.tasks.set(upcoming);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }, 800);
  }

  get groupedTasks(): { label: string; tasks: Task[] }[] {
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const next7    = new Date(today); next7.setDate(today.getDate() + 7);

    const groups = [
      { label: 'Overdue',        tasks: this.tasks().filter(t => new Date(t.due_date!) < today) },
      { label: 'Today',          tasks: this.tasks().filter(t => new Date(t.due_date!).toDateString() === today.toDateString()) },
      { label: 'Tomorrow',       tasks: this.tasks().filter(t => new Date(t.due_date!).toDateString() === tomorrow.toDateString()) },
      { label: 'Next 7 Days',    tasks: this.tasks().filter(t => { const d = new Date(t.due_date!); return d > tomorrow && d <= next7; }) },
      { label: 'Later',          tasks: this.tasks().filter(t => new Date(t.due_date!) > next7) },
    ];

    return groups.filter(g => g.tasks.length > 0);
  }

  onUpdated(t: Task)  { this.tasks.update(list => list.map(x => x.id === t.id ? t : x)); }
  onDeleted(id: string) { this.tasks.update(list => list.filter(x => x.id !== id)); }
}
