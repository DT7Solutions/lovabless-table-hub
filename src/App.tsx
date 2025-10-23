import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "@/components/admin/AdminLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import StaffManagement from "./pages/admin/StaffManagement";
import MenuManagement from "./pages/admin/MenuManagement";
import TableManagement from "./pages/admin/TableManagement";
import DeviceManagement from "./pages/admin/DeviceManagement";
import WaiterDashboard from "./pages/WaiterDashboard";
import ChefDashboard from "./pages/ChefDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Waiter Routes */}
              <Route path="/waiter" element={<WaiterDashboard />} />
              
              {/* Chef Routes */}
              <Route path="/chef" element={<ChefDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="tables" element={<TableManagement />} />
                <Route path="devices" element={<DeviceManagement />} />
                <Route path="bookings" element={<div className="text-center text-muted-foreground py-12">Bookings page coming soon...</div>} />
                <Route path="orders" element={<div className="text-center text-muted-foreground py-12">Orders page coming soon...</div>} />
                <Route path="reports" element={<div className="text-center text-muted-foreground py-12">Reports page coming soon...</div>} />
                <Route path="settings" element={<div className="text-center text-muted-foreground py-12">Settings page coming soon...</div>} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
