
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { Session } from "@supabase/supabase-js";
import { setupPredefinedDepartments } from "./lib/setupAdmin";
import { toast } from "./hooks/use-toast";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupDepartments = async () => {
      try {
        console.log('Setting up predefined departments...');
        const result = await setupPredefinedDepartments();
        console.log('Setup result:', result);
        
        if (!result.success) {
          console.error('Failed to set up departments:', result.error);
          toast({
            title: "Error",
            description: "Failed to set up departments: " + result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Failed to set up departments:', error);
      }
    };

    // Set up immediately on app load, without waiting for auth
    setupDepartments();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setLoading(false);
        
        // Setup departments on auth change
        if (event === 'SIGNED_IN') {
          console.log('User signed in, setting up departments...');
          setupDepartments();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={session ? <Navigate to="/" /> : <Auth />} />
            <Route path="/" element={session ? <Index /> : <Navigate to="/auth" />} />
            <Route path="/projects" element={session ? <Projects /> : <Navigate to="/auth" />} />
            <Route path="/tasks" element={session ? <Tasks /> : <Navigate to="/auth" />} />
            <Route path="/calendar" element={session ? <Calendar /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={session ? <Admin /> : <Navigate to="/auth" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
