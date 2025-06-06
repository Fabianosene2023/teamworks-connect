
/// <reference types="vite/client" />

// Define global types for the project
declare interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  department_id?: string;
  department?: string;
  due_date?: string;
  status: string;
  position: number;
  project?: string;
  shared_with: string[];
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
