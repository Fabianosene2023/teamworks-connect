import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaskEditDialog } from "./dialogs/TaskEditDialog";
import { TaskDeleteDialog } from "./dialogs/TaskDeleteDialog";
import { TaskShareDialog } from "./dialogs/TaskShareDialog"; 
import { TaskShareUserDialog } from "./dialogs/TaskShareUserDialog";
import { DropdownActionsMenu } from "./menus/DropdownActionsMenu";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isShareUserDialogOpen, setIsShareUserDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Share form state
  const [shareEmail, setShareEmail] = useState("");
  const [shareType, setShareType] = useState<"user" | "email" | "whatsapp">("email");
  const [shareMessage, setShareMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  
  // Edit form state
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    department_id: task.department_id || "",
    due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
  });
  
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
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir tarefa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      
      // Get the task data first
      const { data: taskData, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (taskData) {
        // Create a duplicate without the id
        const { id, created_at, updated_at, ...taskToClone } = taskData;
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        // Update the title to indicate it's a copy
        taskToClone.title = `${taskToClone.title} (Cópia)`;
        
        // Ensure correct ownership
        taskToClone.created_by = user.id;
        
        // Ensure shared_with is an array
        const sharedWith: string[] = Array.isArray(taskToClone.shared_with) 
          ? taskToClone.shared_with 
          : [];
          
        taskToClone.shared_with = sharedWith;
        
        // Insert the new task
        const { error: insertError } = await supabase
          .from("tasks")
          .insert(taskToClone);
          
        if (insertError) throw insertError;
        
        toast({
          title: "Sucesso",
          description: "Tarefa duplicada com sucesso",
        });
        
        onTaskUpdated();
      }
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
  
  const handleEdit = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("tasks")
        .update({
          title: editedTask.title,
          description: editedTask.description,
          priority: editedTask.priority,
          department_id: editedTask.department_id,
          due_date: editedTask.due_date || null,
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

  const handleShareWithEmail = () => {
    if (!shareEmail) {
      toast({
        title: "Erro",
        description: "Por favor, informe um email",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, you'd send an email here
    // For now, let's just simulate it
    toast({
      title: "Compartilhado",
      description: `Tarefa compartilhada com ${shareEmail}`,
    });
    
    setIsShareDialogOpen(false);
    setShareEmail("");
    setShareMessage("");
  };
  
  const handleShareWithWhatsApp = () => {
    // Format task details for WhatsApp
    const taskDetails = `
*${task.title}*
Prioridade: ${task.priority}
${task.description ? `Descrição: ${task.description}` : ""}
${task.department ? `Departamento: ${task.department}` : ""}
${task.due_date ? `Data de vencimento: ${new Date(task.due_date).toLocaleDateString()}` : ""}
${shareMessage ? `\nMensagem: ${shareMessage}` : ""}
    `.trim();
    
    // Encode the message for a URL
    const encodedMessage = encodeURIComponent(taskDetails);
    
    // Open WhatsApp with the pre-filled message
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    
    setIsShareDialogOpen(false);
    setShareMessage("");
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
      
      // Get user by email
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
      
      // Get the current task
      const { data: currentTask, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", task.id)
        .single();
        
      if (taskError) throw taskError;
      
      // Make sure shared_with is defined as an array
      const sharedWithRaw = currentTask?.shared_with;
      const currentSharedWith: string[] = Array.isArray(sharedWithRaw) ? sharedWithRaw : [];
      
      // Check if already shared
      if (currentSharedWith.includes(userData.id)) {
        toast({
          title: "Aviso",
          description: "Tarefa já compartilhada com este usuário",
        });
        setIsShareUserDialogOpen(false);
        return;
      }
      
      // Add to shared_with array
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          shared_with: [...currentSharedWith, userData.id],
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
  
  const handleShare = () => {
    if (shareType === "user") {
      setIsShareDialogOpen(false);
      setIsShareUserDialogOpen(true);
    } else if (shareType === "email") {
      handleShareWithEmail();
    } else if (shareType === "whatsapp") {
      handleShareWithWhatsApp();
    }
  };
  
  return (
    <>
      <DropdownActionsMenu 
        onEdit={() => setIsEditDialogOpen(true)}
        onDuplicate={handleDuplicate}
        onShare={() => setIsShareDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />
      
      {/* Dialogs */}
      <TaskDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      
      <TaskEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editedTask={editedTask}
        setEditedTask={setEditedTask}
        onSave={handleEdit}
        departments={departments}
        isLoading={isLoading}
      />
      
      <TaskShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        shareType={shareType}
        setShareType={setShareType}
        shareEmail={shareEmail}
        setShareEmail={setShareEmail}
        shareMessage={shareMessage}
        setShareMessage={setShareMessage}
        onShare={handleShare}
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
