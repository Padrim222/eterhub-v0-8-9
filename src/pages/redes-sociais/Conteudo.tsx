import { useState, useMemo } from "react";
import { LayoutGrid, List, Search as SearchIcon, SlidersHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PostsGrid } from "@/components/conteudo/PostsGrid";
import { PostsTable } from "@/components/conteudo/PostsTable";
import { InstagramMetrics } from "@/components/conteudo/InstagramMetrics";
import { useInstagramPosts } from "@/hooks/useInstagramPosts";

const Conteudo = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeTab, setActiveTab] = useState("all");
  const { posts, isLoading } = useInstagramPosts();

  const filteredPosts = useMemo(() => {
    if (activeTab === "all") return posts;
    return posts.filter(post => {
      if (activeTab === "reels") return post.post_type === "VIDEO" || post.post_type === "CAROUSEL_ALBUM";
      if (activeTab === "posts") return post.post_type === "IMAGE";
      if (activeTab === "stories") return post.post_type === "STORY";
      return true;
    });
  }, [posts, activeTab]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Conteúdo</h1>
        <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              className="pl-10 bg-black border-gray-800 text-white placeholder:text-gray-500 rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-gray-800 bg-black text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 bg-black border border-gray-800 rounded-xl p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-gray-800" : "text-gray-400 hover:text-white hover:bg-gray-800"}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-gray-800" : "text-gray-400 hover:text-white hover:bg-gray-800"}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <InstagramMetrics posts={posts} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="bg-transparent border-b border-gray-800 rounded-none h-auto p-0 w-full justify-start mb-6">
          <TabsTrigger 
            value="all" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="reels" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
          >
            Reels
          </TabsTrigger>
          <TabsTrigger 
            value="posts" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="stories" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-6 py-3"
          >
            Stories
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {viewMode === "grid" ? (
            <PostsGrid posts={filteredPosts} isLoading={isLoading} error={null} />
          ) : (
            <PostsTable posts={filteredPosts} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Conteudo;
