import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, MessageSquare, User } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-foreground">About AgriTell</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                AgriTell is dedicated to empowering smallholder coffee and tea farmers across Africa with the 
                information and tools they need to thrive. We believe that access to market insights, expert 
                agricultural advice, and financial guidance should be available to every farmer, regardless of 
                their location or resources.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-3xl font-bold mb-6 text-foreground">Platform Features</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Info Page (Blog Section)</CardTitle>
                <CardDescription>
                  A community-driven knowledge hub where farmers can share their experiences, tips, and best practices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Share farming insights and stories</li>
                  <li>Filter by crop, region, and season</li>
                  <li>Learn from fellow farmers</li>
                  <li>Upload images and detailed guides</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Market Page</CardTitle>
                <CardDescription>
                  Real-time market information for both local and international coffee and tea markets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Live price updates</li>
                  <li>Local and international markets</li>
                  <li>Market trends and insights</li>
                  <li>Compare prices across regions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Finance Page (AI Chatbot)</CardTitle>
                <CardDescription>
                  Get personalized financial and agricultural advice powered by AI technology.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Seasonal planting guidance</li>
                  <li>Bank and credit recommendations</li>
                  <li>Financial planning assistance</li>
                  <li>Pest control strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <User className="h-8 w-8 text-primary mb-2" />
                <CardTitle>User Profile</CardTitle>
                <CardDescription>
                  Personalized dashboard to manage your farming information and track your journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Farm details and crop information</li>
                  <li>View your published blogs</li>
                  <li>Update your profile</li>
                  <li>Track your community contributions</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Why Choose AgriTell?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We understand the unique challenges faced by smallholder farmers in Africa. AgriTell was built 
                with your needs in mind—providing accessible, practical information that can help you make 
                informed decisions about your farm and your future.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're looking for the latest market prices, need advice on when to plant or harvest, 
                or want to connect with banks that offer agricultural loans, AgriTell is your trusted partner 
                in farming success.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;