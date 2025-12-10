import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

import { AppNavigation } from "./AppNavigation";
import { ProfileModal } from "./ProfileModal";
import eterLogo from "@/assets/eter-logo.png";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showTitle?: boolean;
  headerActions?: ReactNode;
}

export const PageLayout = ({ children, title, showTitle = true, headerActions }: PageLayoutProps) => {
  const { userProfile, isLoading, refetch } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-gray-800 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-6">
              <Link to="/home">
                <img src={eterLogo} alt="ETER" className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>
        <main className="p-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between mb-6">
            <Link to="/home">
              <img src={eterLogo} alt="ETER" className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
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
        {showTitle && title && (
          <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">{title}</h1>
            {headerActions}
          </div>
        )}
        <div className={showTitle ? "max-w-7xl mx-auto" : ""}>
          {children}
        </div>
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdate={refetch}
      />
    </div>
  );
};
