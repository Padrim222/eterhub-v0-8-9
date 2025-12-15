import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { name: "Home", path: "/home", enabled: true },
  { name: "Central do Cliente", path: "/central-cliente", enabled: true },
  { name: "Eterflow", path: "/eterflow", enabled: true },
  { name: "Educação", path: "/educacao", enabled: true },
  { name: "Tribes", path: "/tribes", enabled: true },
  { name: "Conteúdo", path: "/conteudo", enabled: true },
  { name: "Integrações", path: "/integracoes", enabled: true },
  { name: "Configurações", path: "/configuracoes", enabled: true },
];

const NavItem = ({ item, onClick }: { item: typeof navigationItems[0]; onClick?: () => void }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "font-medium text-sm transition-colors relative pb-1 block py-2 md:py-0",
        isActive
          ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
          : "text-muted-foreground hover:text-foreground"
      )
    }
  >
    {item.name}
  </NavLink>
);

const AdminNavItem = ({ onClick }: { onClick?: () => void }) => (
  <NavLink
    to="/admin"
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        "font-medium text-sm transition-colors relative pb-1 flex items-center gap-1 py-2 md:py-0",
        isActive
          ? "text-yellow-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-yellow-400"
          : "text-yellow-400/70 hover:text-yellow-400"
      )
    }
  >
    <Shield className="w-4 h-4" />
    Admin
  </NavLink>
);

export const AppNavigation = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });

      setIsAdmin(!!data);
    };

    checkAdminRole();
  }, []);

  const closeSheet = () => setIsOpen(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-6">
        {navigationItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
        {isAdmin && <AdminNavItem />}
      </nav>

      {/* Mobile Navigation - Hamburger Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="rounded-full border border-gray-800 hover:bg-gray-900">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 bg-black/95 border-l border-gray-800 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <span className="text-sm font-semibold text-white">Menu</span>
              <SheetClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-900">
                  <X className="w-4 h-4" />
                </Button>
              </SheetClose>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} onClick={closeSheet} />
              ))}
              {isAdmin && <AdminNavItem onClick={closeSheet} />}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
