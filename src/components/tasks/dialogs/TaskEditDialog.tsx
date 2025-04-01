
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskEditDialogProps {
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
}

export const TaskEditDialog: React.FC<TaskEditDialogProps> = ({
  isOpen,
  onClose,
  editedTask,
  setEditedTask,
  onSave,
  departments,
  isLoading
}) => {
  // Check if editedTask is undefined and provide default values
  const safeEditedTask = editedTask || {
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    department_id: "",
    due_date: ""
  };

  return (
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
              value={safeEditedTask.title}
              onChange={(e) => setEditedTask({...safeEditedTask, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={safeEditedTask.description}
              onChange={(e) => setEditedTask({...safeEditedTask, description: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={safeEditedTask.priority}
              onValueChange={(value) => setEditedTask({...safeEditedTask, priority: value as "low" | "medium" | "high"})}
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
              value={safeEditedTask.department_id}
              onValueChange={(value) => setEditedTask({...safeEditedTask, department_id: value})}
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
              value={safeEditedTask.due_date}
              onChange={(e) => setEditedTask({...safeEditedTask, due_date: e.target.value})}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isLoading || !safeEditedTask.title}>
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
