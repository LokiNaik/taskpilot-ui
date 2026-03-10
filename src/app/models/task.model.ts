export type TaskStatus   = 'todo' | 'in_progress' | 'blocked' | 'done' | 'deferred';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Task {
  id:                string;
  user_id:           string;
  title:             string;
  description:       string | null;
  raw_input:         string | null;
  status:            TaskStatus;
  priority:          TaskPriority;
  source:            string;
  due_date:          string | null;   // YYYY-MM-DD
  due_time:          string | null;   // HH:MM
  reminder_at:       string | null;
  reminder_sent:     boolean;
  tags:              string[];
  ai_priority_score: number | null;
  ai_notes:          string | null;
  log_date:          string;
  created_at:        string;
  updated_at:        string;
}

export interface DailyDigest {
  digest_date:  string;
  summary_text: string;
  stats: {
    total:    number;
    done:     number;
    pending:  number;
    critical: number;
  };
  top_tasks: string[];
  generated_at: string;
}

export interface DigestResponse {
  digest: {
    summary:      string;
    summary_text?: string;
    focus_tasks:  string[];
    wins:         string[];
    warnings:     string[];
  };
  stats: {
    total:    number;
    done:     number;
    pending:  number;
    critical: number;
  };
}
