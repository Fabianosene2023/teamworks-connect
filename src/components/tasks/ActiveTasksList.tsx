
import React from "react";
import { useTasksContext } from "@/context/TasksContext";
import { TasksList } from "./TasksList";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export const ActiveTasksList: React.FC = () => {
  const { activeTasks, handleDragEnd } = useTasksContext();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  const handleDragEndEvent = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    handleDragEnd(active.id.toString(), over.id.toString());
  };
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEndEvent}
    >
      <SortableContext 
        items={activeTasks.map((task) => task.id)} 
        strategy={verticalListSortingStrategy}
      >
        <TasksList 
          tasks={activeTasks} 
          emptyMessage="Nenhuma tarefa ativa. Adicione uma nova tarefa!"
          isDraggable={true}
        />
      </SortableContext>
    </DndContext>
  );
};
