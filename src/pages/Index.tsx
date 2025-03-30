
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import ProjectCard from "@/components/projects/ProjectCard";
import TaskItem from "@/components/tasks/TaskItem";
import CalendarOverview from "@/components/calendar/CalendarOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderKanban, ListChecks, Users, Clock } from "lucide-react";

const Index = () => {
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
  ];

  const tasks = [
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
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to your team workspace!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Projects"
            value="12"
            icon={<FolderKanban size={18} />}
            description="+2 added this month"
          />
          <StatsCard
            title="Active Tasks"
            value="36"
            icon={<ListChecks size={18} />}
            description="8 due this week"
            colorClass="bg-green-100 text-green-700"
          />
          <StatsCard
            title="Team Members"
            value="24"
            icon={<Users size={18} />}
            description="Across 6 departments"
            colorClass="bg-purple-100 text-purple-700"
          />
          <StatsCard
            title="Upcoming Deadlines"
            value="7"
            icon={<Clock size={18} />}
            description="Next: Oct 22, 2023"
            colorClass="bg-yellow-100 text-yellow-700"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Projects Overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {projects.map((project) => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="my">My Tasks</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} {...task} />
                  ))}
                </TabsContent>
                <TabsContent value="my">
                  <p className="text-muted-foreground py-4">
                    Log in to view your assigned tasks.
                  </p>
                </TabsContent>
                <TabsContent value="upcoming">
                  <p className="text-muted-foreground py-4">
                    Tasks with upcoming deadlines will appear here.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div>
            <CalendarOverview />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
