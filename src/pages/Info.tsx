import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Filter, Calendar } from "lucide-react";

const Info = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [showNewBlogDialog, setShowNewBlogDialog] = useState(false);
  const [filterCrop, setFilterCrop] = useState("all");
  const [filterSeason, setFilterSeason] = useState("all");
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    region: "",
    crop: "",
    season: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchBlogs();
      }
    });
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [blogs, filterCrop, filterSeason]);

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select(`
        *,
        profiles (full_name)
      `)
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
  };

  const applyFilters = () => {
    let filtered = [...blogs];
    if (filterCrop !== "all") {
      filtered = filtered.filter(b => b.crop.toLowerCase().includes(filterCrop.toLowerCase()));
    }
    if (filterSeason !== "all") {
      filtered = filtered.filter(b => b.season.toLowerCase() === filterSeason.toLowerCase());
    }
    setFilteredBlogs(filtered);
  };

  const handleCreateBlog = async () => {
    if (!user || !newBlog.title || !newBlog.content || !newBlog.region || !newBlog.crop || !newBlog.season) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('blogs')
      .insert({
        ...newBlog,
        author_id: user.id,
      });

    if (error) {
      toast({
        title: "Error creating blog",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success!", description: "Blog published successfully" });
      setShowNewBlogDialog(false);
      setNewBlog({ title: "", content: "", region: "", crop: "", season: "" });
      fetchBlogs();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Info Hub</h1>
            <p className="text-muted-foreground">Share and discover farming insights</p>
          </div>
          <Dialog open={showNewBlogDialog} onOpenChange={setShowNewBlogDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Blog</DialogTitle>
                <DialogDescription>Share your farming knowledge with the community</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    placeholder="e.g., Best Practices for Coffee Harvesting"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Region</label>
                    <Input
                      value={newBlog.region}
                      onChange={(e) => setNewBlog({ ...newBlog, region: e.target.value })}
                      placeholder="e.g., Bomet"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Crop</label>
                    <Input
                      value={newBlog.crop}
                      onChange={(e) => setNewBlog({ ...newBlog, crop: e.target.value })}
                      placeholder="e.g., Coffee"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Season</label>
                    <Select value={newBlog.season} onValueChange={(v) => setNewBlog({ ...newBlog, season: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                        <SelectItem value="Rainy">Rainy Season</SelectItem>
                        <SelectItem value="Dry">Dry Season</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    placeholder="Share your insights, tips, and experiences..."
                    rows={10}
                  />
                </div>
                <Button onClick={handleCreateBlog} className="w-full">Publish Blog</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Crop</label>
                <Select value={filterCrop} onValueChange={setFilterCrop}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Crops</SelectItem>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="tea">Tea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Season</label>
                <Select value={filterSeason} onValueChange={setFilterSeason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="rainy">Rainy Season</SelectItem>
                    <SelectItem value="dry">Dry Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedBlog(blog)}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">{blog.crop}</span>
                    <span className="bg-secondary/10 text-secondary px-2 py-1 rounded">{blog.region}</span>
                    <span className="bg-accent/10 text-accent px-2 py-1 rounded">{blog.season}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{blog.content}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBlogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blogs found. Try adjusting your filters or create a new blog!</p>
          </div>
        )}

        <Dialog open={!!selectedBlog} onOpenChange={() => setSelectedBlog(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedBlog && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedBlog.title}</DialogTitle>
                  <DialogDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{selectedBlog.crop}</span>
                      <span className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs">{selectedBlog.region}</span>
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded text-xs">{selectedBlog.season}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Published on {new Date(selectedBlog.created_at).toLocaleDateString()}
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{selectedBlog.content}</p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Info;