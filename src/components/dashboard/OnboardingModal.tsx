import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
  const [instagramHandle, setInstagramHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Usuário não autenticado");

      // Remove @ se o usuário digitou
      const cleanHandle = instagramHandle.replace('@', '');

      // Atualiza o perfil do usuário com o @ do Instagram
      const { error } = await supabase
        .from('users')
        .update({ instagram_username: cleanHandle })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Seu perfil foi configurado. Agora vamos buscar seus dados do Instagram.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar informações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Bem-vindo ao IMOV!</DialogTitle>
          <DialogDescription>
            Para começar, precisamos do @ do seu Instagram para analisar suas métricas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="instagram">@ do Instagram</Label>
            <Input
              id="instagram"
              type="text"
              placeholder="@seuusuario"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !instagramHandle.trim()}
          >
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
