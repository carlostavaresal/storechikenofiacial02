
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import DeliveryAreas from "./pages/delivery/DeliveryAreas";
import PaymentMethods from "./pages/payment/PaymentMethods";
import PromotionalCodes from "./pages/promotions/PromotionalCodes";
import OnlineMenu from "./pages/menu/OnlineMenu";
import History from "./pages/history/History";
import Settings from "./pages/settings/Settings";
import ThemeSettings from "./pages/settings/ThemeSettings";
import LoginSettings from "./pages/security/LoginSettings";
import SystemBackup from "./pages/backup/SystemBackup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Client-facing routes
import CardapioPage from "./pages/client/CardapioPage";
import Catalog from "./pages/client/Catalog";
import Checkout from "./pages/client/Checkout";
import Success from "./pages/client/Success";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Index /> },
      { path: "login", element: <Login /> },
      { 
        path: "dashboard", 
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "products", 
        element: (
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "orders", 
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "delivery", 
        element: (
          <ProtectedRoute>
            <DeliveryAreas />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "payment", 
        element: (
          <ProtectedRoute>
            <PaymentMethods />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "promotions", 
        element: (
          <ProtectedRoute>
            <PromotionalCodes />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "menu", 
        element: (
          <ProtectedRoute>
            <OnlineMenu />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "history", 
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "backup", 
        element: (
          <ProtectedRoute>
            <SystemBackup />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "settings", 
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "settings/theme", 
        element: (
          <ProtectedRoute>
            <ThemeSettings />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "security", 
        element: (
          <ProtectedRoute>
            <LoginSettings />
          </ProtectedRoute>
        ) 
      },
      
      // Client-facing routes (no authentication required)
      { path: "cardapio", element: <CardapioPage /> },
      { path: "catalog", element: <Catalog /> },
      { path: "checkout", element: <Checkout /> },
      { path: "success", element: <Success /> },
      
      { path: "*", element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
