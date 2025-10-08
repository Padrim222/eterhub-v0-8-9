import { Outlet } from "react-router-dom";
import { MainNavigation } from "@/components/layout/MainNavigation";
import { SubNavigation } from "@/components/layout/SubNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const subNavItems = [
  { name: "Conteúdo", path: "/redes-sociais/conteudo" },
  { name: "Concorrentes", path: "/redes-sociais/concorrentes" },
  { name: "Funil", path: "/redes-sociais/funil" },
];

const RedesSociais = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    loadUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-4">
          <img src="/src/assets/eter-logo.png" alt="Eter" className="h-8" />
          <MainNavigation />
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
            <Avatar>
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-primary text-black">
                {userProfile?.full_name?.[0] || userProfile?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <SubNavigation items={subNavItems} />
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RedesSociais;
