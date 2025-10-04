import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Search, ArrowLeft, Plus, Trash2, LogOut } from "lucide-react";

const MarketManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [markets, setMarkets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddMarket, setShowAddMarket] = useState(false);
  const [newMarket, setNewMarket] = useState({
    name: "",
    crop: "",
    price: "",
    description: "",
    trends: "",
    market_type: "local"
  });

  useEffect(() => {
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated');
    if (!isAdminAuthenticated) {
      navigate("/admin");
      return;
    }
    fetchMarkets();
  }, [navigate]);

  const fetchMarkets = async () => {
    setLoading(true);
    const { data } = await supabase.from('markets').select('*').order('created_at', { ascending: false });
    if (data) setMarkets(data);
    setLoading(false);
  };

  const handleAddMarket = async () => {
    if (!newMarket.name || !newMarket.crop || !newMarket.price) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('markets').insert({
      name: newMarket.name,
      crop: newMarket.crop,
      price: parseFloat(newMarket.price),
      description: newMarket.description,
      trends: newMarket.trends,
      market_type: newMarket.market_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (error) {
      toast({ title: "Error adding market", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Market added successfully" });
      setShowAddMarket(false);
      setNewMarket({ name: "", crop: "", price: "", description: "", trends: "", market_type: "local" });
      fetchMarkets();
    }
  };

  const handleDeleteMarket = async (marketId: string) => {
    const { error } = await supabase.from('markets').delete().eq('id', marketId);

    if (error) {
      toast({ title: "Error deleting market", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Market deleted successfully" });
      fetchMarkets();
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate("/admin");
  };

  const filteredMarkets = markets.filter(market =>
    market.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.crop?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Store className="h-8 w-8 text-primary" />
                Market Management
              </h1>
              <p className="text-muted-foreground">Manage local and international markets</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddMarket(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Market
            </Button>
            <Button variant="outline" onClick={handleAdminLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Admin Logout
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets by name or crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Markets ({filteredMarkets.length})</CardTitle>
            <CardDescription>Manage local and international market data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading markets...</div>
            ) : (
              <div className="space-y-4">
                {filteredMarkets.map((market) => (
                  <Card key={market.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{market.name}</h3>
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                              {market.crop}
                            </span>
                            <span className={`px-2 py-1 rounded text-sm ${
                              market.market_type === 'local' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {market.market_type}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-primary my-2">${market.price}</p>
                          <p className="text-sm text-muted-foreground">{market.description}</p>
                          <p className="text-sm mt-1">Trends: {market.trends}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteMarket(market.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!loading && filteredMarkets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No markets found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {showAddMarket && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add New Market</CardTitle>
              <CardDescription>Create a new market entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Market Name *</label>
                  <Input value={newMarket.name} onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })} placeholder="e.g., Nairobi Coffee Exchange" />
                </div>
                <div>
                  <label className="text-sm font-medium">Crop *</label>
                  <Input value={newMarket.crop} onChange={(e) => setNewMarket({ ...newMarket, crop: e.target.value })} placeholder="e.g., Coffee" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price ($) *</label>
                  <Input type="number" value={newMarket.price} onChange={(e) => setNewMarket({ ...newMarket, price: e.target.value })} placeholder="e.g., 450.00" />
                </div>
                <div>
                  <label className="text-sm font-medium">Market Type *</label>
                  <select value={newMarket.market_type} onChange={(e) => setNewMarket({ ...newMarket, market_type: e.target.value })} className="w-full p-2 border rounded-md">
                    <option value="local">Local</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={newMarket.description} onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })} placeholder="Market description..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Market Trends</label>
                <Textarea value={newMarket.trends} onChange={(e) => setNewMarket({ ...newMarket, trends: e.target.value })} placeholder="Current market trends..." rows={2} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMarket} className="flex-1">Add Market</Button>
                <Button variant="outline" onClick={() => setShowAddMarket(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MarketManagement;