
import React, { useEffect, useState } from "react";
import AuthForm from "@/components/auth/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { setupPredefinedDepartments } from "@/lib/setupAdmin";

const Auth = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
        
      if (error) {
        console.error("Error fetching departments:", error);
        throw error;
      }
      
      console.log("Fetched departments:", data);
      setDepartments(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao carregar departamentos: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleRefreshDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      
      // Setup departments first
      console.log("Setting up departments before fetching...");
      const result = await setupPredefinedDepartments();
      
      if (!result.success) {
        console.error("Failed to set up departments:", result.error);
        toast({
          title: "Erro",
          description: "Falha ao configurar departamentos: " + result.message,
          variant: "destructive",
        });
      }
      
      // Then fetch them
      await fetchDepartments();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar departamentos: " + error.message,
        variant: "destructive",
      });
      setIsLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Sistema de Gestão</h1>
          <p className="text-gray-600">Gerencie seus projetos e tarefas</p>
        </div>
        <AuthForm 
          departments={departments}
          isLoadingDepartments={isLoadingDepartments}
          onRefreshDepartments={handleRefreshDepartments}
        />
      </div>
    </div>
  );
};

export default Auth;
