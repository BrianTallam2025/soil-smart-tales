import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Info from "./pages/Info";
import Market from "./pages/Market";
import Finance from "./pages/Finance";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import BlogModeration from "./pages/admin/BlogModeration";
import MarketManagement from "./pages/admin/MarketManagement";
import Analytics from "./pages/admin/Analytics";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/info" element={<Info />} />
          <Route path="/market" element={<Market />} />
          <Route path="/finance" element={<Finance />} />
          
          {/* Admin Routes */}
         // Replace your admin routes with:
<Route path="/admin" element={<AdminLogin />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/users" element={<UserManagement />} />
<Route path="/admin/blogs" element={<BlogModeration />} />
<Route path="/admin/markets" element={<MarketManagement />} />
<Route path="/admin/analytics" element={<Analytics />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;