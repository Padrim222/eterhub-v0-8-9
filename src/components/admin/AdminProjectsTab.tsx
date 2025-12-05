import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminProjects } from "@/hooks/useAdminProjects";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  planejado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  em_andamento: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  pausado: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  concluido: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelado: "bg-red-500/20 text-red-400 border-red-500/30",
  pendente: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  em_revisao: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  aprovado: "bg-green-500/20 text-green-400 border-green-500/30",
  rejeitado: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusLabels: Record<string, string> = {
  planejado: "Planejado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  pendente: "Pendente",
  em_revisao: "Em Revisão",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

export function AdminProjectsTab() {
  const { projects, entregas, isLoading } = useAdminProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredEntregas = entregas.filter(entrega => {
    const matchesSearch = 
      entrega.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrega.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entrega.user_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || entrega.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Buscar por nome, usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="projetos" className="w-full">
        <TabsList className="bg-muted">
          <TabsTrigger value="projetos">
            Projetos ({filteredProjects.length})
          </TabsTrigger>
          <TabsTrigger value="entregas">
            Entregas ({filteredEntregas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projetos" className="mt-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Nome</TableHead>
                  <TableHead className="text-foreground">Usuário</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Progresso</TableHead>
                  <TableHead className="text-foreground">Prioridade</TableHead>
                  <TableHead className="text-foreground">Data Alvo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {project.nome}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{project.user_nome}</p>
                        <p className="text-sm text-muted-foreground">{project.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[project.status] || ""}>
                        {statusLabels[project.status] || project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progresso} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">{project.progresso}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.prioridade}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {project.data_alvo 
                        ? format(new Date(project.data_alvo), "dd/MM/yyyy", { locale: ptBR })
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="entregas" className="mt-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Nome</TableHead>
                  <TableHead className="text-foreground">Usuário</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Data Alvo</TableHead>
                  <TableHead className="text-foreground">Data Entrega</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntregas.map((entrega) => (
                  <TableRow key={entrega.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {entrega.nome}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-foreground">{entrega.user_nome}</p>
                        <p className="text-sm text-muted-foreground">{entrega.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[entrega.status] || ""}>
                        {statusLabels[entrega.status] || entrega.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entrega.data_alvo 
                        ? format(new Date(entrega.data_alvo), "dd/MM/yyyy", { locale: ptBR })
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entrega.data_entrega 
                        ? format(new Date(entrega.data_entrega), "dd/MM/yyyy", { locale: ptBR })
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
