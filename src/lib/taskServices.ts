
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/taskTypes";

export const ensureValidPriority = (priority: string): "low" | "medium" | "high" => {
  if (priority === "low" || priority === "medium" || priority === "high") {
    return priority;
  }
  return "medium"; // Default value for invalid priorities
};

export const fetchAllTasks = async (): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        departments(name)
      `)
      .order("position");
      
    if (error) throw error;
    
    const tasksWithDetails = data?.map((task: any) => ({
      ...task,
      department: task.departments?.name || "",
      priority: ensureValidPriority(task.priority),
      shared_with: task.shared_with || []
    })) || [];
    
    return tasksWithDetails as Task[];
  } catch (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
};

export const fetchTasksByDepartment = async (departmentId: string): Promise<Task[]> => {
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
    
    const tasksWithDetails = data?.map((task: any) => ({
      ...task,
      department: task.departments?.name || "",
      priority: ensureValidPriority(task.priority),
      shared_with: task.shared_with || []
    })) || [];
    
    return tasksWithDetails as Task[];
  } catch (error) {
    console.error("Error fetching department tasks:", error);
    return [];
  }
};

export const fetchUserTasks = async (userId: string): Promise<Task[]> => {
  try {
    // Fetch tasks created by the user
    const { data: createdTasks, error: createdError } = await supabase
      .from("tasks")
      .select(`
        *,
        departments(name)
      `)
      .eq("created_by", userId)
      .order("position");
      
    if (createdError) throw createdError;
    
    // Fetch tasks assigned to the user
    const { data: assignedTasks, error: assignedError } = await supabase
      .from("tasks")
      .select(`
        *,
        departments(name)
      `)
      .eq("assigned_to", userId)
      .order("position");
      
    if (assignedError) throw assignedError;
    
    // Fetch tasks shared with the user
    const { data: sharedTasks, error: sharedError } = await supabase
      .from("tasks")
      .select(`
        *,
        departments(name)
      `)
      .contains("shared_with", [userId])
      .order("position");
      
    if (sharedError) throw sharedError;
    
    // Combine and deduplicate tasks
    const allTasks = [...(createdTasks || []), ...(assignedTasks || []), ...(sharedTasks || [])];
    const uniqueTasks = Array.from(new Map(allTasks.map(task => [task.id, task])).values());
    
    const tasksWithDetails = uniqueTasks.map((task: any) => ({
      ...task,
      department: task.departments?.name || "",
      priority: ensureValidPriority(task.priority),
      shared_with: task.shared_with || []
    }));
    
    return tasksWithDetails as Task[];
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return [];
  }
};
