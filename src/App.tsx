import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import CreateJob from "./pages/CreateJob";
import JobDetail from "./pages/JobDetail";
import Apply from "./pages/Apply";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/apply/:jobId" element={<Apply />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/dashboard/candidates" element={<ProtectedRoute><Candidates /></ProtectedRoute>} />
            <Route path="/dashboard/jobs/new" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
            <Route path="/dashboard/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
