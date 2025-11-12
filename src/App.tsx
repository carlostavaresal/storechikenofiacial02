
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SmartRedirect from "@/components/auth/SmartRedirect";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import OfflineIndicator from "@/components/common/OfflineIndicator";

// Import pages
import Auth from "@/pages/auth/Auth";
import Dashboard from "@/pages/dashboard/Dashboard";
import Products from "@/pages/products/Products";
import Orders from "@/pages/orders/Orders";
import Settings from "@/pages/settings/Settings";
import History from "@/pages/history/History";
import DeliveryAreas from "@/pages/delivery/DeliveryAreas";
import PaymentMethods from "@/pages/payment/PaymentMethods";
import PromotionalCodes from "@/pages/promotions/PromotionalCodes";
import OnlineMenu from "@/pages/menu/OnlineMenu";
import SystemBackup from "@/pages/backup/SystemBackup";

// Client pages
import ClientMenu from "@/pages/client/ClientMenu";
import Checkout from "@/pages/client/Checkout";
import Success from "@/pages/client/Success";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                 <Routes>
                   {/* Smart redirect based on authentication status */}
                   <Route path="/" element={<SmartRedirect />} />
                   
                   {/* Auth Routes */}
                   <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
                   
                   {/* Public Client Routes - No authentication required */}
                   <Route path="/client" element={<ClientMenu />} />
                   <Route path="/checkout" element={<Checkout />} />
                   <Route path="/success" element={<Success />} />
                   
                   {/* Protected Admin Routes */}
                   <Route 
                     path="/dashboard" 
                     element={
                       <ProtectedRoute>
                         <Dashboard />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/products" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <Products />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/orders" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <Orders />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/settings" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <Settings />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/history" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <History />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/delivery" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <DeliveryAreas />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/payment" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <PaymentMethods />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/promotions" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <PromotionalCodes />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/menu" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <OnlineMenu />
                       </ProtectedRoute>
                     } 
                   />
                   <Route 
                     path="/backup" 
                     element={
                       <ProtectedRoute requireAdmin>
                         <SystemBackup />
                       </ProtectedRoute>
                     } 
                   />
                   
                   {/* Catch all route - redirect to smart redirect */}
                   <Route path="*" element={<SmartRedirect />} />
                 </Routes>
                <OfflineIndicator />
              </div>
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
