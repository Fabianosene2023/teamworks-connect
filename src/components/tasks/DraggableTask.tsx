
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem, { TaskItemProps } from "@/components/tasks/TaskItem";

interface DraggableTaskProps extends TaskItemProps {
  id: string;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ id, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation"
    >
      <TaskItem id={id} {...props} />
    </div>
  );
};

export default DraggableTask;
