
import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Edit, MoreHorizontal, Share, Trash } from "lucide-react";

interface DropdownActionsMenuProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onDelete: () => void;
}

export const DropdownActionsMenu: React.FC<DropdownActionsMenuProps> = ({
  onEdit,
  onDuplicate,
  onShare,
  onDelete
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hover:bg-gray-100 p-1 rounded-md">
          <MoreHorizontal className="h-5 w-5 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-50 bg-white">
        <DropdownMenuLabel>Ações da Tarefa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShare}>
          <Share className="h-4 w-4 mr-2" />
          Compartilhar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
