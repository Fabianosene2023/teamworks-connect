import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectCard from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface ProjectProps {
  id: string;
  title: string;
  description: string;
  status: "not-started" | "in-progress" | "completed" | "on-hold";
  dueDate?: string;
  department: string;
  members: Array<{ id: string; name: string; avatar?: string }>;
  color?: string;
}

const Projects: React.FC = () => {
  const { toast } = useToast();

  // State
  const [projects, setProjects] = useState<ProjectProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all-status");
  const [isNewProjectSheetOpen, setIsNewProjectSheetOpen] = useState(false);

  // Fetch projects from API on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const token = localStorage.getItem("authToken");
        const resp = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || ""}/api/projects`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        setProjects(resp.data);
      } catch (err: any) {
        console.error("Erro ao buscar projetos:", err);
        setError(err.response?.data?.message || err.message);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os projetos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [toast]);

  // Handlers
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    toast({
      title: "Filtro aplicado",
      description: `Departamento: ${value === "all" ? "Todos" : value}`,
    });
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    toast({
      title: "Filtro aplicado",
      description: `Status: ${value === "all-status" ? "Todos" : value}`,
    });
  };

  const handleNewProject = () => {
    setIsNewProjectSheetOpen(false);
    toast({
      title: "Sucesso",
      description: "Projeto criado com sucesso!",
    });
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    if (
      selectedDepartment !== "all" &&
      project.department.toLowerCase() !== selectedDepartment
    ) {
      return false;
    }
    if (selectedStatus !== "all-status" && project.status !== selectedStatus) {
      return false;
    }
    if (
      searchQuery &&
      !project.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Render
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track all your team projects
            </p>
          </div>

          {/* New Project Sheet */}
          <Sheet
            open={isNewProjectSheetOpen}
            onOpenChange={setIsNewProjectSheetOpen}
          >
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Project</SheetTitle>
              </SheetHeader>
              {/* ... form fields ... */}
              <div className="pt-4">
                <SheetClose asChild>
                  <Button onClick={handleNewProject}>Create Project</Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-status">All Status</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading & Error States */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            Loading projects...
          </div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-gray-500">No projects found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Projects;
