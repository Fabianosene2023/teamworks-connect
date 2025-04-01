import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskEditDialog } from "./dialogs/TaskEditDialog";
import { TaskDeleteDialog } from "./dialogs/TaskDeleteDialog";
import { TaskShareDialog } from "./dialogs/TaskShareDialog"; 
import { TaskShareUserDialog } from "./dialogs/TaskShareUserDialog";
import { DropdownActionsMenu } from "./menus/DropdownActionsMenu";
import { Task } from "@/types/taskTypes";

interface TaskActionsProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    department_id?: string;
    department?: string;
    due_date?: Date | string;
    status: string;
    shared_with: string[];
  };
  departments: any[];
  onTaskUpdated: () => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ task, departments, onTaskUpdated }) => {
  // ... (outras declarações de estado e funções)

  const handleShareWithUser = async () => {
    try {
      setIsLoading(true);

      if (!userEmail) {
        toast({
          title: "Erro",
          description: "Por favor, informe um email",
          variant: "destructive",
        });
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (userError) {
        if (userError.code === "PGRST116") {
          toast({
            title: "Erro",
            description: "Usuário não encontrado",
            variant: "destructive",
          });
          return;
        }
        throw userError;
      }

      const { data, error: taskError } = await supabase
        .from("tasks")
        .select("shared_with")
        .eq("id", task.id)
        .single();

      if (taskError) throw taskError;

      // Simplificando a manipulação de shared_with
      let sharedWithIds: string[] = [];
      if (data && data.shared_with && Array.isArray(data.shared_with)) {
        sharedWithIds = data.shared_with.map(String); // Garante que todos os itens são strings
      }

      if (sharedWithIds.includes(userData.id)) {
        toast({
          title: "Aviso",
          description: "Tarefa já compartilhada com este usuário",
        });
        setIsShareUserDialogOpen(false);
        return;
      }

      sharedWithIds.push(userData.id);

      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          shared_with: sharedWithIds,
        })
        .eq("id", task.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso",
        description: `Tarefa compartilhada com ${userEmail}`,
      });

      onTaskUpdated();
      setIsShareUserDialogOpen(false);
      setUserEmail("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao compartilhar tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... (restante do componente)
};

export default TaskActions;
