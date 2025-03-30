
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  project?: string;
  department?: string;
  onStatusChange?: (id: string, completed: boolean) => void;
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
  onStatusChange,
}) => {
  const handleCheckboxChange = (checked: boolean) => {
    if (onStatusChange) {
      onStatusChange(id, checked);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-md mb-2 bg-white hover:shadow-sm transition-shadow">
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
          <div className="flex items-center gap-2 mt-1">
            {project && <Badge variant="outline" className="text-xs">{project}</Badge>}
            {department && <Badge variant="secondary" className="text-xs">{department}</Badge>}
            <Badge className={`text-xs ${getPriorityColor(priority)}`}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-gray-100 p-1 rounded-md">
              <MoreHorizontal className="h-5 w-5 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TaskItem;
