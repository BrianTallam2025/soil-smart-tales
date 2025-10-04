import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut, User, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    const checkUserAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check user role from user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(roleData?.role || 'user');
      }
    };

    checkUserAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(roleData?.role || 'user');
      } else {
        setUserRole('user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            <Sprout className="h-6 w-6" />
            <span>AgriTell</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/info" className="text-foreground hover:text-primary transition-colors">
                  Info
                </Link>
                <Link to="/market" className="text-foreground hover:text-primary transition-colors">
                  Market
                </Link>
                <Link to="/finance" className="text-foreground hover:text-primary transition-colors">
                  Finance
                </Link>
                
                {/* Admin Links - Only show if user is admin */}
                {userRole === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
                
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                  About
                </Link>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};