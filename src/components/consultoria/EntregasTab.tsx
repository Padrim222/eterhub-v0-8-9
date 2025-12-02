import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, CheckCircle, AlertCircle, Eye, MessageSquare, Pencil, Trash2, Loader2, FolderOpen } from "lucide-react";
import type { Entrega, ClientProjectData } from "@/hooks/useClientProjectData";

interface EntregasTabProps {
  data: ClientProjectData;
  setData: (data: ClientProjectData) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const statusConfig: Record<Entrega['status'], { icon: React.ElementType; color: string; label: string }> = {
  pendente: { icon: Clock, color: "bg-muted text-muted-foreground", label: "Pendente" },
  em_revisao: { icon: Eye, color: "bg-yellow-500/20 text-yellow-500", label: "Em Revisão" },
  aprovado: { icon: CheckCircle, color: "bg-green-500/20 text-green-500", label: "Aprovado" },
  rejeitado: { icon: AlertCircle, color: "bg-destructive/20 text-destructive", label: "Rejeitado" },
};

export const EntregasTab = ({ data, setData, onSave, isSaving }: EntregasTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntrega, setEditingEntrega] = useState<Entrega | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProjeto, setFilterProjeto] = useState<string>("all");
  const [formData, setFormData] = useState<Partial<Entrega>>({
    nome: "",
    descricao: "",
    projetoId: "",
    status: "pendente",
    dataPrevista: "",
    dataEntrega: null,
    feedback: "",
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      projetoId: "",
      status: "pendente",
      dataPrevista: "",
      dataEntrega: null,
      feedback: "",
    });
    setEditingEntrega(null);
  };

  const handleOpenDialog = (entrega?: Entrega) => {
    if (entrega) {
      setEditingEntrega(entrega);
      setFormData(entrega);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveEntrega = async () => {
    if (!formData.nome || !formData.projetoId) return;

    const newEntrega: Entrega = {
      id: editingEntrega?.id || crypto.randomUUID(),
      nome: formData.nome || "",
      descricao: formData.descricao || "",
      projetoId: formData.projetoId || "",
      status: formData.status || "pendente",
      dataPrevista: formData.dataPrevista || "",
      dataEntrega: formData.dataEntrega || null,
      feedback: formData.feedback || "",
    };

    const updatedEntregas = editingEntrega
      ? data.entregas.map(e => e.id === editingEntrega.id ? newEntrega : e)
      : [...data.entregas, newEntrega];

    setData({ ...data, entregas: updatedEntregas });
    setIsDialogOpen(false);
    resetForm();
    await onSave();
  };

  const handleDeleteEntrega = async (id: string) => {
    const updatedEntregas = data.entregas.filter(e => e.id !== id);
    setData({ ...data, entregas: updatedEntregas });
    await onSave();
  };

  const handleUpdateStatus = async (id: string, newStatus: Entrega['status']) => {
    const updatedEntregas = data.entregas.map(e =>
      e.id === id
        ? { ...e, status: newStatus, dataEntrega: newStatus === "aprovado" ? new Date().toISOString().split('T')[0] : e.dataEntrega }
        : e
    );
    setData({ ...data, entregas: updatedEntregas });
    await onSave();
  };

  const getProjetoNome = (projetoId: string) => {
    return data.projetos.find(p => p.id === projetoId)?.nome || "Projeto não encontrado";
  };

  const filteredEntregas = data.entregas.filter(e => {
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    if (filterProjeto !== "all" && e.projetoId !== filterProjeto) return false;
    return true;
  });

  const entregasPendentes = data.entregas.filter(e => e.status === "pendente" || e.status === "em_revisao").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Entregas</h2>
          <p className="text-sm text-muted-foreground">
            {entregasPendentes} entrega(s) pendente(s) • {data.entregas.length} total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusConfig).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterProjeto} onValueChange={setFilterProjeto}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Projetos</SelectItem>
              {data.projetos.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2" disabled={data.projetos.length === 0}>
                <Plus className="w-4 h-4" />
                Nova Entrega
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingEntrega ? "Editar Entrega" : "Nova Entrega"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Projeto</label>
                  <Select
                    value={formData.projetoId}
                    onValueChange={value => setFormData({ ...formData, projetoId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.projetos.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome da entrega"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <Textarea
                    value={formData.descricao}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição da entrega"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={value => setFormData({ ...formData, status: value as Entrega['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Data Prevista</label>
                    <Input
                      type="date"
                      value={formData.dataPrevista}
                      onChange={e => setFormData({ ...formData, dataPrevista: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Feedback</label>
                  <Textarea
                    value={formData.feedback}
                    onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Feedback ou observações"
                    rows={2}
                  />
                </div>
                <Button onClick={handleSaveEntrega} className="w-full" disabled={!formData.nome || !formData.projetoId}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editingEntrega ? "Salvar Alterações" : "Criar Entrega"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Aviso se não tem projetos */}
      {data.projetos.length === 0 && (
        <Card className="bg-card border-border p-6 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Crie um projeto primeiro para adicionar entregas.</p>
        </Card>
      )}

      {/* Lista de Entregas */}
      {data.projetos.length > 0 && filteredEntregas.length === 0 && (
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhuma entrega encontrada.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Clique em "Nova Entrega" para começar.</p>
        </Card>
      )}

      {filteredEntregas.length > 0 && (
        <div className="space-y-3">
          {filteredEntregas.map(entrega => {
            const StatusIcon = statusConfig[entrega.status].icon;
            return (
              <Card key={entrega.id} className="bg-card border-border p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${statusConfig[entrega.status].color}`}>
                    <StatusIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge className={statusConfig[entrega.status].color}>
                          {statusConfig[entrega.status].label}
                        </Badge>
                        <h3 className="font-semibold text-foreground mt-1">{entrega.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Projeto: {getProjetoNome(entrega.projetoId)}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(entrega)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEntrega(entrega.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {entrega.descricao && (
                      <p className="text-sm text-muted-foreground mt-2">{entrega.descricao}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {entrega.dataPrevista && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Prazo: {entrega.dataPrevista}
                        </span>
                      )}
                      {entrega.dataEntrega && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Entregue: {entrega.dataEntrega}
                        </span>
                      )}
                    </div>

                    {entrega.feedback && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                          {entrega.feedback}
                        </p>
                      </div>
                    )}

                    {/* Ações rápidas de status */}
                    {entrega.status !== "aprovado" && (
                      <div className="flex gap-2 mt-3">
                        {entrega.status === "pendente" && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(entrega.id, "em_revisao")}>
                            <Eye className="w-4 h-4 mr-1" /> Enviar para Revisão
                          </Button>
                        )}
                        {entrega.status === "em_revisao" && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-500" onClick={() => handleUpdateStatus(entrega.id, "aprovado")}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleUpdateStatus(entrega.id, "rejeitado")}>
                              <AlertCircle className="w-4 h-4 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                        {entrega.status === "rejeitado" && (
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(entrega.id, "em_revisao")}>
                            <Eye className="w-4 h-4 mr-1" /> Reenviar para Revisão
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
