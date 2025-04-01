
import React, { useState } from "react";
import { MoreHorizontal, Share2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownActionsMenu } from "./menus/DropdownActionsMenu";
import { TaskEditDialog } from "./dialogs/TaskEditDialog";
import { TaskShareDialog } from "./dialogs/TaskShareDialog";
import { TaskDeleteDialog } from "./dialogs/TaskDeleteDialog";
import { TaskShareUserDialog } from "./dialogs/TaskShareUserDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TaskActionsProps {
  task: {
    id: string;
    title: string;
    description?: string;
    priority: string;
    department?: string;
    department_id?: string;
    due_date?: Date | null;
    shared_with?: string[];
    status?: string;
  };
  departments?: any[];
  onTaskUpdated?: () => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  departments = [],
  onTaskUpdated = () => {},
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareUserDialogOpen, setIsShareUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleShareClick = () => {
    setIsShareDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleShareUserClick = () => {
    setIsShareUserDialogOpen(true);
  };

  const handleTaskDelete = async () => {
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

      // Simplify the shared_with handling to avoid deep type instantiation
      const sharedWithIds: string[] = [];
      
      // Safely process the shared_with array from the database
      if (data && data.shared_with) {
        // Cast to any to avoid TypeScript's deep type analysis
        const sharedWith = data.shared_with as any[];
        
        // Filter out null values and convert all items to strings
        for (let i = 0; i < sharedWith.length; i++) {
          if (sharedWith[i] != null) {
            sharedWithIds.push(String(sharedWith[i]));
          }
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

  return (
    <>
      <DropdownActionsMenu
        triggerButton={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
        items={[
          {
            label: "Editar",
            icon: <Edit className="mr-2 h-4 w-4" />,
            onClick: handleEditClick,
          },
          {
            label: "Compartilhar",
            icon: <Share2 className="mr-2 h-4 w-4" />,
            onClick: handleShareUserClick,
          },
          {
            label: "Excluir",
            icon: <Trash2 className="mr-2 h-4 w-4" />,
            onClick: () => setIsDeleteDialogOpen(true),
            variant: "destructive",
          },
        ]}
      />

      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={task}
        departments={departments}
        onTaskUpdated={onTaskUpdated}
      />

      <TaskShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />

      <TaskDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleTaskDelete}
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
