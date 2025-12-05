import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAdminAuth() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);

        // Check if user has admin role using the has_role function
        const { data, error } = await supabase
          .rpc('has_role', { 
            _user_id: session.user.id, 
            _role: 'admin' 
          });

        if (error) {
          console.error("Error checking admin role:", error);
          navigate("/home");
          return;
        }

        if (!data) {
          navigate("/home");
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error("Error in admin auth check:", error);
        navigate("/home");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { isAdmin, isLoading, userId };
}
