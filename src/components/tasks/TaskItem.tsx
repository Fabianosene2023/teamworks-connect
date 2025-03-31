
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, Users } from "lucide-react";
import { format } from "date-fns";
import TaskActions from "./TaskActions";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  project?: string;
  department?: string;
  department_id?: string;
  description?: string;
  shared_with?: string[];
  status?: string;
  onStatusChange?: (id: string, completed: boolean) => void;
  onTaskUpdated?: () => void;
  departments?: any[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "high":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  dueDate,
  priority,
  project,
  department,
  department_id,
  description,
  shared_with = [],
  status = "active",
  onStatusChange,
  onTaskUpdated = () => {},
  departments = [],
}) => {
  const handleCheckboxChange = (checked: boolean) => {
    if (onStatusChange) {
      onStatusChange(id, checked);
    }
  };

  const task = {
    id,
    title,
    description,
    priority,
    department,
    department_id,
    due_date: dueDate,
    shared_with,
    status: completed ? "completed" : "active",
  };

  const isShared = shared_with && shared_with.length > 0;

  return (
    <div className="flex items-center justify-between p-3 border rounded-md mb-2 bg-white hover:shadow-sm transition-shadow cursor-move">
      <div className="flex items-center gap-3">
        <Checkbox 
          checked={completed} 
          onCheckedChange={handleCheckboxChange}
          id={`task-${id}`}
        />
        <div>
          <label 
            htmlFor={`task-${id}`}
            className={`font-medium ${completed ? 'line-through text-gray-400' : ''}`}
          >
            {title}
          </label>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {project && <Badge variant="outline" className="text-xs">{project}</Badge>}
            {department && <Badge variant="secondary" className="text-xs">{department}</Badge>}
            <Badge className={`text-xs ${getPriorityColor(priority)}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
            {isShared && (
              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200 flex items-center gap-1">
                <Users size={12} />
                Compartilhada
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <CalendarClock size={14} />
            <span>{format(dueDate, "MMM d, yyyy")}</span>
          </div>
        )}
        <TaskActions 
          task={task}
          departments={departments}
          onTaskUpdated={onTaskUpdated}
        />
      </div>
    </div>
  );
};

export default TaskItem;
