
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Import pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Settings from "./pages/settings/Settings";
import History from "./pages/history/History";
import DeliveryAreas from "./pages/delivery/DeliveryAreas";
import PaymentMethods from "./pages/payment/PaymentMethods";
import PromotionalCodes from "./pages/promotions/PromotionalCodes";
import OnlineMenu from "./pages/menu/OnlineMenu";
import SystemBackup from "./pages/backup/SystemBackup";

// Client pages
import ClientMenu from "./pages/client/ClientMenu";
import Checkout from "./pages/client/Checkout";
import Success from "./pages/client/Success";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<History />} />
        <Route path="/delivery" element={<DeliveryAreas />} />
        <Route path="/payment" element={<PaymentMethods />} />
        <Route path="/promotions" element={<PromotionalCodes />} />
        <Route path="/menu" element={<OnlineMenu />} />
        <Route path="/backup" element={<SystemBackup />} />
        
        {/* Client Routes */}
        <Route path="/client" element={<ClientMenu />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
