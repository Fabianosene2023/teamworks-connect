
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isAdmin } from "@/lib/departments";
import { fetchAllTasks, fetchTasksByDepartment, fetchUserTasks } from "@/lib/taskServices";
import { Task, Department } from "@/types/taskTypes";

interface TasksContextType {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  departments: Department[];
  userDepartment: string | null;
  refreshTasks: () => void;
  handleStatusChange: (id: string, completed: boolean) => Promise<void>;
  handleTaskCreate: (values: any) => Promise<void>;
  handleDragEnd: (activeId: string, overId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasksContext must be used within a TasksProvider");
  }
  return context;
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email);
        setUserId(user.id);
        
        // Check if user is admin
        if (isAdmin(user.email)) {
          const taskData = await fetchAllTasks();
          updateTasksState(taskData);
        } else {
          // Get user's department
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("department_id")
            .eq("id", user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            const userTasksData = await fetchUserTasks(user.id);
            updateTasksState(userTasksData);
            return;
          }
          
          if (profileData?.department_id) {
            setUserDepartment(profileData.department_id);
            const deptTasksData = await fetchTasksByDepartment(profileData.department_id);
            updateTasksState(deptTasksData);
          } else {
            const userTasksData = await fetchUserTasks(user.id);
            updateTasksState(userTasksData);
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

  const updateTasksState = (tasksData: Task[]) => {
    setTasks(tasksData);
    setActiveTasks(tasksData.filter(task => task.status === "active"));
    setCompletedTasks(tasksData.filter(task => task.status === "completed"));
  };

  const handleTaskCreate = async (values: any) => {
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
        shared_with: [],
      };
      
      const { error } = await supabase.from("tasks").insert(newTask);
      
      if (error) throw error;
      
      // Refresh tasks
      refreshTasks();
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso",
      });

      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar tarefa",
        variant: "destructive",
      });
      return Promise.reject(error);
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
      
      updateTasksState(updatedTasks);
      
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

  const handleDragEnd = async (activeId: string, overId: string) => {
    if (activeId === overId) {
      return;
    }
    
    // Update the active tasks order
    const oldIndex = activeTasks.findIndex((task) => task.id === activeId);
    const newIndex = activeTasks.findIndex((task) => task.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    // Create a new array with the updated order
    const newActiveTasks = [...activeTasks];
    const [movedTask] = newActiveTasks.splice(oldIndex, 1);
    newActiveTasks.splice(newIndex, 0, movedTask);
    
    // Update the local state first for responsiveness
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
      
      // Revert local state if the update fails
      setActiveTasks(activeTasks);
    }
  };

  const refreshTasks = () => {
    if (isAdmin(userEmail)) {
      fetchAllTasks().then(updateTasksState);
    } else if (userDepartment) {
      fetchTasksByDepartment(userDepartment).then(updateTasksState);
    } else if (userId) {
      fetchUserTasks(userId).then(updateTasksState);
    }
  };

  const value = {
    tasks,
    activeTasks,
    completedTasks,
    departments,
    userDepartment,
    refreshTasks,
    handleStatusChange,
    handleTaskCreate,
    handleDragEnd,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
