
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ListChecks, 
  FolderKanban, 
  Calendar, 
  Settings, 
  Users
} from "lucide-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  active,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active 
          ? "bg-team-blue-light text-team-blue font-medium" 
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 border-r bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-team-blue p-1">
            <Users size={20} className="text-white" />
          </div>
          <span className="text-xl font-semibold">TEAM</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            href="/"
            active={currentPath === "/"}
          />
          <SidebarItem
            icon={<FolderKanban size={20} />}
            label="Projects"
            href="/projects"
            active={currentPath.startsWith("/projects")}
          />
          <SidebarItem
            icon={<ListChecks size={20} />}
            label="Tasks"
            href="/tasks"
            active={currentPath.startsWith("/tasks")}
          />
          <SidebarItem
            icon={<Calendar size={20} />}
            label="Calendar"
            href="/calendar"
            active={currentPath.startsWith("/calendar")}
          />
        </nav>
        <Separator className="my-4" />
        <nav className="grid gap-1 px-2">
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            href="/settings"
            active={currentPath.startsWith("/settings")}
          />
        </nav>
      </div>
    </aside>
  );
};
