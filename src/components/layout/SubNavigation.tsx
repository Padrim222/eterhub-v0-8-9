import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SubNavigationItem {
  name: string;
  path: string;
}

interface SubNavigationProps {
  items: SubNavigationItem[];
}

export const SubNavigation = ({ items }: SubNavigationProps) => {
  return (
    <nav className="flex items-center gap-8 border-b border-gray-800 px-8">
      {items.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end
          className={({ isActive }) =>
            cn(
              "font-medium text-sm transition-colors relative pb-3",
              isActive
                ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-gray-400 hover:text-white"
            )
          }
        >
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};
