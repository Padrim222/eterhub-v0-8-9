import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import eterLogo from "@/assets/eter-logo.png";

const navItems = [
  { label: "Overview", active: true },
  { label: "Insights IA", active: false },
  { label: "Educação", active: false },
  { label: "Suporte", active: false },
  { label: "Nuvem", active: false },
];

export const DashboardHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/30 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img src={eterLogo} alt="ETER" className="h-8 md:h-10 w-auto" />
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "outline" : "ghost"}
              size="sm"
              className="rounded-full border-border/40 hover:bg-muted/30"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
            <Search className="w-4 md:w-5 h-4 md:h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
            <Bell className="w-4 md:w-5 h-4 md:h-5" />
          </Button>
          <Avatar className="border-2 border-border/40 h-8 w-8 md:h-10 md:w-10">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};
