import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-nl-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nl-input.component.html',
  styleUrl: './nl-input.component.scss'
})
export class NlInputComponent {
  @Output() taskAdded = new EventEmitter<Task>();

  text    = '';
  loading = signal(false);
  error   = signal('');

  constructor(
    private taskService: TaskService,
    private userService: UserService
  ) {}

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  submit() {
    const trimmed = this.text.trim();
    if (!trimmed || this.loading()) return;

    const userId = this.userService.getUserId();
    if (!userId) {
      this.error.set('User not loaded yet. Please wait a moment.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.taskService.addFromNaturalLanguage(trimmed).subscribe({
  next: (task: any) => {
        this.taskAdded.emit(task);
        this.text = '';
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to add task. Is the backend running?');
        this.loading.set(false);
      }
    });
  }
}
