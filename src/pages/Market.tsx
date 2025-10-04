import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, TrendingUp, Globe, MapPin } from "lucide-react";

const Market = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchMarkets();
      }
    });
  }, [navigate]);

  const fetchMarkets = async () => {
    const { data } = await supabase
      .from('markets')
      .select('*')
      .order('price', { ascending: false });
    if (data) setMarkets(data);
  };

  const filterMarkets = (type: string) => {
    return markets
      .filter(m => m.market_type === type)
      .filter(m => 
        searchQuery === "" || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.crop.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const MarketCard = ({ market }: { market: any }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMarket(market)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">{market.name}</span>
          <span className="text-2xl font-bold text-primary">${market.price}</span>
        </CardTitle>
        <CardDescription>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">{market.crop}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-accent" />
          {market.trends}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Market Prices</h1>
          <p className="text-muted-foreground">Track coffee and tea prices across local and international markets</p>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by market name or crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Local Markets
            </TabsTrigger>
            <TabsTrigger value="international" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              International Markets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMarkets('local').map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
            {filterMarkets('local').length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No local markets found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="international">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMarkets('international').map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
            {filterMarkets('international').length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No international markets found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedMarket} onOpenChange={() => setSelectedMarket(null)}>
          <DialogContent>
            {selectedMarket && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl flex items-center justify-between">
                    <span>{selectedMarket.name}</span>
                    <span className="text-3xl font-bold text-primary">${selectedMarket.price}</span>
                  </DialogTitle>
                  <DialogDescription>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      {selectedMarket.crop}
                    </span>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedMarket.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      Market Trends
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedMarket.trends}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Market Type</h3>
                    <p className="text-sm text-muted-foreground capitalize">{selectedMarket.market_type}</p>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Market;