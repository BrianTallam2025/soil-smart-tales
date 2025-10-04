import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Sprout, MessageSquare, BookOpen, User } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import heroImage from "@/assets/hero-farmers.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMarkets();
    }
  }, [user]);

  const fetchMarkets = async () => {
    const { data } = await supabase
      .from('markets')
      .select('*')
      .order('price', { ascending: false })
      .limit(3);
    if (data) setMarkets(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-foreground">
              Empowering Farmers with Smart Insights
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Access real-time market prices, expert agricultural advice, and financial guidance—all in one place
            </p>
            {user ? (
              <Link to="/profile">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Info Hub</CardTitle>
                <CardDescription>
                  Browse and share farming insights, tips, and best practices from the community
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Market Prices</CardTitle>
                <CardDescription>
                  Track local and international market prices for coffee and tea in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Advisor</CardTitle>
                <CardDescription>
                  Get personalized farming and financial advice powered by AI technology
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <User className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your farm details, view your blogs, and track your journey
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Market Preview */}
      {user && markets.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">Market Prices Today</h2>
              <Link to="/market">
                <Button variant="outline">View All Markets</Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {markets.map((market) => (
                <Card key={market.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{market.crop}</span>
                      <span className="text-2xl font-bold text-primary">
                        ${market.price}
                      </span>
                    </CardTitle>
                    <CardDescription>{market.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{market.trends}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join the AgriTell Community Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get access to market insights, expert advice, and connect with fellow farmers
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;