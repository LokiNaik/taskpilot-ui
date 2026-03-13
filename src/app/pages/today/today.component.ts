import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { NlInputComponent } from '../../components/nl-input/nl-input.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { AuthService } from '../../services/auth.service';

type FilterOption = 'all' | TaskStatus;

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, NlInputComponent, TaskCardComponent],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent implements OnInit {

  tasks = signal<Task[]>([]);
  loading = signal(true);
  reprioritizing = signal(false);
  activeFilter = signal<FilterOption>('all');

  readonly filters: { value: FilterOption; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'done', label: 'Done' },
  ];

  readonly today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  filteredTasks = computed(() => {
    const f = this.activeFilter();
    const t = this.tasks() || [];
    return f === 'all' ? t : t.filter(task => task.status === f);
  });

  get stats() {
    const t = this.tasks() || [];
    return {
      total: t.length,
      done: t.filter(x => x.status === 'done').length,
      inProgress: t.filter(x => x.status === 'in_progress').length,
      blocked: t.filter(x => x.status === 'blocked').length,
      critical: t.filter(x => x.priority === 'critical').length,
    };
  }

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    public auth: AuthService

  ) { }

  ngOnInit() {
    this.loadTasks();
  }
  loadTasks() {
    const userId = this.auth.getUserId();
    console.log('userId:', userId);
    if (!userId) { this.loading.set(false); return; }

    const today = new Date().toISOString().split('T')[0];
    this.loading.set(true);

    this.taskService.getTasks(userId, today).subscribe({
      next: (response: any) => {
        console.log('API response:', response);
        const tasks = Array.isArray(response) ? response : (response?.tasks || []);
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error:', err);
        this.tasks.set([]);
        this.loading.set(false);
      }
    });
  }

  setFilter(f: FilterOption) {
    this.activeFilter.set(f);
  }

  onTaskAdded(task: Task) {
    this.tasks.update(list => [task, ...(list || [])]);
  }

  onTaskUpdated(updated: Task) {
    this.tasks.update(list => (list || []).map(t => t.id === updated.id ? updated : t));
  }

  onTaskDeleted(id: string) {
    this.tasks.update(list => (list || []).filter(t => t.id !== id));
  }

  reprioritize() {
    const userId = this.userService.getUserId();
    if (!userId) return;
    this.reprioritizing.set(true);
    this.taskService.reprioritize(userId).subscribe({
      next: () => { this.reprioritizing.set(false); this.loadTasks(); },
      error: () => { this.reprioritizing.set(false); }
    });
  }
}