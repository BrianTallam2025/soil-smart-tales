import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Hardcoded admin credentials (you can change these)
  const ADMIN_CREDENTIALS = {
    email: "admin@agritell1.com",
    password: "Admin123!" // Change this to whatever you want
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check against hardcoded credentials
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      toast({
        title: "Invalid credentials",
        description: "Please check your email and password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // If credentials match, set admin session
    localStorage.setItem('adminAuthenticated', 'true');
    
    toast({
      title: "Admin access granted!",
      description: "Welcome to the admin panel",
    });
    
    navigate("/admin/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link to="/" className="flex items-center gap-2 mb-8 text-2xl font-bold text-primary">
        <Shield className="h-8 w-8" />
        <span>AgriTell Admin</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter admin credentials to access the panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Admin Login"}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")} 
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;