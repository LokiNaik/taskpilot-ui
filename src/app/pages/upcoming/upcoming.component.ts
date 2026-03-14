import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
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

        <ng-container *ngFor="let group of groupedTasks()">
          <div class="group-header">
            <span>{{ group.label }}</span>
            <div class="line"></div>
          </div>
          <app-task-card
            *ngFor="let task of group.tasks; trackBy: trackById"
            [task]="task"
            (taskUpdated)="onUpdated($event)"
            (taskDeleted)="onDeleted($event)"
          />
        </ng-container>

        <div class="empty" *ngIf="!loading() && tasks().length === 0">
          No upcoming tasks. 🎉
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
    .page-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px 12px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
    h2 { font-size: 19px; }
    .count { font-size: 12px; color: var(--muted); }
    .task-list { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px 24px 40px; display: flex; flex-direction: column; gap: 8px; min-height: 0; }
    .group-header { display: flex; align-items: center; gap: 12px; padding: 8px 0 4px; color: var(--muted); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; }
    .line { flex: 1; height: 1px; background: var(--border); }
    .loading, .empty { color: var(--muted); font-size: 13px; padding: 40px 0; text-align: center; }
  `]
})
export class UpcomingComponent implements OnInit {

  tasks   = signal<Task[]>([]);
  loading = signal(true);

  constructor(
    private taskService: TaskService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const userId = this.auth.getUserId();
    if (!userId) { this.loading.set(false); return; }

    this.taskService.getTasks(userId).subscribe({
      next: (response: any) => {
        const tasks = Array.isArray(response) ? response : (response?.tasks || []);
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.tasks.set([]);
        this.loading.set(false);
      }
    });
  }

  // ← computed — sirf tab recalculate hoga jab tasks() change hoga
  groupedTasks = computed(() => {
    const all = this.tasks() || [];

    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const next7    = new Date(today); next7.setDate(today.getDate() + 7);

    const withDate    = all.filter(t => !!t.due_date);
    const withoutDate = all.filter(t => !t.due_date && t.status !== 'done');

    const groups = [
      {
        label: '🔴 Overdue',
        tasks: withDate.filter(t => new Date(t.due_date!) < today && t.status !== 'done')
      },
      {
        label: '📅 Today',
        tasks: withDate.filter(t => new Date(t.due_date!).toDateString() === today.toDateString())
      },
      {
        label: '🌅 Tomorrow',
        tasks: withDate.filter(t => new Date(t.due_date!).toDateString() === tomorrow.toDateString())
      },
      {
        label: '📆 Next 7 Days',
        tasks: withDate.filter(t => {
          const d = new Date(t.due_date!);
          return d > tomorrow && d <= next7;
        })
      },
      {
        label: '🗓️ Later',
        tasks: withDate.filter(t => new Date(t.due_date!) > next7)
      },
      {
        label: '📋 No Due Date',
        tasks: withoutDate
      },
    ];

    return groups.filter(g => g.tasks.length > 0);
  });

  // ← trackBy — components destroy/recreate nahi honge
  trackById(index: number, task: Task) {
    return task.id;
  }

  onUpdated(t: Task) {
    this.tasks.update(list => (list || []).map(x => x.id === t.id ? t : x));
  }

  onDeleted(id: string) {
    this.tasks.update(list => (list || []).filter(x => x.id !== id));
  }
}