
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ListChecks, 
  FolderKanban, 
  Calendar, 
  Settings,
  Users,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { isAdmin } from "@/lib/departments";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator
} from "@/components/ui/sidebar";

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
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={label}>
        <Link to={href}>
          {icon}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        setIsAdminUser(isAdmin(user.email));
      }
    };

    getUserEmail();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader>
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-team-blue p-1">
              <Users size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold">TEAM</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
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
        </SidebarMenu>
        
        <SidebarSeparator />
        
        <SidebarMenu>
          {isAdminUser && (
            <SidebarItem
              icon={<ShieldCheck size={20} />}
              label="Admin"
              href="/admin"
              active={currentPath.startsWith("/admin")}
            />
          )}
          <SidebarItem
            icon={<Settings size={20} />}
            label="Settings"
            href="/settings"
            active={currentPath.startsWith("/settings")}
          />
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-3 py-2">
          <SidebarMenuButton onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};
