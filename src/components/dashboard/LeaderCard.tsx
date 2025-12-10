import { useState, useEffect } from "react";
import { Upload, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeaderCardProps {
  userProfile: any;
  onProfileUpdate: () => void;
}

export const LeaderCard = ({ userProfile, onProfileUpdate }: LeaderCardProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [leaderName, setLeaderName] = useState(userProfile?.nome || "");
  const [avatarUrl, setAvatarUrl] = useState(userProfile?.avatar_url || "/leader-default.png");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLeaderName(userProfile?.nome || "");
    setAvatarUrl(userProfile?.avatar_url || "/leader-default.png");
  }, [userProfile]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Para este exemplo, vamos usar uma URL de dados temporária
    // Em produção, você faria upload para o Supabase Storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('users')
        .update({
          nome: leaderName,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      setIsEditOpen(false);
      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Card className="bg-black border border-gray-800 rounded-3xl p-6">
        <div className="mb-4">
          <h3 className="text-white/60 text-sm mb-1">Líder</h3>
          <p className="text-white font-semibold text-lg">{leaderName || "Seu Nome"}</p>
        </div>

        <Button
          variant="outline"
          className="w-full py-3 mb-4 border border-gray-700 rounded-xl text-white/80 text-sm hover:bg-gray-800/50 hover:text-white transition-all"
          onClick={() => setIsEditOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Alterar Foto e Nome
        </Button>

        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900">
          <img
            src={avatarUrl}
            alt={leaderName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/leader-default.png";
            }}
          />
        </div>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Editar Perfil do Líder</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-4 border-primary/20">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-black rounded-full cursor-pointer hover:bg-primary/90 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-400">Clique no ícone para alterar a foto</p>
            </div>

            <div>
              <Label htmlFor="leader-name" className="text-white">Nome do Líder</Label>
              <Input
                id="leader-name"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Digite seu nome"
                className="mt-2 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isUploading}
              className="w-full bg-primary text-black hover:bg-primary/90"
            >
              {isUploading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
