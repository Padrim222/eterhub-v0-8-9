import { Search, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const mockConcorrentes = [
  {
    id: 1,
    name: "@concorrente1",
    followers: 125000,
    engagement: 4.2,
    posts: 850,
    trend: "up",
    avatar: "/leader-default.png"
  },
  {
    id: 2,
    name: "@concorrente2",
    followers: 98000,
    engagement: 3.8,
    posts: 620,
    trend: "down",
    avatar: "/leader-default.png"
  },
];

const Concorrentes = () => {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Concorrentes</h1>
        <Button className="bg-primary text-black hover:bg-primary/90 rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Concorrente
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar concorrentes..."
            className="pl-10 bg-black border-gray-800 text-white placeholder:text-gray-500 rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockConcorrentes.map((concorrente) => (
          <Card key={concorrente.id} className="bg-black border-gray-800 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={concorrente.avatar} 
                  alt={concorrente.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-white font-semibold">{concorrente.name}</h3>
                  <p className="text-gray-400 text-sm">{concorrente.followers.toLocaleString()} seguidores</p>
                </div>
              </div>
              {concorrente.trend === "up" ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-gray-400 text-sm">Engajamento</p>
                <p className="text-white text-xl font-bold">{concorrente.engagement}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Posts</p>
                <p className="text-white text-xl font-bold">{concorrente.posts}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Concorrentes;
