import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Instagram, Youtube, ChevronRight, Users, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";
import { supabase } from "@/integrations/supabase/client";

interface Channel {
  id: string;
  name: string;
  username: string;
  platform: "instagram" | "youtube" | "tiktok";
  followers: number;
  totalPosts: number;
  avgEngagement: number;
}

interface ChannelsListProps {
  onChannelSelect: (channel: Channel) => void;
  selectedChannelId?: string;
}

export const ChannelsList = ({ onChannelSelect, selectedChannelId }: ChannelsListProps) => {
  const { toast } = useToast();
  const { posts } = useInstagramPosts();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState<{
    name: string;
    username: string;
    platform: "instagram" | "youtube" | "tiktok";
  }>({
    name: "",
    username: "",
    platform: "instagram"
  });

  // Buscar dados reais do perfil
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        setUserProfile(profile);

        if (profile?.instagram_username) {
          // Calcular métricas reais dos posts
          const totalPosts = posts.length;
          const avgEngagement = totalPosts > 0
            ? posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / totalPosts
            : 0;

          setChannels([{
            id: user.id,
            name: profile.nome || "Instagram",
            username: profile.instagram_username,
            platform: "instagram",
            followers: (profile as any).instagram_followers || 0,
            totalPosts,
            avgEngagement: Number(avgEngagement.toFixed(1))
          }]);
        }
      }
    };

    loadUserProfile();
  }, [posts]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram": return <Instagram className="w-5 h-5" />;
      case "youtube": return <Youtube className="w-5 h-5" />;
      default: return <Instagram className="w-5 h-5" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleAddChannel = () => {
    if (!newChannel.name || !newChannel.username) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome e o username do canal",
        variant: "destructive"
      });
      return;
    }

    const channel: Channel = {
      id: Date.now().toString(),
      name: newChannel.name,
      username: newChannel.username,
      platform: newChannel.platform,
      followers: 0,
      totalPosts: 0,
      avgEngagement: 0
    };

    setChannels([...channels, channel]);
    setNewChannel({ name: "", username: "", platform: "instagram" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Canal adicionado",
      description: `${channel.name} foi adicionado com sucesso`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Meus Canais</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Canal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-border">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Canal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Plataforma</Label>
                <Select
                  value={newChannel.platform}
                  onValueChange={(value) =>
                    setNewChannel({ ...newChannel, platform: value as "instagram" | "youtube" | "tiktok" })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Canal</Label>
                <Input
                  id="name"
                  placeholder="Ex: Davi Ribas"
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Ex: @daviribas"
                  value={newChannel.username}
                  onChange={(e) => setNewChannel({ ...newChannel, username: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleAddChannel} className="w-full">
                Adicionar Canal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <Card
            key={channel.id}
            className={`bg-background border-border rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
              selectedChannelId === channel.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => onChannelSelect(channel)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {getPlatformIcon(channel.platform)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">{channel.username}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <Users className="w-3 h-3" />
                    <p className="text-xs">Seguidores</p>
                  </div>
                  <p className="text-lg font-bold">{formatNumber(channel.followers)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Posts</p>
                  <p className="text-lg font-bold">{channel.totalPosts}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-muted-foreground mb-1">
                    <TrendingUp className="w-3 h-3" />
                    <p className="text-xs">Eng.</p>
                  </div>
                  <p className="text-lg font-bold">{channel.avgEngagement}%</p>
                </div>
              </div>

              <Badge variant="secondary" className="w-full justify-center">
                Ver Detalhes
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
