import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [contentType, setContentType] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (step === 1 && !instagramHandle.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha o @ do Instagram",
        variant: "destructive"
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // 1. Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // 2. Limpar e validar handle do Instagram
      const cleanHandle = instagramHandle.replace('@', '').trim();

      if (!cleanHandle || cleanHandle.length < 3) {
        throw new Error('Instagram handle inválido (mínimo 3 caracteres)');
      }

      // 3. USAR UPSERT ao invés de UPDATE (garante que salva mesmo se não existir)
      // Salva o @ como nome do líder também
      const { error } = await supabase
        .from('users')
        .upsert({ 
          id: user.id,
          instagram_username: cleanHandle,
          nome: cleanHandle,
          onboarding_completed: true,
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      // 4. Sucesso!
      toast({
        title: "✅ Configuração salva!",
        description: `Instagram @${cleanHandle} vinculado com sucesso.`,
      });

      onComplete();
      
    } catch (error: any) {
      console.error('❌ Erro no onboarding:', error);
      
      toast({
        variant: "destructive",
        title: "❌ Erro ao salvar configuração",
        description: error.message || "Tente novamente em alguns instantes.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {step === 1 && "Bem-vindo ao IMOV!"}
            {step === 2 && "Tipo de Conteúdo"}
            {step === 3 && "Geração de Leads"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Para começar, precisamos do @ do seu Instagram"}
            {step === 2 && "Que tipo de conteúdo você produz?"}
            {step === 3 && "Onde você gera seus leads?"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {step === 1 && (
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
          )}

          {step === 2 && (
            <div>
              <Label htmlFor="contentType">Tipo de Conteúdo</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reels">Reels</SelectItem>
                  <SelectItem value="posts">Posts Estáticos</SelectItem>
                  <SelectItem value="stories">Stories</SelectItem>
                  <SelectItem value="carrossel">Carrossel</SelectItem>
                  <SelectItem value="misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 3 && (
            <div>
              <Label htmlFor="leadSource">Onde gera leads?</Label>
              <Select value={leadSource} onValueChange={setLeadSource}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bio">Link na Bio</SelectItem>
                  <SelectItem value="dm">DM / Direct</SelectItem>
                  <SelectItem value="stories">Stories (Links)</SelectItem>
                  <SelectItem value="comentarios">Comentários</SelectItem>
                  <SelectItem value="anuncios">Anúncios Pagos</SelectItem>
                  <SelectItem value="webinar">Webinar / Lives</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                Voltar
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              className="flex-1" 
              disabled={loading || (step === 1 && !instagramHandle.trim())}
            >
              {loading ? "Salvando..." : step === 3 ? "Finalizar" : "Próximo"}
            </Button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

