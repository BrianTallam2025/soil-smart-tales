import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Sprout } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    region: "",
    main_crops: [] as string[],
    farm_size: "",
    bio: "",
  });
  const [cropsInput, setCropsInput] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchUserBlogs(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || "",
        region: data.region || "",
        main_crops: data.main_crops || [],
        farm_size: data.farm_size || "",
        bio: data.bio || "",
      });
      setCropsInput(data.main_crops?.join(", ") || "");
    }
    setLoading(false);
  };

  const fetchUserBlogs = async (userId: string) => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const crops = cropsInput.split(',').map(c => c.trim()).filter(c => c);
    const { error } = await supabase
      .from('profiles')
      .update({
        ...profile,
        main_crops: crops,
        profile_completed: true,
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              Hi {profile.full_name || 'there'} 👋
            </h1>
            <p className="text-muted-foreground">Welcome back to AgriTell</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your farming information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={profile.email}
                  disabled
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Region</label>
                <Input
                  value={profile.region}
                  onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                  placeholder="e.g., Bomet, Kenya"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Main Crops (comma-separated)</label>
                <Input
                  value={cropsInput}
                  onChange={(e) => setCropsInput(e.target.value)}
                  placeholder="e.g., Coffee, Tea"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Farm Size (optional)</label>
                <Input
                  value={profile.farm_size}
                  onChange={(e) => setProfile({ ...profile, farm_size: e.target.value })}
                  placeholder="e.g., 2 acres"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about your farming journey..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                Your Blog Posts
              </CardTitle>
              <CardDescription>
                {blogs.length === 0 ? "You haven't published any blogs yet" : `${blogs.length} blog(s) published`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blogs.length > 0 ? (
                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <Card key={blog.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{blog.title}</CardTitle>
                        <CardDescription>
                          {blog.crop} • {blog.region} • {blog.season}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Start sharing your farming knowledge!</p>
                  <Button onClick={() => navigate('/info')}>Create Your First Blog</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;