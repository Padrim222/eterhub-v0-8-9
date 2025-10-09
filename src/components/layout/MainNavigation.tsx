import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart3, Share2, Target, ShoppingBag, Calendar } from "lucide-react";

const navigationItems = [
  { name: "IMOV", path: "/home/imov", icon: BarChart3 },
  { name: "MOVQL's", path: "/home/movqls", icon: Target },
  { name: "Vendas", path: "/home/vendas", icon: ShoppingBag },
];

export const MainNavigation = () => {
  return (
    <nav className="flex items-center justify-center gap-3">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 flex items-center gap-2 border",
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        );
      })}
    </nav>
  );
};
