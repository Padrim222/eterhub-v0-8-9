import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppNavigation } from "@/components/layout/AppNavigation";
import { ProfileModal } from "@/components/layout/ProfileModal";
import eterLogo from "@/assets/eter-logo.png";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Imovi from "./Imovi";
import { ChannelsList } from "@/components/canais/ChannelsList";
import Leads from "./Leads";

const Home = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    setUserProfile(profile);
  };

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-6">
            <img src={eterLogo} alt="ETER" className="h-10 w-auto" />
            <AppNavigation />
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full border border-gray-800 hover:bg-gray-900">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-gray-800 hover:bg-gray-900">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar 
                className="border-2 border-gray-800 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <AvatarImage src={userProfile?.avatar_url || "/leader-default.png"} />
                <AvatarFallback>{userProfile?.nome?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="canais">Canais</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral">
            <Imovi />
          </TabsContent>
          
          <TabsContent value="canais">
            <ChannelsList onChannelSelect={() => {}} />
          </TabsContent>
          
          <TabsContent value="leads">
            <Leads />
          </TabsContent>
        </Tabs>
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={loadProfile}
      />
    </div>
  );
};

export default Home;
