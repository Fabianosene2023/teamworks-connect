
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setupPredefinedDepartments, forceRefreshDepartments } from "@/lib/setupAdmin";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [refreshingDepartments, setRefreshingDepartments] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchDepartments = async (forceRefresh = false) => {
    setLoadingDepartments(true);
    try {
      // Setup or refresh departments if needed
      let setupResult;
      if (forceRefresh) {
        console.log('Force refreshing departments...');
        setupResult = await forceRefreshDepartments();
      } else {
        // First ensure departments are set up
        console.log('Setting up departments before fetching...');
        setupResult = await setupPredefinedDepartments();
      }
      
      if (!setupResult.success) {
        console.error('Error setting up departments:', setupResult.error);
        toast({
          title: "Error",
          description: "Failed to set up departments: " + setupResult.message,
          variant: "destructive",
        });
        setDepartments([]);
        return;
      }
      
      // Then fetch departments
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching departments:', error);
        toast({
          title: "Error",
          description: "Failed to load departments: " + error.message,
          variant: "destructive",
        });
        setDepartments([]);
        return;
      }
      
      console.log('Fetched departments:', data);
      setDepartments(data || []);
      
      if (data && data.length > 0 && forceRefresh) {
        toast({
          title: "Success",
          description: "Departments refreshed successfully",
        });
      }
    } catch (error: any) {
      console.error('Error in fetchDepartments:', error);
      toast({
        title: "Error",
        description: "Failed to load departments: " + error.message,
        variant: "destructive",
      });
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
      setRefreshingDepartments(false);
    }
  };

  const handleRefreshDepartments = async () => {
    setRefreshingDepartments(true);
    await fetchDepartments(true);
  };

  useEffect(() => {
    fetchDepartments();

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            department_id: department
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        // Update profile with department
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            first_name: firstName,
            last_name: lastName,
            department_id: department
          })
          .eq('id', data.user.id);
        
        if (profileError) throw profileError;
        
        toast({
          title: "Account created",
          description: "You've successfully signed up and logged in.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-500 p-1">
              <Users size={24} className="text-white" />
            </div>
            <span className="text-2xl font-semibold">TEAM</span>
          </div>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome to TEAM</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="department">Department</Label>
                      {departments.length > 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 h-8 px-2"
                          onClick={handleRefreshDepartments}
                          disabled={refreshingDepartments}
                        >
                          <RefreshCw size={14} className={refreshingDepartments ? "animate-spin" : ""} />
                          <span>Refresh</span>
                        </Button>
                      )}
                    </div>
                    
                    {loadingDepartments ? (
                      <div className="py-2 text-sm text-gray-500">Loading departments...</div>
                    ) : departments.length === 0 ? (
                      <div className="space-y-2">
                        <div className="py-2 text-sm text-red-500">
                          No departments available. Please try again or contact support.
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 w-full"
                          onClick={handleRefreshDepartments}
                          disabled={refreshingDepartments}
                        >
                          <RefreshCw size={14} className={refreshingDepartments ? "animate-spin" : ""} />
                          <span>Refresh Departments</span>
                        </Button>
                      </div>
                    ) : (
                      <Select 
                        value={department}
                        onValueChange={setDepartment}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept: any) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || loadingDepartments || departments.length === 0}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
