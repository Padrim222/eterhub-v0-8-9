import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from 'react-error-boundary';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Index from "./pages/Index";
import Home from "./pages/Home";
import Comunicacao from "./pages/Comunicacao";
import Imovi from "./pages/Imovi";
import Conteudo from "./pages/redes-sociais/Conteudo";
import Concorrentes from "./pages/redes-sociais/Concorrentes";
import Funil from "./pages/redes-sociais/Funil";
import Movqls from "./pages/Movqls";
import Vendas from "./pages/Vendas";
import Agenda from "./pages/Agenda";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription>
          <h3 className="font-semibold text-lg mb-2">Algo deu errado</h3>
          <p className="text-sm mb-4">{error.message}</p>
          <button 
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-background text-destructive rounded-md hover:bg-muted transition-colors border border-destructive"
          >
            Recarregar aplicação
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

const App = () => (
  <ErrorBoundary 
    FallbackComponent={ErrorFallback}
    onReset={() => window.location.href = '/'}
  >
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Home with sub-navigation (IMOV, MOVQL's, Vendas, Agenda) */}
            <Route path="/home" element={<Home />}>
              <Route path="imov" element={<Imovi />} />
              <Route path="movqls" element={<Movqls />} />
              <Route path="vendas" element={<Vendas />} />
              <Route path="agenda" element={<Agenda />} />
            </Route>
            
            {/* Comunicação with sub-navigation (Funil only) */}
            <Route path="/comunicacao" element={<Comunicacao />}>
              <Route path="funil" element={<Funil />} />
            </Route>
            
            {/* Legacy routes - redirects for backwards compatibility */}
            <Route path="/dashboard" element={<Navigate to="/home/imov" replace />} />
            <Route path="/imov" element={<Navigate to="/home/imov" replace />} />
            <Route path="/movqls" element={<Navigate to="/home/movqls" replace />} />
            <Route path="/vendas" element={<Navigate to="/home/vendas" replace />} />
            <Route path="/conteudo" element={<Navigate to="/home/imov" replace />} />
            <Route path="/concorrentes" element={<Navigate to="/home/imov" replace />} />
            <Route path="/redes-sociais/*" element={<Navigate to="/home/imov" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
