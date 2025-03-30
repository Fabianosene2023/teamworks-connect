
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TaskItem from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";

const Tasks = () => {
  // Mock data for demonstration
  const initialTasks = [
    {
      id: "1",
      title: "Design social media graphics",
      completed: false,
      dueDate: new Date(2023, 9, 22),
      priority: "high" as const,
      project: "Marketing Campaign",
      department: "Marketing",
    },
    {
      id: "2",
      title: "Write blog post content",
      completed: true,
      dueDate: new Date(2023, 9, 18),
      priority: "medium" as const,
      project: "Marketing Campaign",
      department: "Marketing",
    },
    {
      id: "3",
      title: "Research competitors",
      completed: false,
      dueDate: new Date(2023, 9, 25),
      priority: "low" as const,
      project: "Website Redesign",
      department: "Design",
    },
    {
      id: "4",
      title: "Prepare monthly expense reports",
      completed: false,
      dueDate: new Date(2023, 9, 30),
      priority: "medium" as const,
      project: "Annual Financial Report",
      department: "Finance",
    },
    {
      id: "5",
      title: "Update product documentation",
      completed: false,
      dueDate: new Date(2023, 10, 5),
      priority: "medium" as const,
      project: "Product Development",
      department: "Engineering",
    },
    {
      id: "6",
      title: "Create onboarding slides",
      completed: true,
      dueDate: new Date(2023, 9, 12),
      priority: "high" as const,
      project: "Employee Training Program",
      department: "HR",
    },
    {
      id: "7",
      title: "Review vendor proposals",
      completed: false,
      dueDate: new Date(2023, 10, 10),
      priority: "high" as const,
      project: "Inventory Management System",
      department: "Operations",
    },
    {
      id: "8",
      title: "Schedule team meeting",
      completed: true,
      dueDate: new Date(2023, 9, 15),
      priority: "low" as const,
      project: "Marketing Campaign",
      department: "Marketing",
    },
  ];

  const [tasks, setTasks] = useState(initialTasks);

  const handleTaskStatusChange = (id: string, completed: boolean) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed } : task
      )
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage and track all your tasks
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-8"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="marketing">Marketing Campaign</SelectItem>
              <SelectItem value="website">Website Redesign</SelectItem>
              <SelectItem value="finance">Annual Financial Report</SelectItem>
              <SelectItem value="product">Product Development</SelectItem>
              <SelectItem value="training">Employee Training Program</SelectItem>
              <SelectItem value="inventory">Inventory Management System</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-priority">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-priority">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Card className="p-4">
              {tasks.map((task) => (
                <TaskItem 
                  key={task.id} 
                  {...task} 
                  onStatusChange={handleTaskStatusChange}
                />
              ))}
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card className="p-4">
              {tasks
                .filter((task) => !task.completed)
                .map((task) => (
                  <TaskItem 
                    key={task.id} 
                    {...task} 
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card className="p-4">
              {tasks
                .filter((task) => task.completed)
                .map((task) => (
                  <TaskItem 
                    key={task.id} 
                    {...task} 
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Tasks;
