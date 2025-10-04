import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, History } from "lucide-react";

const Finance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchChatHistory(session.user.id);
      }
    });
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchChatHistory = async (userId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setChatHistory(data);
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    setLoading(true);
    const userMessage = message;
    setMessage("");
    setConversation([...conversation, { role: "user", content: userMessage }]);

    try {
      const userContext = profile ? 
        `Region: ${profile.region}, Main crops: ${profile.main_crops?.join(', ')}, Farm size: ${profile.farm_size}` 
        : "";

      const { data, error } = await supabase.functions.invoke('farm-advisor', {
        body: { message: userMessage, userContext }
      });

      if (error) throw error;

      const aiResponse = data.response;
      setConversation(prev => [...prev, { role: "assistant", content: aiResponse }]);

      // Save to history
      await supabase.from('chat_messages').insert({
        user_id: user.id,
        message: userMessage,
        response: aiResponse,
      });

      fetchChatHistory(user.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">AI Farm Advisor</h1>
              <p className="text-muted-foreground">Get personalized farming and financial guidance</p>
            </div>
            <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" />
              {showHistory ? "Hide" : "Show"} History
            </Button>
          </div>

          {showHistory && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Your chat history with the AI advisor</CardDescription>
              </CardHeader>
              <CardContent>
                {chatHistory.length > 0 ? (
                  <div className="space-y-4">
                    {chatHistory.map((chat) => (
                      <Card key={chat.id} className="bg-muted/30">
                        <CardContent className="pt-4">
                          <p className="text-sm font-medium mb-2">You: {chat.message}</p>
                          <p className="text-sm text-muted-foreground">AI: {chat.response.substring(0, 150)}...</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(chat.created_at).toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No chat history yet</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat with AI Advisor
              </CardTitle>
              <CardDescription>
                Describe your farming scenario and get expert advice on planting, harvesting, financial planning, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {conversation.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="mb-2">Start a conversation!</p>
                    <p className="text-sm">Example: "I'm from Bomet growing coffee. When should I plant for the rainy season?"</p>
                  </div>
                )}
                {conversation.map((msg, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                    <p className="text-sm font-medium mb-1">{msg.role === 'user' ? 'You' : 'AI Advisor'}</p>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your situation... (e.g., region, crops, challenges)"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={loading || !message.trim()} size="icon" className="h-auto">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Mention your region, crop type, and farm size</li>
                <li>Be specific about your challenges or questions</li>
                <li>Ask about seasonal advice, pest control, or financial planning</li>
                <li>The AI can recommend banks and credit options</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Finance;