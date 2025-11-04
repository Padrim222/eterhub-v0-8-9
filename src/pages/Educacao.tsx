import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppNavigation } from "@/components/layout/AppNavigation";
import eterLogo from "@/assets/eter-logo.png";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

const Educacao = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
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

    checkAuth();
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
              <Avatar className="border-2 border-gray-800">
                <AvatarImage src={userProfile?.avatar_url || "/leader-default.png"} />
                <AvatarFallback>{userProfile?.nome?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Educação</h1>
          <Card className="bg-gray-900 border-gray-800 p-8">
            <p className="text-white/60">Conteúdo em desenvolvimento...</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Educacao;
