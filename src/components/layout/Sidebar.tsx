
import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  MapPin,
  CreditCard,
  ClipboardList,
  Palette,
  Menu,
  X,
  Lock,
  BookOpen,
  BadgePercent,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSidebar = () => {
    setIsCollapsed(true);
  };

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Pedidos", path: "/orders", icon: ShoppingCart },
    { name: "Produtos", path: "/products", icon: Package },
    { name: "Áreas de Entrega", path: "/delivery", icon: MapPin },
    { name: "Métodos de Pagamento", path: "/payment", icon: CreditCard },
    { name: "Códigos Promocionais", path: "/promotions", icon: BadgePercent },
    { name: "Cardápio Online", path: "/menu", icon: BookOpen },
    { name: "Histórico", path: "/history", icon: ClipboardList },
    { name: "Configurações", path: "/settings", icon: Settings },
    { name: "Tema", path: "/settings/theme", icon: Palette },
    { name: "Segurança", path: "/security", icon: Lock },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={closeSidebar}
        />
      )}
      
      <aside
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50",
          // Desktop styles
          !isMobile && (isCollapsed ? "w-16" : "w-60"),
          // Mobile styles
          isMobile && "fixed inset-y-0 left-0 w-64",
          isMobile && isCollapsed && "-translate-x-full",
          isMobile && !isCollapsed && "translate-x-0",
          "h-screen overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              {!isCollapsed && (
                <span className="font-bold text-lg">Store Chicken</span>
              )}
            </Link>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => isMobile && closeSidebar()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle button for desktop */}
        {!isMobile && (
          <div className="p-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSidebar}
              className="w-full"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <Menu className="h-4 w-4 mr-2" />}
              {!isCollapsed && "Recolher"}
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      {isMobile && isCollapsed && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
