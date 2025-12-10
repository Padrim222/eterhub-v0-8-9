import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalProjects: number;
  totalActivities: number;
  usersWithOnboarding: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalPosts: 0,
    totalProjects: 0,
    totalActivities: 0,
    usersWithOnboarding: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      // Get users count
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, is_active, onboarding_completed");

      if (usersError) throw usersError;

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter(u => u.is_active !== false).length || 0;
      const inactiveUsers = totalUsers - activeUsers;
      const usersWithOnboarding = users?.filter(u => u.onboarding_completed).length || 0;

      // Get posts count
      const { count: postsCount, error: postsError } = await supabase
        .from("ig_posts")
        .select("*", { count: "exact", head: true });

      if (postsError) throw postsError;

      // Get projects count from client_project_data
      const { data: projectData, error: projectsError } = await supabase
        .from("client_project_data")
        .select("projetos");

      if (projectsError) throw projectsError;

      let totalProjects = 0;
      projectData?.forEach(pd => {
        if (Array.isArray(pd.projetos)) {
          totalProjects += pd.projetos.length;
        }
      });

      // Get activities count
      const { count: activitiesCount, error: activitiesError } = await supabase
        .from("client_activities")
        .select("*", { count: "exact", head: true });

      if (activitiesError) throw activitiesError;

      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalPosts: postsCount || 0,
        totalProjects,
        totalActivities: activitiesCount || 0,
        usersWithOnboarding,
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, isLoading, refetch: loadStats };
}
