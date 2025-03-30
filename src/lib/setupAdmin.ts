
import { supabase } from "@/integrations/supabase/client";
import { PREDEFINED_DEPARTMENTS } from "./departments";

export const setupPredefinedDepartments = async () => {
  try {
    // Check if departments already exist
    const { data: existingDepartments, error: checkError } = await supabase
      .from('departments')
      .select('name');
    
    if (checkError) throw checkError;
    
    // If there are no departments, insert the predefined ones
    if (!existingDepartments?.length) {
      const { error } = await supabase
        .from('departments')
        .insert(PREDEFINED_DEPARTMENTS);
      
      if (error) throw error;
      
      console.log('Predefined departments added successfully');
      return { success: true, message: 'Departamentos predefinidos adicionados com sucesso' };
    }
    
    console.log('Departments already exist, skipping setup');
    return { success: true, message: 'Departamentos já existem' };
  } catch (error: any) {
    console.error('Erro ao configurar departamentos predefinidos:', error);
    return { success: false, message: error.message };
  }
};
