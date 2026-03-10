import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input()  task!: Task;
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();

  expanded = false;

  constructor(private taskService: TaskService) {}

  toggleDone() {
    const newStatus: TaskStatus = this.task.status === 'done' ? 'todo' : 'done';
    this.taskService.updateTask(this.task.id, { status: newStatus }).subscribe(updated => {
      this.taskUpdated.emit(updated);
    });
  }

  setStatus(status: TaskStatus) {
    this.taskService.updateTask(this.task.id, { status }).subscribe(updated => {
      this.taskUpdated.emit(updated);
    });
  }

  delete() {
    if (confirm(`Delete "${this.task.title}"?`)) {
      this.taskService.deleteTask(this.task.id).subscribe(() => {
        this.taskDeleted.emit(this.task.id);
      });
    }
  }

  get scoreColor(): string {
    const s = this.task.ai_priority_score ?? 0;
    if (s >= 80) return 'var(--red)';
    if (s >= 60) return 'var(--amber)';
    if (s >= 40) return 'var(--blue)';
    return 'var(--muted)';
  }

  get scoreWidth(): string {
    return `${this.task.ai_priority_score ?? 0}%`;
  }

  get isDone(): boolean {
    return this.task.status === 'done';
  }

  get dueDateLabel(): string {
    if (!this.task.due_date) return '';
    const due   = new Date(this.task.due_date);
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    if (diff < 0)  return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return `Due in ${diff}d`;
  }

  get isOverdue(): boolean {
    if (!this.task.due_date) return false;
    return new Date(this.task.due_date) < new Date() && this.task.status !== 'done';
  }

  get isDueToday(): boolean {
    if (!this.task.due_date) return false;
    const due   = new Date(this.task.due_date).toDateString();
    const today = new Date().toDateString();
    return due === today;
  }
}
