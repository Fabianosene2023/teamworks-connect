
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "@/components/tasks/TaskItem";

interface DraggableTaskProps {
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
  onStatusChange?: (id: string, completed: boolean) => void;
  onTaskUpdated?: () => void;
  departments?: any[];
  isDraggable?: boolean;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ 
  id, 
  isDraggable = false,
  ...props 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = isDraggable ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  } : {};

  return (
    <div
      ref={isDraggable ? setNodeRef : undefined}
      style={style}
      {...(isDraggable ? attributes : {})}
      {...(isDraggable ? listeners : {})}
      className={isDraggable ? "touch-manipulation" : ""}
    >
      <TaskItem id={id} {...props} />
    </div>
  );
};

export default DraggableTask;
