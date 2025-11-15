import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
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
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        loadProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { userProfile, isLoading, refetch: loadProfile };
}
