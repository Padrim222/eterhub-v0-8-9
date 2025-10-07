import { useState } from "react";
import { Bell, Search, Plus, Filter, Grid3x3, List } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppNavigation } from "@/components/layout/AppNavigation";
import eterLogo from "@/assets/eter-logo.png";

const Conteudo = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <img src={eterLogo} alt="ETER" className="h-10 w-auto" />
            <AppNavigation />
          </div>

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
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-12 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-5xl font-bold tracking-tight">Conteúdo</h1>
            
            <Button className="gap-2">
              <Plus className="w-5 h-5" />
              Novo Conteúdo
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Buscar conteúdo..."
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>

              <div className="flex items-center gap-1 border border-border/40 rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-border/30">
            <button className="pb-3 border-b-2 border-primary font-semibold text-foreground">
              Todos
            </button>
            <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
              Rascunhos
            </button>
            <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
              Publicados
            </button>
            <button className="pb-3 text-muted-foreground hover:text-foreground transition-colors">
              Agendados
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20">
          <Card className="p-12 text-center max-w-md border-dashed border-2">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-10 h-10 text-muted-foreground" />
            </div>
            
            <h3 className="text-2xl font-bold mb-3">Nenhum conteúdo ainda</h3>
            <p className="text-muted-foreground mb-6">
              Comece a criar seu primeiro conteúdo e gerencie suas publicações de forma eficiente.
            </p>
            
            <Button className="gap-2">
              <Plus className="w-5 h-5" />
              Criar Primeiro Conteúdo
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Conteudo;
