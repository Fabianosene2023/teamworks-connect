
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
import { MoreHorizontal, Copy, Trash, Edit, Share } from "lucide-react";

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
  };
  departments: any[];
  onTaskUpdated: () => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ 
  task, 
  departments,
  onTaskUpdated 
}) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit form state
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    department_id: task.department_id || "",
    due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "",
  });
  
  // Share form state
  const [shareEmail, setShareEmail] = useState("");
  const [shareType, setShareType] = useState<"email" | "whatsapp">("email");
  const [shareMessage, setShareMessage] = useState("");
  
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
        
        // Update the title to indicate it's a copy
        taskToClone.title = `${taskToClone.title} (Cópia)`;
        
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
  
  const handleShare = () => {
    if (shareType === "email") {
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
    } else if (shareType === "whatsapp") {
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
    }
    
    setIsShareDialogOpen(false);
    setShareEmail("");
    setShareMessage("");
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
              onClick={handleDelete} 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading || !editedTask.title}>
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Task Dialog */}
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
                onValueChange={(value) => setShareType(value as "email" | "whatsapp")}
              >
                <SelectTrigger id="share-type">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
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
    </>
  );
};

export default TaskActions;
