
import React from "react";
import { useTasksContext } from "@/context/TasksContext";
import DraggableTask from "./DraggableTask";

interface TasksListProps {
  tasks: any[];
  emptyMessage: string;
  isDraggable?: boolean;
}

export const TasksList: React.FC<TasksListProps> = ({ 
  tasks, 
  emptyMessage,
  isDraggable = false
}) => {
  const { departments, handleStatusChange, refreshTasks } = useTasksContext();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <DraggableTask
          key={task.id}
          id={task.id}
          title={task.title}
          completed={task.status === "completed"}
          dueDate={task.due_date ? new Date(task.due_date) : undefined}
          priority={task.priority}
          project={task.project}
          department={task.department}
          department_id={task.department_id}
          description={task.description}
          shared_with={task.shared_with}
          onStatusChange={handleStatusChange}
          onTaskUpdated={refreshTasks}
          departments={departments}
          isDraggable={isDraggable}
        />
      ))}
    </div>
  );
};
