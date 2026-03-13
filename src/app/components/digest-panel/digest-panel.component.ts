import { Component, Input, Output, EventEmitter, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { DigestResponse } from '../../models/task.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-digest-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './digest-panel.component.html',
  styleUrl: './digest-panel.component.scss'
})
export class DigestPanelComponent implements OnChanges {
  @Input()  open = false;
  @Output() close = new EventEmitter<void>();

  digest  = signal<DigestResponse | null>(null);
  loading = signal(false);

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnChanges() {
    if (this.open && !this.digest()) {
      this.loadDigest();
    }
  }

loadDigest() {
  const userId = this.auth.getUserId(); // ← auth se lo
  if (!userId) return;

  this.loading.set(true);
  this.taskService.getDigest(userId).subscribe({
    next: (data: any) => {
      if (data.summary_text) {
        this.digest.set({
          digest: {
            summary:     data.summary_text,
            focus_tasks: data.top_tasks || [],
            wins:        [],
            warnings:    [],
          },
          stats: data.stats || { total: 0, done: 0, pending: 0, critical: 0 }
        });
      } else {
        this.digest.set(data);
      }
      this.loading.set(false);
    },
    error: () => { this.loading.set(false); }
  });
}

  regenerate() {
    this.digest.set(null);
    const userId = this.auth.getUserId(); // ← yahan bhi
  if (!userId) return;
    this.loading.set(true);
    this.taskService.generateDigest(userId).subscribe({
      next:  (data) => { this.digest.set(data); this.loading.set(false); },
      error: ()     => { this.loading.set(false); }
    });
  }
}
