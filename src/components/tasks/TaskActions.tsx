
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Trash, Edit, Share, UserPlus } from "lucide-react";

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
    shared_with?: string[];
  };
  departments: any[];
  onTaskUpdated: () => void;
}

// Refactored into separate components for better organization
const ShareEmailDialog = ({
  isOpen, 
  onClose, 
  shareEmail, 
  setShareEmail, 
  shareMessage, 
  setShareMessage, 
  onShare
}: {
  isOpen: boolean;
  onClose: () => void;
  shareEmail: string;
  setShareEmail: (value: string) => void;
  shareMessage: string;
  setShareMessage: (value: string) => void;
  onShare: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Compartilhar por Email</DialogTitle>
        <DialogDescription>
          Informe o email para compartilhar esta tarefa
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="usuario@exemplo.com"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Mensagem (opcional)</Label>
          <Textarea
            id="message"
            placeholder="Adicione uma mensagem..."
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onShare}>
          Compartilhar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const ShareUserDialog = ({
  isOpen,
  onClose,
  userEmail,
  setUserEmail,
  onShare,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
  onShare: () => void;
  isLoading: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Compartilhar com Usuário</DialogTitle>
        <DialogDescription>
          Informe o email do usuário para compartilhar esta tarefa
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="user-email">Email do Usuário</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="usuario@exemplo.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onShare} disabled={isLoading || !userEmail}>
          {isLoading ? "Compartilhando..." : "Compartilhar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const EditTaskDialog = ({
  isOpen,
  onClose,
  editedTask,
  setEditedTask,
  onSave,
  departments,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  editedTask: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    department_id: string;
    due_date: string;
  };
  setEditedTask: (value: any) => void;
  onSave: () => void;
  departments: any[];
  isLoading: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Tarefa</DialogTitle>
        <DialogDescription>
          Atualize os detalhes da tarefa
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={editedTask.description}
            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={editedTask.priority}
            onValueChange={(value) => setEditedTask({...editedTask, priority: value as "low" | "medium" | "high"})}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Departamento</Label>
          <Select
            value={editedTask.department_id}
            onValueChange={(value) => setEditedTask({...editedTask, department_id: value})}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Selecione o departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Data de vencimento</Label>
          <Input
            id="due_date"
            type="date"
            value={editedTask.due_date}
            onChange={(e) => setEditedTask({...editedTask, due_date: e.target.value})}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onSave} disabled={isLoading || !editedTask.title}>
          {isLoading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const DeleteTaskDialog = ({
  isOpen,
  onClose,
  onDelete,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onDelete} 
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          {isLoading ? "Excluindo..." : "Excluir"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

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
      
      // Update the task's shared_with array
      const { data: currentTask } = await supabase
        .from("tasks")
        .select("shared_with")
        .eq("id", task.id)
        .single();
        
      const currentSharedWith = currentTask?.shared_with || [];
      
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="hover:bg-gray-100 p-1 rounded-md">
            <MoreHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações da Tarefa</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
            <Share className="h-4 w-4 mr-2" />
            Compartilhar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Dialogs */}
      <DeleteTaskDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      
      <EditTaskDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        editedTask={editedTask}
        setEditedTask={setEditedTask}
        onSave={handleEdit}
        departments={departments}
        isLoading={isLoading}
      />
      
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Tarefa</DialogTitle>
            <DialogDescription>
              Escolha como deseja compartilhar esta tarefa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share-type">Método de compartilhamento</Label>
              <Select
                value={shareType}
                onValueChange={(value) => setShareType(value as "user" | "email" | "whatsapp")}
              >
                <SelectTrigger id="share-type">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário do sistema</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {shareType === "email" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@exemplo.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem (opcional)</Label>
              <Textarea
                id="message"
                placeholder="Adicione uma mensagem..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleShare}>
              Compartilhar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ShareUserDialog 
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
