import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Search, ArrowLeft, LogOut } from "lucide-react";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: rolesData } = await supabase.from('user_roles').select('*');

    if (profilesData) {
      const usersWithRoles = profilesData.map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.id);
        return { ...profile, role: userRole?.role || 'user' };
      });
      setUsers(usersWithRoles);
    }
    setLoading(false);
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    const { error } = await supabase.from('user_roles').upsert({
      user_id: userId,
      role: newRole,
      updated_at: new Date().toISOString()
    });

    if (error) {
      toast({ title: "Error updating role", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: `User role updated to ${newRole}` });
      fetchUsers();
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate("/admin");
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                User Management
              </h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleAdminLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Admin Logout
          </Button>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{user.full_name || 'N/A'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm">Region: {user.region || 'N/A'} | Role: <span className={`font-bold ${user.role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>{user.role}</span></p>
                        </div>
                        <Button
                          variant={user.role === 'admin' ? 'destructive' : 'default'}
                          onClick={() => toggleUserRole(user.id, user.role)}
                        >
                          {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;