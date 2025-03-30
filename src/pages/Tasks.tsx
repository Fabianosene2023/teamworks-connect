
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
import DraggableTask from "@/components/tasks/DraggableTask";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all-priority");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const { toast } = useToast();

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            departments(name),
            profiles!assigned_to(first_name, last_name)
          `)
          .order('position', { ascending: true });

        if (error) throw error;
        
        // Transform data to match the component props
        const transformedTasks = data?.map(task => ({
          id: task.id,
          title: task.title,
          completed: task.status === 'completed',
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          priority: task.priority as 'low' | 'medium' | 'high',
          project: task.project_id,
          department: task.departments?.name,
          assignedTo: task.profiles ? `${task.profiles.first_name} ${task.profiles.last_name}` : undefined
        })) || [];
        
        setTasks(transformedTasks);
        setFilteredTasks(transformedTasks);
        setLoading(false);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    // Fetch projects for filter
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title');
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchTasks();
    fetchProjects();

    // Set up real-time subscription for tasks
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filter tasks based on search term, project, and priority
  useEffect(() => {
    let result = [...tasks];
    
    if (searchTerm) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (projectFilter !== 'all') {
      result = result.filter(task => task.project === projectFilter);
    }
    
    if (priorityFilter !== 'all-priority') {
      result = result.filter(task => task.priority === priorityFilter);
    }
    
    setFilteredTasks(result);
  }, [tasks, searchTerm, projectFilter, priorityFilter]);

  const handleTaskStatusChange = async (id: string, completed: boolean) => {
    try {
      const status = completed ? 'completed' : 'active';
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? { ...task, completed } : task
        )
      );
    } catch (error: any) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    // Update the order in the local state
    const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
    const newIndex = filteredTasks.findIndex(task => task.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newOrder = arrayMove(filteredTasks, oldIndex, newIndex);
    setFilteredTasks(newOrder);
    
    // Calculate new positions for all affected tasks
    const updatedTasks = newOrder.map((task, index) => ({
      id: task.id,
      position: index
    }));
    
    // Update the positions in the database
    try {
      for (const task of updatedTasks) {
        await supabase
          .from('tasks')
          .update({ position: task.position })
          .eq('id', task.id);
      }
    } catch (error: any) {
      toast({
        title: 'Error updating task positions',
        description: error.message,
        variant: 'destructive'
      });
    }
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={projectFilter}
            onValueChange={setProjectFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select 
            value={priorityFilter}
            onValueChange={setPriorityFilter}
          >
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
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No tasks found</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredTasks.map((task) => (
                      <DraggableTask 
                        key={task.id} 
                        id={task.id}
                        title={task.title}
                        completed={task.completed}
                        dueDate={task.dueDate}
                        priority={task.priority}
                        project={task.project}
                        department={task.department}
                        onStatusChange={handleTaskStatusChange}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="active">
            <Card className="p-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredTasks.filter(task => !task.completed).map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredTasks
                      .filter((task) => !task.completed)
                      .map((task) => (
                        <DraggableTask 
                          key={task.id} 
                          id={task.id}
                          title={task.title}
                          completed={task.completed}
                          dueDate={task.dueDate}
                          priority={task.priority}
                          project={task.project}
                          department={task.department}
                          onStatusChange={handleTaskStatusChange}
                        />
                      ))}
                  </SortableContext>
                </DndContext>
              )}
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card className="p-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading tasks...</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredTasks.filter(task => task.completed).map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredTasks
                      .filter((task) => task.completed)
                      .map((task) => (
                        <DraggableTask 
                          key={task.id} 
                          id={task.id}
                          title={task.title}
                          completed={task.completed}
                          dueDate={task.dueDate}
                          priority={task.priority}
                          project={task.project}
                          department={task.department}
                          onStatusChange={handleTaskStatusChange}
                        />
                      ))}
                  </SortableContext>
                </DndContext>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Tasks;
