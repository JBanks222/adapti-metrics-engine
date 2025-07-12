import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Accounts } from "@/pages/Accounts";
import { Automation } from "@/pages/Automation";
import { Reports } from "@/pages/Reports";
import SetupGuide from "@/pages/SetupGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthGuard>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/automation" element={<Automation />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/setup-guide" element={<SetupGuide />} />
                <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          </AuthGuard>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
