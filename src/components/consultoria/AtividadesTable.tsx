import { Paperclip, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { Entrega } from "@/hooks/useClientProjectData";

interface AtividadesTableProps {
  entregas: Entrega[];
  onChange?: (entregas: Entrega[]) => void;
}

type StatusType = "pendente" | "em_revisao" | "aprovado" | "rejeitado";
type PrioridadeType = "baixa" | "media" | "alta";

const statusConfig: Record<StatusType, { label: string; color: string; hasIcon: boolean }> = {
  pendente: { label: "Não Iniciado", color: "border border-gray-500 text-gray-400 bg-transparent rounded-lg px-3 py-1", hasIcon: false },
  em_revisao: { label: "Em Andamento", color: "border border-blue-500 text-blue-400 bg-transparent rounded-lg px-3 py-1", hasIcon: false },
  aprovado: { label: "Concluído", color: "bg-green-500 text-black rounded-lg px-3 py-1", hasIcon: false },
  rejeitado: { label: "Atrasado", color: "border border-red-500 text-red-400 bg-transparent rounded-lg px-3 py-1", hasIcon: true },
};

const prioridadeConfig: Record<PrioridadeType, { label: string; color: string }> = {
  alta: { label: "Alta", color: "border border-red-500 text-red-400 bg-transparent rounded-lg px-3 py-1" },
  media: { label: "Média", color: "border border-yellow-500 text-yellow-400 bg-transparent rounded-lg px-3 py-1" },
  baixa: { label: "Baixa", color: "border border-green-500 text-green-400 bg-transparent rounded-lg px-3 py-1" },
};

// Default activities if no entregas exist
const defaultAtividades: Entrega[] = [
  { id: "1", projetoId: "", nome: "Revisar estratégia de marketing", descricao: "", dataPrevista: "15/12/2025", dataEntrega: null, status: "em_revisao", prioridade: "alta", feedback: "Estrategia.pdf" },
  { id: "2", projetoId: "", nome: "Atualizar landing page", descricao: "", dataPrevista: "18/12/2025", dataEntrega: null, status: "pendente", prioridade: "media", feedback: "" },
  { id: "3", projetoId: "", nome: "Criar campanha de email", descricao: "", dataPrevista: "20/12/2025", dataEntrega: null, status: "aprovado", prioridade: "baixa", feedback: "Campanha.xlsx" },
  { id: "4", projetoId: "", nome: "Análise de concorrentes", descricao: "", dataPrevista: "10/12/2025", dataEntrega: null, status: "rejeitado", prioridade: "alta", feedback: "Analise.docx" },
];

export const AtividadesTable = ({ entregas, onChange }: AtividadesTableProps) => {
  const atividades = entregas.length > 0 ? entregas : defaultAtividades;

  const handleStatusChange = (id: string, newStatus: StatusType) => {
    const updatedEntregas = atividades.map(e => 
      e.id === id ? { ...e, status: newStatus } : e
    );
    onChange?.(updatedEntregas);
  };

  const handlePrioridadeChange = (id: string, newPrioridade: PrioridadeType) => {
    const updatedEntregas = atividades.map(e => 
      e.id === id ? { ...e, prioridade: newPrioridade } : e
    );
    onChange?.(updatedEntregas);
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newStatus: StatusType = checked ? "aprovado" : "pendente";
    handleStatusChange(id, newStatus);
  };

  return (
    <Card className="bg-card-dark border-gray-700 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Atividades</h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-card-dark hover:bg-card-dark border-gray-700">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="text-white font-medium">Atividade</TableHead>
            <TableHead className="text-white font-medium">Responsável</TableHead>
            <TableHead className="text-white font-medium">Prazo</TableHead>
            <TableHead className="text-white font-medium">Status</TableHead>
            <TableHead className="text-white font-medium">Anexo</TableHead>
            <TableHead className="text-white font-medium">Prioridade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {atividades.map((atividade) => (
            <TableRow key={atividade.id} className="border-gray-700 hover:bg-white/5">
              <TableCell>
                <Checkbox 
                  checked={atividade.status === "aprovado"}
                  onCheckedChange={(checked) => handleCheckboxChange(atividade.id, !!checked)}
                  className="border-gray-600"
                />
              </TableCell>
              <TableCell className="font-medium text-white">
                {atividade.nome}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-gray-700 text-white text-xs">
                      EQ
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white/80 text-sm">Equipe</span>
                </div>
              </TableCell>
              <TableCell className="text-white/60 text-sm">
                {atividade.dataPrevista}
              </TableCell>
              <TableCell>
                <Select 
                  value={atividade.status} 
                  onValueChange={(value: StatusType) => handleStatusChange(atividade.id, value)}
                >
                  <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto focus:ring-0">
                    <Badge className={statusConfig[atividade.status].color}>
                      {statusConfig[atividade.status].hasIcon && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {statusConfig[atividade.status].label}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="pendente" className="text-gray-400 hover:bg-gray-700">
                      Não Iniciado
                    </SelectItem>
                    <SelectItem value="em_revisao" className="text-blue-400 hover:bg-gray-700">
                      Em Andamento
                    </SelectItem>
                    <SelectItem value="aprovado" className="text-green-400 hover:bg-gray-700">
                      Concluído
                    </SelectItem>
                    <SelectItem value="rejeitado" className="text-red-400 hover:bg-gray-700">
                      Atrasado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {atividade.feedback ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span className="text-white/80 truncate max-w-[100px]">{atividade.feedback}</span>
                  </div>
                ) : (
                  <span className="text-white/40 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <Select 
                  value={atividade.prioridade || "media"} 
                  onValueChange={(value: PrioridadeType) => handlePrioridadeChange(atividade.id, value)}
                >
                  <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto focus:ring-0">
                    <Badge className={prioridadeConfig[atividade.prioridade || "media"].color}>
                      {prioridadeConfig[atividade.prioridade || "media"].label}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="baixa" className="text-green-400 hover:bg-gray-700">
                      Baixa
                    </SelectItem>
                    <SelectItem value="media" className="text-yellow-400 hover:bg-gray-700">
                      Média
                    </SelectItem>
                    <SelectItem value="alta" className="text-red-400 hover:bg-gray-700">
                      Alta
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
