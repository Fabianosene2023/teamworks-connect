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

    // Corrigir o problema de deep type instantiation, simplificando a manipulação de shared_with
    let sharedWithIds: string[] = [];

    // Forçar o tipo de shared_with para um array de strings
    if (data && Array.isArray(data.shared_with)) {
      sharedWithIds = data.shared_with.filter((item: any) => item != null).map(String);
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
