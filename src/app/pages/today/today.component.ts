import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { NlInputComponent } from '../../components/nl-input/nl-input.component';
import { TaskCardComponent } from '../../components/task-card/task-card.component';

type FilterOption = 'all' | TaskStatus;

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, NlInputComponent, TaskCardComponent],
  templateUrl: './today.component.html',
  styleUrl: './today.component.scss'
})
export class TodayComponent implements OnInit {

  tasks      = signal<Task[]>([]);
  loading    = signal(true);
  filter     = signal<FilterOption>('all');
  reprioritizing = signal(false);

  readonly filters: { value: FilterOption; label: string }[] = [
    { value: 'all',         label: 'All' },
    { value: 'todo',        label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked',     label: 'Blocked' },
    { value: 'done',        label: 'Done' },
  ];

  readonly today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  constructor(
    private taskService: TaskService,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Wait for user to load then fetch tasks
    setTimeout(() => this.loadTasks(), 800);
  }

  loadTasks() {
    const userId = this.userService.getUserId();
    if (!userId) { this.loading.set(false); return; }

    const today = new Date().toISOString().split('T')[0];
    this.loading.set(true);

    this.taskService.getTasks(userId, today).subscribe({
      next:  ({ tasks }) => { this.tasks.set(tasks); this.loading.set(false); },
      error: ()          => { this.loading.set(false); }
    });
  }

  get filteredTasks(): Task[] {
    const f = this.filter();
    return f === 'all' ? this.tasks() : this.tasks().filter(t => t.status === f);
  }

  get stats() {
    const all = this.tasks();
    return {
      total:       all.length,
      done:        all.filter(t => t.status === 'done').length,
      inProgress:  all.filter(t => t.status === 'in_progress').length,
      critical:    all.filter(t => t.priority === 'critical').length,
    };
  }

  onTaskAdded(task: Task) {
    this.tasks.update(list => [task, ...list]);
  }

  onTaskUpdated(updated: Task) {
    this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
  }

  onTaskDeleted(id: string) {
    this.tasks.update(list => list.filter(t => t.id !== id));
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
