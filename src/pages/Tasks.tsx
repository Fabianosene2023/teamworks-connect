
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PlusCircle } from "lucide-react";
import TaskForm from "@/components/tasks/TaskForm";
import { TasksProvider } from "@/context/TasksContext";
import { TasksList } from "@/components/tasks/TasksList";
import { ActiveTasksList } from "@/components/tasks/ActiveTasksList";
import { CompletedTasksList } from "@/components/tasks/CompletedTasksList";

const Tasks = () => {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <MainLayout>
      <TasksProvider>
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
                  <TaskForm 
                    onSuccess={() => setIsSheetOpen(false)}
                  />
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
              <ActiveTasksList />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              <CompletedTasksList />
            </TabsContent>
          </Tabs>
        </div>
      </TasksProvider>
    </MainLayout>
  );
};

export default Tasks;
