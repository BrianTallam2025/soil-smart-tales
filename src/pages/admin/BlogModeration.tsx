import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Search, ArrowLeft, Trash2, LogOut } from "lucide-react";

const BlogModeration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data: blogsData } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    
    if (blogsData) {
      const authorIds = [...new Set(blogsData.map(blog => blog.author_id))];
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', authorIds);

      const blogsWithAuthors = blogsData.map(blog => {
        const author = profilesData?.find(profile => profile.id === blog.author_id);
        return { ...blog, author_name: author?.full_name || 'Unknown' };
      });
      setBlogs(blogsWithAuthors);
    }
    setLoading(false);
  };

  const handleDeleteBlog = async (blogId: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', blogId);

    if (error) {
      toast({ title: "Error deleting blog", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Blog deleted successfully" });
      fetchBlogs();
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate("/admin");
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.crop?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <FileText className="h-8 w-8 text-primary" />
                Blog Moderation
              </h1>
              <p className="text-muted-foreground">Review and manage blog posts</p>
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
                placeholder="Search blogs by title, author, or crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts ({filteredBlogs.length})</CardTitle>
            <CardDescription>Manage and moderate blog content</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading blogs...</div>
            ) : (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => (
                  <Card key={blog.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{blog.title}</h3>
                          <p className="text-sm text-muted-foreground">By {blog.author_name}</p>
                          <p className="text-sm">Crop: {blog.crop} | Region: {blog.region} | Season: {blog.season}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm mt-2 line-clamp-2">{blog.content}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBlog(blog.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && filteredBlogs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No blogs found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogModeration;