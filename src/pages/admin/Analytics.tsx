import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, ArrowLeft, Users, FileText, Store, TrendingUp, LogOut } from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalMarkets: 0,
    adminUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate("/admin");
  };

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
                <BarChart3 className="h-8 w-8 text-primary" />
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">Platform statistics and insights</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleAdminLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Admin Logout
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBlogs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Markets</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMarkets}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.adminUsers}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Platform Summary</CardTitle>
                <CardDescription>Key metrics and performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">User Engagement</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span>Total Registered Farmers:</span><span className="font-bold">{stats.totalUsers}</span></li>
                      <li className="flex justify-between"><span>Community Blogs:</span><span className="font-bold">{stats.totalBlogs}</span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Market Coverage</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span>Total Markets Tracked:</span><span className="font-bold">{stats.totalMarkets}</span></li>
                      <li className="flex justify-between"><span>Admin Users:</span><span className="font-bold">{stats.adminUsers}</span></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>Manage Users</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/blogs")}>Review Blogs</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin/markets")}>Manage Markets</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;