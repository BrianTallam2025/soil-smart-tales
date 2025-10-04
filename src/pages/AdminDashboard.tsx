import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, Shield, BarChart3, Store, LogOut } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalMarkets: 0,
    adminUsers: 0
  });

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: blogCount } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
    const { count: marketCount } = await supabase.from('markets').select('*', { count: 'exact', head: true });
    const { count: adminCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'admin');

    setStats({
      totalUsers: userCount || 0,
      totalBlogs: blogCount || 0,
      totalMarkets: marketCount || 0,
      adminUsers: adminCount || 0
    });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate("/admin");
  };

  const adminCards = [
    {
      title: "User Management",
      description: "Manage users and roles",
      icon: Users,
      path: "/admin/users"
    },
    {
      title: "Blog Moderation",
      description: "Review and manage blog posts",
      icon: FileText,
      path: "/admin/blogs"
    },
    {
      title: "Market Management",
      description: "Manage local and international markets",
      icon: Store,
      path: "/admin/markets"
    },
    {
      title: "Analytics",
      description: "View platform statistics",
      icon: BarChart3,
      path: "/admin/analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your AgriTell platform</p>
          </div>
          <Button variant="outline" onClick={handleAdminLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Admin Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card><CardHeader><CardTitle>Total Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.totalUsers}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Blogs</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.totalBlogs}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total Markets</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.totalMarkets}</CardContent></Card>
          <Card><CardHeader><CardTitle>Admin Users</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.adminUsers}</CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card key={card.title} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate(card.path)} className="w-full">
                    Manage
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;