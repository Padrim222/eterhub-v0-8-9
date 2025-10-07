import { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import eterLogo from "@/assets/eter-logo.png";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={eterLogo} alt="ETER" className="h-10 w-auto" />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-full border-border/40 hover:bg-muted/30">
                Overview
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                Insights IA
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                Educação
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                Suporte
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                Nuvem
              </Button>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-border/40 hover:bg-muted/30">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar className="border-2 border-border/40">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 container mx-auto px-6 space-y-6">
        {children}
      </main>
    </div>
  );
}
