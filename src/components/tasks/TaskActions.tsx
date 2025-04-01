
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskEditDialog } from "./dialogs/TaskEditDialog";
import { TaskDeleteDialog } from "./dialogs/TaskDeleteDialog";
import { TaskShareDialog } from "./dialogs/TaskShareDialog"; 
import { TaskShareUserDialog } from "./dialogs/TaskShareUserDialog";
import { DropdownActionsMenu } from "./menus/DropdownActionsMenu";
import { Task } from "@/types/taskTypes";
import { MoreHorizontal } from "lucide-react";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isShareUserDialogOpen, setIsShareUserDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [shareType, setShareType] = useState<"user" | "department">("user");
  const [shareEmail, setShareEmail] = useState("");
  const [shareDepartment, setShareDepartment] = useState("");
  
  // Initialize editedTask with the task data
  const [editedTask, setEditedTask] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "medium",
    department_id: task.department_id || "",
    due_date: task.due_date ? 
      (typeof task.due_date === 'string' ? task.due_date : task.due_date.toISOString().split('T')[0]) 
      : ""
  });

  const handleEdit = () => {
    // Re-initialize editedTask to ensure it has the latest task data
    setEditedTask({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      department_id: task.department_id || "",
      due_date: task.due_date ? 
        (typeof task.due_date === 'string' ? task.due_date : task.due_date.toISOString().split('T')[0]) 
        : ""
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editedTask.title,
          description: editedTask.description,
          priority: editedTask.priority,
          department_id: editedTask.department_id,
          due_date: editedTask.due_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso",
      });

      onTaskUpdated();
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa excluída com sucesso",
      });

      onTaskUpdated();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      if (data && data.shared_with) {
        // Use a basic approach to avoid TypeScript deep instantiation
        const currentSharedWith = data.shared_with as any[];
        for (let i = 0; i < currentSharedWith.length; i++) {
          sharedWithIds.push(String(currentSharedWith[i]));
        }
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

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: `${task.title} (cópia)`,
          description: task.description,
          priority: task.priority,
          department_id: task.department_id,
          due_date: task.due_date,
          status: task.status,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa duplicada com sucesso",
      });

      onTaskUpdated();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao duplicar tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownActionsMenu
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onShare={() => setIsShareDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editedTask={editedTask}
        setEditedTask={setEditedTask}
        onSave={handleSaveEdit}
        departments={departments}
        isLoading={isLoading}
      />

      <TaskDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
        isLoading={isLoading}
        taskTitle={task.title}
      />

      <TaskShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        shareType={shareType}
        setShareType={setShareType}
        shareEmail={shareEmail}
        setShareEmail={setShareEmail}
        shareDepartment={shareDepartment}
        setShareDepartment={setShareDepartment}
        onShare={() => {}}
        departments={departments}
        isLoading={isLoading}
      />

      <TaskShareUserDialog
        isOpen={isShareUserDialogOpen}
        onClose={() => setIsShareUserDialogOpen(false)}
        userEmail={userEmail}
        setUserEmail={setUserEmail}
        onShare={handleShareWithUser}
        isLoading={isLoading}
      />
    </>
  );
};

export default TaskActions;
