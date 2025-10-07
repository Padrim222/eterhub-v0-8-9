import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "DASHBOARD", path: "/dashboard", enabled: true },
  { name: "Conteúdo", path: "/conteudo", enabled: true },
  { name: "Deep Research", path: "#", enabled: false },
  { name: "Oratória", path: "#", enabled: false },
  { name: "Tribes.ai", path: "#", enabled: false },
];

export const AppNavigation = () => {
  return (
    <nav className="flex items-center gap-8">
      {navigationItems.map((item) => {
        if (!item.enabled) {
          return (
            <button
              key={item.name}
              disabled
              className="text-muted-foreground/40 cursor-not-allowed font-medium text-sm"
            >
              {item.name}
            </button>
          );
        }

        return (
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
        );
      })}
    </nav>
  );
};
