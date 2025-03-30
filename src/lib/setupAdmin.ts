
import { supabase } from "@/integrations/supabase/client";
import { PREDEFINED_DEPARTMENTS } from "./departments";

export const setupPredefinedDepartments = async () => {
  try {
    console.log('Running setupPredefinedDepartments...');
    
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
      
      const { data, error } = await supabase
        .from('departments')
        .insert(PREDEFINED_DEPARTMENTS)
        .select();
      
      if (error) {
        console.error('Error inserting departments:', error);
        throw error;
      }
      
      console.log('Predefined departments added successfully:', data);
      return { success: true, message: 'Departamentos predefinidos adicionados com sucesso', departments: data };
    }
    
    console.log('Departments already exist, skipping setup. Existing departments:', existingDepartments);
    return { success: true, message: 'Departamentos já existem', departments: existingDepartments };
  } catch (error: any) {
    console.error('Erro ao configurar departamentos predefinidos:', error);
    return { success: false, message: error.message, error };
  }
};

// Function to force refresh departments (used for debugging)
export const forceRefreshDepartments = async () => {
  try {
    console.log('Running forceRefreshDepartments...');
    
    // First delete all departments
    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Safe guard to avoid deleting everything
    
    if (deleteError) {
      console.error('Error deleting departments:', deleteError);
      throw deleteError;
    }
    
    // Then insert predefined departments
    const { data, error } = await supabase
      .from('departments')
      .insert(PREDEFINED_DEPARTMENTS)
      .select();
      
    if (error) {
      console.error('Error inserting departments:', error);
      throw error;
    }
    
    console.log('Departments refreshed successfully:', data);
    return { success: true, message: 'Departamentos atualizados com sucesso', departments: data };
  } catch (error: any) {
    console.error('Erro ao atualizar departamentos:', error);
    return { success: false, message: error.message, error };
  }
};
