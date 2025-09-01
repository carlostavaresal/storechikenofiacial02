
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import OfflineIndicator from "@/components/common/OfflineIndicator";

// Import pages
import Login from "@/pages/auth/Login";
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
                  {/* Redirect root to login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  
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
                      <ProtectedRoute>
                        <Products />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/orders" 
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/delivery" 
                    element={
                      <ProtectedRoute>
                        <DeliveryAreas />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/payment" 
                    element={
                      <ProtectedRoute>
                        <PaymentMethods />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/promotions" 
                    element={
                      <ProtectedRoute>
                        <PromotionalCodes />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/menu" 
                    element={
                      <ProtectedRoute>
                        <OnlineMenu />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/backup" 
                    element={
                      <ProtectedRoute>
                        <SystemBackup />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Public Client Routes */}
                  <Route path="/client" element={<ClientMenu />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/success" element={<Success />} />
                  
                  {/* Catch all route - redirect to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
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
