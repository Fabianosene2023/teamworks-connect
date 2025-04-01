
export interface Department {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  department_id: string;
  created_by: string;
  assigned_to: string;
  status: string;
  position: number;
  due_date: string | null;
  shared_with: string[];
  department?: string;
}
