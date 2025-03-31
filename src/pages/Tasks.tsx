
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableTask from "@/components/tasks/DraggableTask";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { isAdmin } from "@/lib/departments";

// Define schema for task validation
const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  department_id: z.string().min(1, "Departamento é obrigatório"),
  due_date: z.date().optional(),
});

interface TaskFormValues extends z.infer<typeof taskSchema> {}

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      department_id: "",
      due_date: undefined,
    },
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email);
        
        // Check if user is admin
        if (isAdmin(user.email)) {
          fetchAllTasks();
        } else {
          // Get user's department
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("department_id")
            .eq("id", user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            return;
          }
          
          if (profileData?.department_id) {
            setUserDepartment(profileData.department_id);
            fetchTasksByDepartment(profileData.department_id);
          }
        }
      }
    };

    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
        
      if (error) {
        console.error("Error fetching departments:", error);
        return;
      }
      
      setDepartments(data || []);
    };

    fetchUserDetails();
    fetchDepartments();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          departments(name)
        `)
        .order("position");
        
      if (error) throw error;
      
      const tasksWithDetails = data?.map((task) => ({
        ...task,
        department: task.departments?.name || "",
      })) || [];
      
      setTasks(tasksWithDetails);
      setActiveTasks(tasksWithDetails.filter((task) => task.status === "active"));
      setCompletedTasks(tasksWithDetails.filter((task) => task.status === "completed"));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar tarefas",
        variant: "destructive",
      });
    }
  };

  const fetchTasksByDepartment = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          departments(name)
        `)
        .eq("department_id", departmentId)
        .order("position");
        
      if (error) throw error;
      
      const tasksWithDetails = data?.map((task) => ({
        ...task,
        department: task.departments?.name || "",
      })) || [];
      
      setTasks(tasksWithDetails);
      setActiveTasks(tasksWithDetails.filter((task) => task.status === "active"));
      setCompletedTasks(tasksWithDetails.filter((task) => task.status === "completed"));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar tarefas",
        variant: "destructive",
      });
    }
  };

  const handleTaskCreate = async (values: TaskFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }
      
      // Get maximum position for tasks
      const { data: maxPositionData, error: maxPositionError } = await supabase
        .from("tasks")
        .select("position")
        .order("position", { ascending: false })
        .limit(1);
        
      if (maxPositionError) throw maxPositionError;
      
      const maxPosition = maxPositionData?.[0]?.position || 0;
      
      const newTask = {
        title: values.title,
        description: values.description || "",
        priority: values.priority,
        department_id: values.department_id,
        created_by: user.id,
        assigned_to: user.id,
        status: "active",
        position: maxPosition + 1,
        due_date: values.due_date ? values.due_date.toISOString() : null,
      };
      
      const { data, error } = await supabase.from("tasks").insert(newTask).select();
      
      if (error) throw error;
      
      // Refresh tasks
      if (isAdmin(user.email)) {
        fetchAllTasks();
      } else if (userDepartment) {
        fetchTasksByDepartment(userDepartment);
      }
      
      setIsSheetOpen(false);
      form.reset();
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tarefa",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: completed ? "completed" : "active" })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update local state
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, status: completed ? "completed" : "active" } : task
      );
      
      setTasks(updatedTasks);
      setActiveTasks(updatedTasks.filter((task) => task.status === "active"));
      setCompletedTasks(updatedTasks.filter((task) => task.status === "completed"));
      
      toast({
        title: "Sucesso",
        description: `Tarefa marcada como ${completed ? "concluída" : "ativa"}`,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar tarefa",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    // Update the active tasks order
    const oldIndex = activeTasks.findIndex((task) => task.id === active.id);
    const newIndex = activeTasks.findIndex((task) => task.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const newActiveTasks = arrayMove(activeTasks, oldIndex, newIndex);
    setActiveTasks(newActiveTasks);
    
    // Update positions in database
    try {
      const updates = newActiveTasks.map((task, index) => ({
        id: task.id,
        position: index,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from("tasks")
          .update({ position: update.position })
          .eq("id", update.id);
          
        if (error) throw error;
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar posições",
        variant: "destructive",
      });
    }
  };

  const refreshTasks = () => {
    if (isAdmin(userEmail)) {
      fetchAllTasks();
    } else if (userDepartment) {
      fetchTasksByDepartment(userDepartment);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tarefas</h1>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Tarefa
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Adicionar Nova Tarefa</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleTaskCreate)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o título da tarefa" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Descrição (opcional)" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridade</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a prioridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="department_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || userDepartment || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Criar Tarefa
                    </Button>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Tarefas Ativas</TabsTrigger>
            <TabsTrigger value="completed">Tarefas Concluídas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={activeTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {activeTasks.length > 0 ? (
                    activeTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        completed={task.status === "completed"}
                        dueDate={task.due_date ? new Date(task.due_date) : undefined}
                        priority={task.priority}
                        project={task.project}
                        department={task.department}
                        department_id={task.department_id}
                        description={task.description}
                        onStatusChange={handleStatusChange}
                        onTaskUpdated={refreshTasks}
                        departments={departments}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma tarefa ativa. Adicione uma nova tarefa!
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
          
          <TabsContent value="completed" className="mt-4">
            <div className="space-y-2">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <DraggableTask
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    completed={task.status === "completed"}
                    dueDate={task.due_date ? new Date(task.due_date) : undefined}
                    priority={task.priority}
                    project={task.project}
                    department={task.department}
                    department_id={task.department_id}
                    description={task.description}
                    onStatusChange={handleStatusChange}
                    onTaskUpdated={refreshTasks}
                    departments={departments}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma tarefa concluída.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Tasks;
