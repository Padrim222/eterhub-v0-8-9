import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface LeaderBannerProps {
  userProfile?: any;
  onEdit?: () => void;
}

export const LeaderBanner = ({ userProfile, onEdit }: LeaderBannerProps) => {
  return (
    <Card className="bg-card-dark border-border rounded-3xl overflow-hidden hover:border-primary/30 transition-all">
      <div className="relative h-48 bg-gradient-to-r from-card-darker to-card-dark flex items-center justify-center group">
        {/* Placeholder para imagem futura */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="w-16 h-16 text-muted-foreground/30" />
        </div>
        
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            onClick={onEdit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Camera className="w-4 h-4 mr-2" />
            Personalizar Banner
          </Button>
        </div>

        {/* Info do líder (opcional) */}
        {userProfile && (
          <div className="absolute bottom-6 left-6 z-10">
            <h3 className="text-foreground text-2xl font-bold">{userProfile.name || 'Líder'}</h3>
            <p className="text-muted-foreground text-sm">@{userProfile.username || 'username'}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
