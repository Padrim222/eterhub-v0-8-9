import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", path: "/home", enabled: true },
  { name: "IMOV", path: "/imov", enabled: true },
  { name: "Central do Cliente", path: "/central-cliente", enabled: true },
  { name: "Educação", path: "/educacao", enabled: true },
  { name: "Eterflow", path: "/etherflow", enabled: true },
  { name: "Tribes", path: "/tribes", enabled: true },
  { name: "Conteúdo", path: "/conteudo", enabled: true },
  { name: "Configurações", path: "/configuracoes", enabled: true },
];

export const AppNavigation = () => {
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
    </nav>
  );
};
