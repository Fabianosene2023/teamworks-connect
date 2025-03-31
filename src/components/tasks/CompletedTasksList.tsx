
import React from "react";
import { useTasksContext } from "@/context/TasksContext";
import { TasksList } from "./TasksList";

export const CompletedTasksList: React.FC = () => {
  const { completedTasks } = useTasksContext();
  
  return (
    <TasksList 
      tasks={completedTasks} 
      emptyMessage="Nenhuma tarefa concluída."
    />
  );
};
