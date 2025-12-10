import { useState, useEffect } from "react";
import { Instagram, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InstagramImportCardProps {
  userProfile: any;
  onProfileUpdate: () => void;
}

export const InstagramImportCard = ({ userProfile, onProfileUpdate }: InstagramImportCardProps) => {
  const [instagramUsername, setInstagramUsername] = useState(userProfile?.instagram_username || "");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInstagramUsername(userProfile?.instagram_username || "");
  }, [userProfile]);

  const handleSaveUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('users')
        .update({ instagram_username: instagramUsername })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Instagram atualizado!",
        description: "Seu @ do Instagram foi salvo com sucesso.",
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImportData = async () => {
    if (!instagramUsername) {
      toast({
        title: "Atenção",
        description: "Por favor, insira seu @ do Instagram primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Salvar username primeiro se necessário
      if (userProfile?.instagram_username !== instagramUsername) {
        await supabase
          .from('users')
          .update({ instagram_username: instagramUsername })
          .eq('id', user.id);
      }

      // Chamar a edge function de scraping
      const { data, error } = await supabase.functions.invoke('scrape-instagram', {
        body: { username: instagramUsername }
      });

      if (error) throw error;

      toast({
        title: "Importação iniciada!",
        description: "Estamos importando seus dados do Instagram. Isso pode levar alguns minutos.",
      });

      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao importar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="bg-black border border-gray-800 rounded-3xl p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Instagram className="w-5 h-5 text-primary" />
          <h3 className="text-white font-semibold text-lg">Instagram</h3>
        </div>
        <p className="text-white/60 text-sm">Conecte seu Instagram para importar seus dados</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="instagram-username" className="text-white/80 text-sm">
            @ do Instagram
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="instagram-username"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              placeholder="seu_usuario"
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
            />
            <Button
              onClick={handleSaveUsername}
              variant="outline"
              className="border-gray-700 text-white/80 hover:bg-gray-800/50 hover:text-white rounded-xl"
            >
              Salvar
            </Button>
          </div>
        </div>

        <Button
          onClick={handleImportData}
          disabled={isImporting || !instagramUsername}
          className="w-full bg-primary text-black hover:bg-primary/90 rounded-xl py-6 text-base font-semibold"
        >
          <Download className="w-5 h-5 mr-2" />
          {isImporting ? "Importando..." : "IMPORTAR MOVIMENTO"}
        </Button>

        {userProfile?.instagram_username && (
          <p className="text-center text-gray-400 text-xs">
            Conectado: @{userProfile.instagram_username}
          </p>
        )}
      </div>
    </Card>
  );
};
