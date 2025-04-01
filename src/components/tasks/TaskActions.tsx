
const handleShareWithUser = async () => {
  try {
    setIsLoading(true);

    if (!userEmail) {
      toast({
        title: "Erro",
        description: "Por favor, informe um email",
        variant: "destructive",
      });
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError) {
      if (userError.code === "PGRST116") {
        toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
        return;
      }
      throw userError;
    }

    const { data, error: taskError } = await supabase
      .from("tasks")
      .select("shared_with")
      .eq("id", task.id)
      .single();

    if (taskError) throw taskError;

    // Simplify the shared_with handling to avoid deep type instantiation
    const sharedWithIds: string[] = [];
    
    // Safely process the shared_with array from the database
    if (data && data.shared_with) {
      // Cast to any to avoid TypeScript's deep type analysis
      const sharedWith = data.shared_with as any[];
      
      // Filter out null values and convert all items to strings
      for (let i = 0; i < sharedWith.length; i++) {
        if (sharedWith[i] != null) {
          sharedWithIds.push(String(sharedWith[i]));
        }
      }
    }

    if (sharedWithIds.includes(userData.id)) {
      toast({
        title: "Aviso",
        description: "Tarefa já compartilhada com este usuário",
      });
      setIsShareUserDialogOpen(false);
      return;
    }

    sharedWithIds.push(userData.id);

    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        shared_with: sharedWithIds,
      })
      .eq("id", task.id);

    if (updateError) throw updateError;

    toast({
      title: "Sucesso",
      description: `Tarefa compartilhada com ${userEmail}`,
    });

    onTaskUpdated();
    setIsShareUserDialogOpen(false);
    setUserEmail("");
  } catch (error: any) {
    toast({
      title: "Erro",
      description: error.message || "Erro ao compartilhar tarefa",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
