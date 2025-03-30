
import { supabase } from "@/integrations/supabase/client";
import { PREDEFINED_DEPARTMENTS } from "./departments";

export const setupPredefinedDepartments = async () => {
  try {
    // Check if departments already exist
    const { data: existingDepartments, error: checkError } = await supabase
      .from('departments')
      .select('name');
    
    if (checkError) {
      console.error('Error checking departments:', checkError);
      throw checkError;
    }
    
    // If there are no departments, insert the predefined ones
    if (!existingDepartments || existingDepartments.length === 0) {
      console.log('No departments found, adding predefined ones...');
      
      const { error } = await supabase
        .from('departments')
        .insert(PREDEFINED_DEPARTMENTS);
      
      if (error) {
        console.error('Error inserting departments:', error);
        throw error;
      }
      
      console.log('Predefined departments added successfully:', PREDEFINED_DEPARTMENTS);
      return { success: true, message: 'Departamentos predefinidos adicionados com sucesso' };
    }
    
    console.log('Departments already exist, skipping setup. Existing departments:', existingDepartments);
    return { success: true, message: 'Departamentos já existem' };
  } catch (error: any) {
    console.error('Erro ao configurar departamentos predefinidos:', error);
    return { success: false, message: error.message };
  }
};

// Function to force refresh departments (used for debugging)
export const forceRefreshDepartments = async () => {
  try {
    // First delete all departments
    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Safe guard to avoid deleting everything
    
    if (deleteError) throw deleteError;
    
    // Then insert predefined departments
    const { error } = await supabase
      .from('departments')
      .insert(PREDEFINED_DEPARTMENTS);
      
    if (error) throw error;
    
    console.log('Departments refreshed successfully');
    return { success: true, message: 'Departamentos atualizados com sucesso' };
  } catch (error: any) {
    console.error('Erro ao atualizar departamentos:', error);
    return { success: false, message: error.message };
  }
};
