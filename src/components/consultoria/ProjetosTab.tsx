import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, User, Tag, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Projeto, ClientProjectData } from "@/hooks/useClientProjectData";

interface ProjetosTabProps {
  data: ClientProjectData;
  setData: (data: ClientProjectData) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const statusColors: Record<Projeto['status'], string> = {
  planejado: "bg-muted text-muted-foreground",
  em_andamento: "bg-primary/20 text-primary",
  pausado: "bg-yellow-500/20 text-yellow-500",
  concluido: "bg-green-500/20 text-green-500",
  cancelado: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<Projeto['status'], string> = {
  planejado: "Planejado",
  em_andamento: "Em Andamento",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const prioridadeColors: Record<Projeto['prioridade'], string> = {
  baixa: "bg-muted text-muted-foreground",
  media: "bg-blue-500/20 text-blue-400",
  alta: "bg-orange-500/20 text-orange-400",
  urgente: "bg-red-500/20 text-red-400",
};

export const ProjetosTab = ({ data, setData, onSave, isSaving }: ProjetosTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null);
  const [formData, setFormData] = useState<Partial<Projeto>>({
    nome: "",
    descricao: "",
    status: "planejado",
    prioridade: "media",
    progresso: 0,
    dataInicio: "",
    dataFim: "",
    responsavel: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      status: "planejado",
      prioridade: "media",
      progresso: 0,
      dataInicio: "",
      dataFim: "",
      responsavel: "",
      tags: [],
    });
    setTagInput("");
    setEditingProjeto(null);
  };

  const handleOpenDialog = (projeto?: Projeto) => {
    if (projeto) {
      setEditingProjeto(projeto);
      setFormData(projeto);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveProjeto = async () => {
    if (!formData.nome) return;

    const newProjeto: Projeto = {
      id: editingProjeto?.id || crypto.randomUUID(),
      nome: formData.nome || "",
      descricao: formData.descricao || "",
      status: formData.status || "planejado",
      prioridade: formData.prioridade || "media",
      progresso: formData.progresso || 0,
      dataInicio: formData.dataInicio || "",
      dataFim: formData.dataFim || "",
      responsavel: formData.responsavel || "",
      tags: formData.tags || [],
    };

    const updatedProjetos = editingProjeto
      ? data.projetos.map(p => p.id === editingProjeto.id ? newProjeto : p)
      : [...data.projetos, newProjeto];

    setData({ ...data, projetos: updatedProjetos });
    setIsDialogOpen(false);
    resetForm();
    await onSave();
  };

  const handleDeleteProjeto = async (id: string) => {
    const updatedProjetos = data.projetos.filter(p => p.id !== id);
    const updatedEntregas = data.entregas.filter(e => e.projetoId !== id);
    setData({ ...data, projetos: updatedProjetos, entregas: updatedEntregas });
    await onSave();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || [],
    });
  };

  const projetosAtivos = data.projetos.filter(p => p.status !== "concluido" && p.status !== "cancelado");
  const projetosConcluidos = data.projetos.filter(p => p.status === "concluido");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Projetos</h2>
          <p className="text-sm text-muted-foreground">
            {projetosAtivos.length} projeto(s) ativo(s) • {projetosConcluidos.length} concluído(s)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProjeto ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nome</label>
                <Input
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do projeto"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Descrição</label>
                <Textarea
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do projeto"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={value => setFormData({ ...formData, status: value as Projeto['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Prioridade</label>
                  <Select
                    value={formData.prioridade}
                    onValueChange={value => setFormData({ ...formData, prioridade: value as Projeto['prioridade'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Progresso: {formData.progresso}%</label>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progresso}
                  onChange={e => setFormData({ ...formData, progresso: parseInt(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Data Início</label>
                  <Input
                    type="date"
                    value={formData.dataInicio}
                    onChange={e => setFormData({ ...formData, dataInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Data Fim</label>
                  <Input
                    type="date"
                    value={formData.dataFim}
                    onChange={e => setFormData({ ...formData, dataFim: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Responsável</label>
                <Input
                  value={formData.responsavel}
                  onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Tags</label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveProjeto} className="w-full" disabled={!formData.nome}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProjeto ? "Salvar Alterações" : "Criar Projeto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de Projetos */}
      {data.projetos.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <p className="text-muted-foreground">Nenhum projeto cadastrado.</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Clique em "Novo Projeto" para começar.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.projetos.map(projeto => (
            <Card key={projeto.id} className="bg-card border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge className={statusColors[projeto.status]}>
                    {statusLabels[projeto.status]}
                  </Badge>
                  <Badge className={`ml-2 ${prioridadeColors[projeto.prioridade]}`}>
                    {projeto.prioridade}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(projeto)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteProjeto(projeto.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{projeto.nome}</h3>
                {projeto.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{projeto.descricao}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="text-foreground font-medium">{projeto.progresso}%</span>
                </div>
                <Progress value={projeto.progresso} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {projeto.dataFim && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {projeto.dataFim}
                  </span>
                )}
                {projeto.responsavel && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {projeto.responsavel}
                  </span>
                )}
              </div>

              {projeto.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {projeto.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
