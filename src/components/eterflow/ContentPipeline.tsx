import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Play,
    Loader2,
    Check,
    X,
    Edit3,
    ChevronRight,
    BarChart3,
    Lightbulb,
    Search,
    FileText,
    PenTool,
    Sparkles,
    RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PipelineStage {
    id: string;
    name: string;
    icon: React.ReactNode;
    status: 'pending' | 'running' | 'completed' | 'editing' | 'approved';
    output: string;
    llm: string;
    isTouchpoint: boolean;
}

interface ContentPipelineProps {
    workflowId?: string;
    brandIdentity?: any;
}

export function ContentPipeline({ workflowId, brandIdentity }: ContentPipelineProps) {
    const { toast } = useToast();
    const [isRunning, setIsRunning] = useState(false);
    const [currentStage, setCurrentStage] = useState(0);
    const [stages, setStages] = useState<PipelineStage[]>([
        {
            id: "analysis",
            name: "Análise de Métricas",
            icon: <BarChart3 className="w-5 h-5" />,
            status: "pending",
            output: "",
            llm: "Claude 3 Haiku",
            isTouchpoint: false
        },
        {
            id: "ideation",
            name: "Ideação & Tendências",
            icon: <Lightbulb className="w-5 h-5" />,
            status: "pending",
            output: "",
            llm: "Gemini 2.0 Flash",
            isTouchpoint: true
        },
        {
            id: "research",
            name: "Pesquisa Profunda",
            icon: <Search className="w-5 h-5" />,
            status: "pending",
            output: "",
            llm: "Perplexity Sonar",
            isTouchpoint: false
        },
        {
            id: "narrative",
            name: "Arquitetura de Narrativa",
            icon: <FileText className="w-5 h-5" />,
            status: "pending",
            output: "",
            llm: "Claude 3.5 Sonnet",
            isTouchpoint: true
        },
        {
            id: "writing",
            name: "Escrita & Humanização",
            icon: <PenTool className="w-5 h-5" />,
            status: "pending",
            output: "",
            llm: "Gemini 2.0 Pro",
            isTouchpoint: true
        }
    ]);
    const [editingStage, setEditingStage] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState("");
    const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

    const updateStageStatus = (stageId: string, status: PipelineStage['status'], output?: string) => {
        setStages(prev => prev.map(stage =>
            stage.id === stageId
                ? { ...stage, status, output: output ?? stage.output }
                : stage
        ));
    };

    const runStage = async (stageIndex: number) => {
        const stage = stages[stageIndex];
        updateStageStatus(stage.id, 'running');

        try {
            // Get previous stage output as context
            let context = "";
            if (stageIndex > 0) {
                context = stages[stageIndex - 1].output;
            }

            // Get user session
            const { data: { user } } = await supabase.auth.getUser();

            // Get brand identity if available
            let brandIdentityData = null;
            if (user) {
                const { data } = await (supabase
                    .from('brand_identities' as any) as any)
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(1)
                    .maybeSingle();
                brandIdentityData = data;
            }

            // Call Edge Function via OpenRouter
            const { data, error } = await supabase.functions.invoke('content-pipeline', {
                body: {
                    action: 'run_stage',
                    stage_id: stage.id,
                    user_id: user?.id,
                    context: context,
                    brand_identity: brandIdentityData
                }
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error || 'Unknown error');

            const output = data.output;
            const llmName = data.llm || stage.llm;

            // Update stage with real LLM response
            setStages(prev => prev.map(s =>
                s.id === stage.id
                    ? {
                        ...s,
                        status: s.isTouchpoint ? 'editing' : 'completed',
                        output,
                        llm: llmName
                    }
                    : s
            ));

            toast({
                title: `${stage.name} concluída!`,
                description: stage.isTouchpoint
                    ? `Via ${llmName}. Revise e aprove para continuar.`
                    : `Processado via ${llmName}.`,
            });

        } catch (error: any) {
            console.error('Stage error:', error);

            // Fallback to mock data on error
            const mockOutput = getMockOutput(stage.id);

            updateStageStatus(stage.id, stage.isTouchpoint ? 'editing' : 'completed', mockOutput);

            toast({
                title: `${stage.name} (Modo Demo)`,
                description: error.message?.includes('OPENROUTER')
                    ? "Configure OPENROUTER_API_KEY para usar LLMs reais."
                    : "Usando dados de exemplo.",
                variant: "destructive"
            });
        }
    };

    const getMockOutput = (stageId: string): string => {
        switch (stageId) {
            case "analysis":
                return `# Relatório de Inteligência de Conteúdo (DEMO)

## Top 10 Conteúdos de Alta Performance

| Rank | Tema | Score | Gatilhos |
|------|------|-------|----------|
| 1 | Polêmica sobre algoritmos | 92 | Emotional Arousal, Narrative Tension |
| 2 | Bastidores do mercado | 88 | Social Currency, Identity |
| 3 | Dados contraintuitivos | 85 | Cognitive Fluency, Curiosity |

## Padrões Identificados
- **Estrutura:** Gancho polêmico + 3 insights + CTA de salvamento
- **Tom:** Direto, provocativo, com dados específicos
- **Formato:** Carrossel 7-10 slides funciona melhor

> ⚠️ Este é um resultado de demonstração. Configure OPENROUTER_API_KEY para resultados reais.`;

            case "ideation":
                return `# Matriz de Ideação de Conteúdo Viral (DEMO)

## 10 Temas com Alto Potencial

1. **A falência do marketing de autoridade** - Score: 9.2
   - Gatilhos: Narrative Tension, Social Currency
   
2. **Por que ninguém lê seu conteúdo** - Score: 8.8
   - Gatilhos: Emotional Arousal, Identity Reinforcement

3. **O algoritmo não é seu inimigo** - Score: 8.5
   - Gatilhos: Cognitive Fluency, Contraste

4. **Seu concorrente cresce e você não** - Score: 8.3
   - Gatilhos: Anxiety, Social Proof

5. **A era dos carrosséis morreu?** - Score: 8.1
   - Gatilhos: Curiosity Gap, Narrative Tension

> ⚠️ Modo demonstração ativo.`;

            case "research":
                return `# Mapa de Conteúdo (DEMO)

## Dados Numéricos de Impacto
- **73% dos usuários** ignoram conteúdo de "especialistas" (Nielsen, 2024)
- **2.3s** é o tempo médio de atenção em feeds sociais
- **340% mais compartilhamentos** para conteúdo que desafia o status quo

## Cases Relevantes
- **Duolingo no TikTok:** Abandonou o tom "educacional" e viralizou

## A Voz do Povo
- "Cansei de guru vendendo curso" - Comentário viral

> ⚠️ Modo demonstração ativo.`;

            case "narrative":
                return `# Esqueleto de Roteiro Estratégico (DEMO)

**Formato:** Carrossel 8 slides

## Estrutura AIDA

| Bloco | Objetivo | Premissa |
|-------|----------|----------|
| **ATENÇÃO** | Criar gap de curiosidade | Curiosidade + Contraste |
| **INTERESSE** | Conexão emocional | Prova Social |
| **DESEJO** | Solução desejável | Especificidade |
| **AÇÃO** | CTA de baixo atrito | N/A |

> ⚠️ Modo demonstração ativo.`;

            case "writing":
                return `# Roteiro Final (DEMO)

## Slide 1 (GANCHO)
**73% das pessoas IGNORAM seu conteúdo.**

## Slide 2
A era do "guru" acabou.

## Slide 3
O Duolingo entendeu isso.

## Slide 4
O algoritmo não recompensa AUTORIDADE.
Ele recompensa RELEVÂNCIA.

## Slide 5-8
[Conteúdo completo disponível com API configurada]

---

## Style Checker: 8.5/10 ✅

> ⚠️ Configure OPENROUTER_API_KEY para roteiros completos.`;

            default:
                return "Conteúdo processado em modo demo.";
        }
    }

    const startPipeline = async () => {
        setIsRunning(true);
        setCurrentStage(0);

        // Reset all stages
        setStages(prev => prev.map(stage => ({ ...stage, status: 'pending', output: '' })));

        // Run first stage
        await runStage(0);
        setCurrentStage(1);
    };

    const approveStage = async (stageId: string) => {
        updateStageStatus(stageId, 'approved');

        const currentIndex = stages.findIndex(s => s.id === stageId);

        if (currentIndex < stages.length - 1) {
            setCurrentStage(currentIndex + 1);
            await runStage(currentIndex + 1);
        } else {
            setIsRunning(false);
            toast({
                title: "Pipeline Concluída! 🎉",
                description: "Seu conteúdo está pronto para publicação.",
            });
        }
    };

    const rejectAndEdit = (stageId: string) => {
        setEditingStage(stageId);
        const stage = stages.find(s => s.id === stageId);
        if (stage) {
            setEditedContent(stage.output);
        }
    };

    const saveEdit = (stageId: string) => {
        updateStageStatus(stageId, 'editing', editedContent);
        setEditingStage(null);
        setEditedContent("");
    };

    const regenerateStage = async (stageId: string) => {
        const stageIndex = stages.findIndex(s => s.id === stageId);
        if (stageIndex >= 0) {
            await runStage(stageIndex);
        }
    };

    const getStatusColor = (status: PipelineStage['status']) => {
        switch (status) {
            case 'completed':
            case 'approved':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'running':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'editing':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusLabel = (status: PipelineStage['status']) => {
        switch (status) {
            case 'completed': return 'Concluído';
            case 'approved': return 'Aprovado';
            case 'running': return 'Processando...';
            case 'editing': return 'Aguardando Revisão';
            default: return 'Pendente';
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Pipeline de Conteúdo
                    </h2>
                    <p className="text-white/60 text-sm">5 agentes trabalhando em equipe para criar seu conteúdo</p>
                </div>

                <Button
                    onClick={startPipeline}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-primary to-pink-600 hover:opacity-90"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            Iniciar Pipeline
                        </>
                    )}
                </Button>
            </div>

            {/* Pipeline Stages Visual */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {stages.map((stage, index) => (
                    <div key={stage.id} className="flex items-center">
                        <div
                            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all cursor-pointer
                ${stage.status === 'running' ? 'animate-pulse' : ''}
                ${getStatusColor(stage.status)}
                ${stage.isTouchpoint ? 'ring-2 ring-primary/30' : ''}
              `}
                            onClick={() => stage.output && setCurrentStage(index)}
                        >
                            {stage.status === 'running' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : stage.status === 'approved' || stage.status === 'completed' ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                stage.icon
                            )}
                            <span className="text-sm font-medium whitespace-nowrap">{stage.name}</span>
                            {stage.isTouchpoint && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/50 text-primary">
                                    TP
                                </Badge>
                            )}
                        </div>
                        {index < stages.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-white/30 mx-1" />
                        )}
                    </div>
                ))}
            </div>

            {/* Stage Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* Stage List */}
                <Card className="bg-black/40 border-white/10 p-4 overflow-hidden">
                    <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                        <span>Estágios</span>
                        <Badge variant="outline" className="text-[10px]">
                            {stages.filter(s => s.status === 'approved' || s.status === 'completed').length}/{stages.length}
                        </Badge>
                    </h3>
                    <ScrollArea className="h-[calc(100%-2rem)]">
                        <div className="space-y-2 pr-2">
                            {stages.map((stage, index) => (
                                <div
                                    key={stage.id}
                                    className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${currentStage === index ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/20'}
                  `}
                                    onClick={() => stage.output && setCurrentStage(index)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {stage.icon}
                                            <span className="text-sm font-medium text-white">{stage.name}</span>
                                        </div>
                                        <Badge className={`text-[10px] ${getStatusColor(stage.status)}`}>
                                            {getStatusLabel(stage.status)}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-white/40">
                                        <span>LLM: {stage.llm}</span>
                                        {stage.isTouchpoint && (
                                            <span className="text-primary">• Touchpoint</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Output Preview */}
                <Card className="lg:col-span-2 bg-black/40 border-white/10 p-4 flex flex-col overflow-hidden">
                    {stages[currentStage]?.output ? (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {stages[currentStage].icon}
                                    <h3 className="text-sm font-medium text-white">
                                        {stages[currentStage].name}
                                    </h3>
                                    <Badge className={`text-[10px] ${getStatusColor(stages[currentStage].status)}`}>
                                        {getStatusLabel(stages[currentStage].status)}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    {stages[currentStage].status === 'editing' && (
                                        <>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => regenerateStage(stages[currentStage].id)}
                                                className="text-xs"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Regenerar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => rejectAndEdit(stages[currentStage].id)}
                                                className="text-xs"
                                            >
                                                <Edit3 className="w-3 h-3 mr-1" />
                                                Editar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => approveStage(stages[currentStage].id)}
                                                className="text-xs bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="w-3 h-3 mr-1" />
                                                Aprovar
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {editingStage === stages[currentStage].id ? (
                                <div className="flex-1 flex flex-col gap-2">
                                    <Textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="flex-1 bg-black/60 border-white/10 text-white font-mono text-sm resize-none"
                                        placeholder="Edite o conteúdo..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingStage(null)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => saveEdit(stages[currentStage].id)}
                                        >
                                            Salvar Edição
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <ScrollArea className="flex-1">
                                    <div className="prose prose-invert prose-sm max-w-none pr-4">
                                        <pre className="whitespace-pre-wrap text-sm text-white/80 font-sans leading-relaxed">
                                            {stages[currentStage].output}
                                        </pre>
                                    </div>
                                </ScrollArea>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-white/40">
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Inicie a pipeline para ver os resultados</p>
                                <p className="text-sm mt-1">Cada agente vai processar uma etapa</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
