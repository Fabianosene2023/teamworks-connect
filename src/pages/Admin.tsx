
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DepartmentType, isAdmin } from "@/lib/departments";

const Admin = () => {
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user && !isAdmin(user.email)) {
        toast({
          title: "Acesso Restrito",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate('/');
      }
      
      loadDepartments();
    };
    
    checkAuth();
  }, [navigate]);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      setDepartments(data || []);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar departamentos",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDepartment.trim()) {
      toast({
        title: "Campo vazio",
        description: "O nome do departamento é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert({ name: newDepartment.trim() })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Departamento adicionado com sucesso",
      });
      
      setDepartments([...(data || []), ...departments]);
      setNewDepartment("");
      loadDepartments();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar departamento",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Departamento excluído com sucesso",
      });
      
      setDepartments(departments.filter(dept => dept.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir departamento",
        variant: "destructive",
      });
    }
  };

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Painel do Administrador</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gerenciar Departamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDepartment} className="flex gap-2 mb-6">
              <Input
                placeholder="Nome do departamento"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </form>
            
            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : (
              <div className="grid gap-2">
                {departments.map((dept) => (
                  <div 
                    key={dept.id} 
                    className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                  >
                    <span>{dept.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteDepartment(dept.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {departments.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum departamento encontrado
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Admin;
