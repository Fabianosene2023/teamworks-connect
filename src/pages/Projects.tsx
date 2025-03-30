
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectCard from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";

const Projects = () => {
  // Mock data for demonstration
  const projects = [
    {
      id: "1",
      title: "Marketing Campaign",
      description: "Q4 product launch marketing strategy and execution plan",
      status: "in-progress" as const,
      dueDate: "Oct 30, 2023",
      department: "Marketing",
      members: [
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Smith" },
        { id: "3", name: "Robert Johnson" },
      ],
    },
    {
      id: "2",
      title: "Website Redesign",
      description: "Redesign company website with new branding and improved UX",
      status: "not-started" as const,
      dueDate: "Nov 15, 2023",
      department: "Design",
      members: [
        { id: "4", name: "Alice Brown" },
        { id: "5", name: "David Wilson" },
      ],
      color: "bg-purple-100 border-l-purple-500",
    },
    {
      id: "3",
      title: "Annual Financial Report",
      description: "Prepare and finalize annual financial reports for stakeholders",
      status: "on-hold" as const,
      dueDate: "Dec 5, 2023",
      department: "Finance",
      members: [
        { id: "6", name: "Michael Taylor" },
        { id: "7", name: "Emily Davis" },
        { id: "8", name: "Thomas White" },
        { id: "9", name: "Sarah Miller" },
      ],
      color: "bg-yellow-100 border-l-yellow-500",
    },
    {
      id: "4",
      title: "Product Development",
      description: "Develop new product features based on customer feedback",
      status: "in-progress" as const,
      dueDate: "Nov 28, 2023",
      department: "Engineering",
      members: [
        { id: "10", name: "James Wilson" },
        { id: "11", name: "Patricia Moore" },
      ],
      color: "bg-green-100 border-l-green-500",
    },
    {
      id: "5",
      title: "Employee Training Program",
      description: "Design and implement new onboarding training materials",
      status: "completed" as const,
      dueDate: "Oct 10, 2023",
      department: "HR",
      members: [
        { id: "12", name: "Elizabeth Brown" },
        { id: "13", name: "Richard Taylor" },
      ],
      color: "bg-blue-100 border-l-blue-500",
    },
    {
      id: "6",
      title: "Inventory Management System",
      description: "Implement new inventory tracking and management solution",
      status: "not-started" as const,
      dueDate: "Dec 15, 2023",
      department: "Operations",
      members: [
        { id: "14", name: "Charles Davis" },
        { id: "15", name: "Susan Wilson" },
      ],
      color: "bg-indigo-100 border-l-indigo-500",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage and track all your team projects
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8"
            />
          </div>
          <Select defaultValue="all">
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
          <Select defaultValue="all-status">
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Projects;
