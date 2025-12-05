import { ClipboardList, Paperclip, User } from "lucide-react";
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
import type { Entrega } from "@/hooks/useClientProjectData";

interface AtividadesTableProps {
  entregas: Entrega[];
  onChange?: (entregas: Entrega[]) => void;
}

const statusConfig = {
  pendente: { label: "Não Iniciado", color: "border border-gray-500 text-gray-400 bg-transparent" },
  em_revisao: { label: "Em Andamento", color: "border border-green-500 text-green-400 bg-transparent" },
  aprovado: { label: "Concluído", color: "bg-green-500 text-black" },
  rejeitado: { label: "Atrasado", color: "border border-red-500 text-red-400 bg-transparent" },
};

const prioridadeConfig = {
  alta: { label: "Alta", color: "border border-red-500 text-red-400 bg-transparent" },
  media: { label: "Média", color: "border border-yellow-500 text-yellow-400 bg-transparent" },
  baixa: { label: "Baixa", color: "border border-green-500 text-green-400 bg-transparent" },
};

// Map entregas to atividades format
const mapEntregasToAtividades = (entregas: Entrega[]) => {
  return entregas.map((entrega) => ({
    id: entrega.id,
    nome: entrega.nome,
    responsavel: "Equipe",
    prazo: entrega.dataPrevista,
    status: entrega.status,
    anexo: entrega.feedback ? "Feedback.pdf" : undefined,
    prioridade: "media" as const,
  }));
};

// Default activities if no entregas exist
const defaultAtividades = [
  { id: "1", nome: "Revisar estratégia de marketing", responsavel: "Ana Silva", prazo: "15/12/2025", status: "em_revisao" as const, anexo: "Estrategia.pdf", prioridade: "alta" as const },
  { id: "2", nome: "Atualizar landing page", responsavel: "Carlos Mendes", prazo: "18/12/2025", status: "pendente" as const, anexo: undefined, prioridade: "media" as const },
  { id: "3", nome: "Criar campanha de email", responsavel: "Maria Costa", prazo: "20/12/2025", status: "aprovado" as const, anexo: "Campanha.xlsx", prioridade: "baixa" as const },
  { id: "4", nome: "Análise de concorrentes", responsavel: "João Lima", prazo: "10/12/2025", status: "rejeitado" as const, anexo: "Analise.docx", prioridade: "alta" as const },
];

export const AtividadesTable = ({ entregas, onChange }: AtividadesTableProps) => {
  const atividades = entregas.length > 0 ? mapEntregasToAtividades(entregas) : defaultAtividades;

  return (
    <Card className="bg-gray-900 border-gray-800 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-800">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-white">Atividades</h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-800/50 hover:bg-gray-800/50 border-gray-700">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="text-white/60 font-medium">Atividade</TableHead>
            <TableHead className="text-white/60 font-medium">Responsável</TableHead>
            <TableHead className="text-white/60 font-medium">Prazo</TableHead>
            <TableHead className="text-white/60 font-medium">Status</TableHead>
            <TableHead className="text-white/60 font-medium">Anexo</TableHead>
            <TableHead className="text-white/60 font-medium">Prioridade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {atividades.map((atividade) => (
            <TableRow key={atividade.id} className="border-gray-700 hover:bg-white/5">
              <TableCell>
                <Checkbox 
                  checked={atividade.status === "aprovado"}
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
                      {atividade.responsavel.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white/80 text-sm">{atividade.responsavel}</span>
                </div>
              </TableCell>
              <TableCell className="text-white/60 text-sm">
                {atividade.prazo}
              </TableCell>
              <TableCell>
                <Badge className={`${statusConfig[atividade.status].color} border-0`}>
                  {statusConfig[atividade.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                {atividade.anexo ? (
                  <div className="flex items-center gap-1 text-primary text-sm">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{atividade.anexo}</span>
                  </div>
                ) : (
                  <span className="text-white/40 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={`${prioridadeConfig[atividade.prioridade].color} border-0`}>
                  {prioridadeConfig[atividade.prioridade].label}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
