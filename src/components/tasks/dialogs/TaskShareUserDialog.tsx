
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
import { Label } from "@/components/ui/label";

interface TaskShareUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  setUserEmail: (value: string) => void;
  onShare: () => void;
  isLoading: boolean;
}

export const TaskShareUserDialog: React.FC<TaskShareUserDialogProps> = ({
  isOpen,
  onClose,
  userEmail,
  setUserEmail,
  onShare,
  isLoading
}) => {
  return (
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
};
