
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

interface TaskShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareType: "user" | "email" | "whatsapp";
  setShareType: (value: "user" | "email" | "whatsapp") => void;
  shareEmail: string;
  setShareEmail: (value: string) => void;
  shareMessage: string;
  setShareMessage: (value: string) => void;
  onShare: () => void;
  departments: any[];
  isLoading: boolean;
}

export const TaskShareDialog: React.FC<TaskShareDialogProps> = ({
  isOpen,
  onClose,
  shareType,
  setShareType,
  shareEmail,
  setShareEmail,
  shareMessage,
  setShareMessage,
  onShare,
  departments,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onShare} disabled={isLoading}>
            {isLoading ? "Compartilhando..." : "Compartilhar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
