import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

const navigationItems = [
  { name: "Home", path: "/home", enabled: true },
  { name: "Central do Cliente", path: "/central-cliente", enabled: true },
  { name: "Educação", path: "/educacao", enabled: true },
  { name: "Eterflow", path: "/etherflow", enabled: true },
  { name: "Tribes", path: "/tribes", enabled: true },
  { name: "Conteúdo", path: "/conteudo", enabled: true },
  { name: "Configurações", path: "/configuracoes", enabled: true },
];

export const AppNavigation = () => {
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <nav className="flex items-center gap-8">
      {navigationItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "font-medium text-sm transition-colors relative pb-1",
              isActive
                ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {item.name}
        </NavLink>
      ))}
      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            cn(
              "font-medium text-sm transition-colors relative pb-1 flex items-center gap-1",
              isActive
                ? "text-yellow-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-yellow-400"
                : "text-yellow-400/70 hover:text-yellow-400"
            )
          }
        >
          <Shield className="w-4 h-4" />
          Admin
        </NavLink>
      )}
    </nav>
  );
};
