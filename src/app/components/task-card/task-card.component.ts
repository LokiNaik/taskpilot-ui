import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent implements OnInit {
  @Input() task!: Task;
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();

  expanded = false;

  // Edit fields
  editPriority = '';
  editDueDate = '';
  editDueTime = '';

  notes: any[] = [];
  newNote = '';
  showNotes = false;

  priorities: TaskPriority[] = ['critical', 'high', 'medium', 'low'];

  statuses = [
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'done', label: 'Done' },
    { value: 'deferred', label: 'Defer' },
  ];

  constructor(private taskService: TaskService) { }

  ngOnInit() {
    // Pre-fill edit fields with current values
    this.editPriority = this.task.priority;
    this.editDueDate = this.task.due_date || '';
    this.editDueTime = this.task.due_time || '';
    // this.loadNotes(); // ← add karo
  }

  toggleDone() {
    const newStatus: TaskStatus = this.task.status === 'done' ? 'todo' : 'done';
    this.taskService.updateTask(this.task.id, { status: newStatus }).subscribe(updated => {
      this.taskUpdated.emit(updated);
    });
  }

  setStatus(status: string) {
    this.taskService.updateTask(this.task.id, { status: status as TaskStatus }).subscribe(updated => {
      this.taskUpdated.emit(updated);
    });
  }

  saveEdits() {
    const updates: Partial<Task> = {
      priority: this.editPriority as TaskPriority,
      due_date: this.editDueDate || null,
      due_time: this.editDueTime || null,
    };

    this.taskService.updateTask(this.task.id, updates).subscribe(updated => {
      this.taskUpdated.emit(updated);
      this.expanded = false;
    });
  }

  delete() {
    if (confirm(`Delete "${this.task.title}"?`)) {
      this.taskService.deleteTask(this.task.id).subscribe(() => {
        this.taskDeleted.emit(this.task.id);
      });
    }
  }
  loadNotes() {
    this.taskService.getNotes(this.task.id).subscribe({
      next: notes => this.notes = notes,
      error: () => this.notes = []
    });
  }

  toggleNotes() {
    this.showNotes = !this.showNotes;
    if (this.showNotes) this.loadNotes(); // har baar fresh load
  }

  addNote() {
    if (!this.newNote.trim()) return;
    this.taskService.addNote(this.task.id, this.newNote).subscribe(note => {
      this.notes.unshift(note);
      this.newNote = '';
    });
  }

  deleteNote(noteId: string) {
    this.taskService.deleteNote(noteId).subscribe(() => {
      this.notes = this.notes.filter(n => n.id !== noteId);
    });
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
    const due = new Date(this.task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
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
    return new Date(this.task.due_date).toDateString() === new Date().toDateString();
  }
}