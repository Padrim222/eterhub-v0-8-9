import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, OnNodesChange, applyNodeChanges, ReactFlowProvider, BackgroundVariant } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode } from './nodes/AgentNode';
import { TriggerNode } from './nodes/TriggerNode';
import { PromptNode } from './nodes/PromptNode';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, FolderOpen, Play, Loader2, Terminal, Sparkles, BookOpen, Check, Edit3, RefreshCw, X, Eye, Pencil, ArrowRight, Zap, Clock, Copy, CheckCircle2 } from "lucide-react";
import { useFlowPersistence } from '@/hooks/useFlowPersistence';
import { useFlowExecution } from '@/hooks/useFlowExecution';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeProperties } from './NodeProperties';
import { OutputNode } from './nodes/OutputNode';
import { eterflowTemplate } from "@/lib/templates";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialNodes: Node[] = [
    { id: '1', type: 'trigger', position: { x: 50, y: 100 }, data: { label: 'Start' } },
    { id: '2', type: 'prompt', position: { x: 300, y: 100 }, data: { label: 'User Input', prompt: 'Analyze the market trends for AI agents.' } },
    { id: '3', type: 'agent', position: { x: 600, y: 50 }, data: { label: 'Researcher', model: 'gpt-4o' } },
    { id: '4', type: 'output', position: { x: 900, y: 100 }, data: { label: 'Final Output' } },
];
const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#fff' } },
    { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#fff' } },
    { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#fff' } }
];

// Enhanced Touchpoint Modal with optimized UX
function TouchpointModal({
    isOpen,
    onClose,
    nodeData,
    output,
    onApprove,
    onRegenerate,
    isRegenerating,
    stageNumber,
    totalStages
}: {
    isOpen: boolean;
    onClose: () => void;
    nodeData: any;
    output: string;
    onApprove: (editedOutput: string) => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
    stageNumber?: number;
    totalStages?: number;
}) {
    const [editedOutput, setEditedOutput] = useState(output);
    const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setEditedOutput(output);
        setActiveTab('preview');
    }, [output]);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(editedOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleQuickApprove = () => {
        onApprove(editedOutput);
        toast({
            title: "✅ Aprovado!",
            description: "Continuando para o próximo agente...",
        });
    };

    // Simple markdown-like rendering for preview
    const renderFormattedOutput = (text: string) => {
        return text.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{line.replace('# ', '')}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-white/90 mt-5 mb-2 border-b border-white/10 pb-2">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold text-white/80 mt-4 mb-2">{line.replace('### ', '')}</h3>;
            }
            // Bold text
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className="text-gray-300 my-1">
                        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
                    </p>
                );
            }
            // List items
            if (line.startsWith('- ') || line.startsWith('* ')) {
                return <li key={i} className="text-gray-300 ml-4 my-1 list-disc">{line.replace(/^[-*] /, '')}</li>;
            }
            // Numbered items
            if (/^\d+\. /.test(line)) {
                return <li key={i} className="text-gray-300 ml-4 my-1 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
            }
            // Table rows (simple)
            if (line.startsWith('|')) {
                const cells = line.split('|').filter(c => c.trim());
                if (cells.every(c => c.includes('---'))) return null;
                return (
                    <div key={i} className="flex gap-2 py-1 border-b border-white/5 text-sm">
                        {cells.map((cell, j) => (
                            <span key={j} className={`flex-1 ${j === 0 ? 'text-white/60' : 'text-white'}`}>
                                {cell.trim()}
                            </span>
                        ))}
                    </div>
                );
            }
            // Empty lines
            if (!line.trim()) return <div key={i} className="h-2" />;
            // Regular paragraphs
            return <p key={i} className="text-gray-300 my-1">{line}</p>;
        });
    };

    const roleColors: Record<string, string> = {
        strategist: 'from-yellow-500 to-orange-500',
        architect: 'from-orange-500 to-red-500',
        copywriter: 'from-pink-500 to-rose-500',
        default: 'from-purple-500 to-pink-500'
    };

    const gradientColor = roleColors[nodeData?.agentRole] || roleColors.default;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-white/10 backdrop-blur-xl overflow-hidden">
                {/* Header with gradient accent */}
                <div className={`bg-gradient-to-r ${gradientColor} p-[1px]`}>
                    <div className="bg-slate-950 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-lg`}>
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold text-white">{nodeData?.label || 'Agent Output'}</h2>
                                        <Badge className={`bg-gradient-to-r ${gradientColor} border-0 text-white`}>
                                            Touchpoint {stageNumber || ''}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {nodeData?.llm || 'OpenRouter'}
                                        </span>
                                        {stageNumber && totalStages && (
                                            <span>• Etapa {stageNumber} de {totalStages}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick actions */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="border-white/10 hover:bg-white/5"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="hover:bg-white/5"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs for Preview/Edit */}
                <div className="px-6 pt-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'edit')}>
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-black/40 border border-white/5">
                                <TabsTrigger value="preview" className="data-[state=active]:bg-white/10 gap-2">
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </TabsTrigger>
                                <TabsTrigger value="edit" className="data-[state=active]:bg-white/10 gap-2">
                                    <Pencil className="w-4 h-4" />
                                    Editar
                                </TabsTrigger>
                            </TabsList>

                            {/* Regenerate button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRegenerate}
                                disabled={isRegenerating}
                                className="border-white/10 hover:bg-white/5"
                            >
                                {isRegenerating ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Regenerar com IA
                            </Button>
                        </div>

                        <TabsContent value="preview" className="mt-0">
                            <ScrollArea className="h-[55vh] pr-4">
                                <div className="bg-black/30 rounded-xl p-6 border border-white/5">
                                    {renderFormattedOutput(editedOutput)}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="edit" className="mt-0">
                            <ScrollArea className="h-[55vh]">
                                <Textarea
                                    value={editedOutput}
                                    onChange={(e) => setEditedOutput(e.target.value)}
                                    className="min-h-[50vh] bg-black/30 border-white/5 text-white font-mono text-sm resize-none rounded-xl"
                                    placeholder="Edite o output do agente..."
                                />
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer with prominent approve button */}
                <div className={`bg-gradient-to-r ${gradientColor} p-[1px] mt-4`}>
                    <div className="bg-slate-950 px-6 py-4 flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                            Revise o conteúdo e clique em <strong className="text-white">Aprovar</strong> para continuar
                        </p>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="text-gray-400 hover:text-white hover:bg-white/5"
                            >
                                Fechar
                            </Button>
                            <Button
                                onClick={handleQuickApprove}
                                className={`bg-gradient-to-r ${gradientColor} hover:opacity-90 text-white px-6 shadow-lg transition-all hover:scale-105`}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Aprovar e Continuar
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function FlowBuilder() {
    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [flowName, setFlowName] = useState("Meu Fluxo");
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

    const { saveWorkflow, loadWorkflows, isLoading: isSaving } = useFlowPersistence();
    const { runWorkflow, isExecuting, executionLogs, executionStatus } = useFlowExecution();
    const { toast } = useToast();

    // Flora-style execution state
    const [isRunningPipeline, setIsRunningPipeline] = useState(false);
    const [currentExecutingNode, setCurrentExecutingNode] = useState<string | null>(null);
    const [touchpointModal, setTouchpointModal] = useState<{
        isOpen: boolean;
        nodeId: string | null;
        output: string;
        stageNumber: number;
    }>({ isOpen: false, nodeId: null, output: '', stageNumber: 0 });
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Ref to store touchpoint approval callback
    const touchpointResolveRef = useRef<((output: string) => void) | null>(null);

    useEffect(() => {
        if (executionStatus === 'completed') {
            const finalLog = executionLogs.find(log => log.message.startsWith('FINAL RESULT:'));
            if (finalLog) {
                const result = finalLog.message.replace('FINAL RESULT:', '').trim();
                setNodes(nds => nds.map(n => {
                    if (n.type === 'output') {
                        return { ...n, data: { ...n.data, output: result } };
                    }
                    return n;
                }));
            }
        }
    }, [executionStatus, executionLogs, setNodes]);

    const nodeTypes = useMemo(() => ({ agent: AgentNode, trigger: TriggerNode, prompt: PromptNode, output: OutputNode }), []);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#fff' } }, eds)),
        [setEdges],
    );

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNodeId(null);
    }, []);

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    const updateNodeData = (key: string, value: string) => {
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === selectedNodeId) {
                    return { ...n, data: { ...n.data, [key]: value } };
                }
                return n;
            })
        );
    };

    // Update node status
    const updateNodeStatus = (nodeId: string, status: string, output?: string) => {
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === nodeId) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            status,
                            output: output ?? n.data.output
                        }
                    };
                }
                return n;
            })
        );
    };

    // Run single agent via Edge Function (with fallback to direct call)
    const runAgentNode = async (node: Node, context: string): Promise<string> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
<<<<<<< HEAD
=======

            // Get brand identity
            let brandIdentity = null;
            if (user) {
                const { data } = await (supabase
                    .from('brand_identities' as any) as any)
                    .select('*')
                    .eq('user_id', user.id)
                    .limit(1)
                    .maybeSingle();
                brandIdentity = data;
            }

>>>>>>> 5442674aa30024cf9bf479b084aeb08c6c27021a
            const role = node.data.agentRole as string || 'observer';

            console.log(`[${role}] Trying Edge Function run-agent...`);

            // Try Edge Function first
            try {
                const { data, error } = await supabase.functions.invoke('run-agent', {
                    body: { role, context, user_id: user?.id }
                });

                if (error) throw error;
                if (!data?.success) throw new Error(data?.error || 'Invalid response');

                console.log(`[${role}] Edge Function success.`);
                return data.output || 'Sem output';
            } catch (edgeFnError: any) {
                console.warn(`[${role}] Edge Function failed, using direct call:`, edgeFnError.message);

                // Fallback to direct OpenRouter call
                return await runAgentDirectly(node, context, user?.id);
            }

        } catch (error: any) {
            console.error('[runAgentNode] Error:', error);
            return `[Erro] ${node.data.label}\n\n${error.message}`;
        }
    };

    // Direct call to OpenRouter (fallback when Edge Function not available)
    const runAgentDirectly = async (node: Node, context: string, userId?: string): Promise<string> => {
        const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

        if (!OPENROUTER_API_KEY) {
            return `[Configuração Necessária]\n\nPara usar os agentes, configure:\n\n**Opção 1 (Recomendada):** Deploy da Edge Function\n- Execute: npx supabase functions deploy run-agent\n- Configure OPENROUTER_API_KEY nos secrets\n\n**Opção 2 (Desenvolvimento):** Adicionar no .env\n- VITE_OPENROUTER_API_KEY=sua_chave`;
        }

        // Get brand identity
        let brandIdentity = null;
        if (userId) {
            const { data } = await supabase
                .from('brand_identities')
                .select('*')
                .eq('user_id', userId)
                .limit(1)
                .maybeSingle();
            brandIdentity = data;
        }

        const role = node.data.agentRole as string || 'observer';
        const brandName = brandIdentity?.name || 'Cliente';
        const brandAudience = brandIdentity?.audience || 'Público geral';
        const brandMessage = brandIdentity?.message || 'Mensagem central';
        const brandTone = brandIdentity?.tone_of_voice || 'Profissional e envolvente';

        const prompts: Record<string, string> = {
            'observer': `Você é o AGENTE 1: OBSERVER (Analista Científico).
SUA MISSÃO: Analisar dados reais e extrair padrões validados.

CLIENTE: ${brandName} | PÚBLICO: ${brandAudience}
CONTEXTO: ${context || 'Dados de performance serão analisados.'}

TAREFA:
1. TOP 10 PADRÕES DE SUCESSO (formato, gancho, tema)
2. ANÁLISE DE GATILHOS PSICOLÓGICOS (Berger & Milkman)
3. RECOMENDAÇÕES CIENTÍFICAS

Saída em Markdown estruturado.`,

            'strategist': `Você é o AGENTE 2: STRATEGIST (Ideação Viral).

CLIENTE: ${brandName} | MENSAGEM: ${brandMessage}
ANÁLISE DO OBSERVER: ${context}

TAREFA - CRIAR 10 TEMAS VIRAIS:
| # | Título | Gatilho | Score (0-10) | Justificativa |
|---|--------|---------|--------------|---------------|

Sa\u00edda em Markdown com tabela.`,

            'researcher': `Você é o AGENTE 3: RESEARCHER (Pesquisa Profunda).

TEMA APROVADO: ${context}

TAREFA - MAPA DE CONTEÚDO:
1. 3 Estatísticas/Dados
2. 2 Cases de Sucesso
3. Elementos de Autoridade
4. Objeções e Respostas
5. Ganchos Visuais

Saída em Markdown estruturado.`,

            'architect': `Você é o AGENTE 4: ARCHITECT (Engenharia de Atenção).

INSUMOS: ${context}

TAREFA - ESTRUTURA NARRATIVA (AIDA):
| Slide | Objetivo | Texto | Emoção | Tempo |
|-------|----------|-------|--------|-------|

Saída em Markdown com tabela.`,

            'copywriter': `Você é o AGENTE 5: WRITER (Redação Final).

TOM DE VOZ: ${brandTone}
ESTRUTURA: ${context}

TAREFA:
1. Texto final por slide/cena
2. Palavras de poder e gatilhos
3. Auto-avaliação (Clareza, Impacto, CTA)

Saída em Markdown com **negritos**.`
        };

        const systemPrompt = prompts[role] || prompts['observer'];
        console.log(`[${role}] Direct call to OpenRouter...`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://eterhub.app',
                'X-Title': 'EterHub'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: 'Execute a tarefa. Responda em Português.' }
                ],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter: ${response.status} - ${await response.text()}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Sem output';
    };

    // Get agent nodes sorted by position
    const getAgentNodes = () => {
        return nodes
            .filter(n => n.type === 'agent')
            .sort((a, b) => a.position.x - b.position.x);
    };

    // Flora-style pipeline execution
    const runFloraStylePipeline = async () => {
        setIsRunningPipeline(true);

        const agentNodes = getAgentNodes();
        const touchpointNodes = agentNodes.filter(n => n.data.isTouchpoint);

        // Reset all nodes
        setNodes(nds => nds.map(n => ({
            ...n,
            data: { ...n.data, status: 'pending', output: undefined }
        })));

        let context = '';
        let touchpointIndex = 0;

        for (let i = 0; i < agentNodes.length; i++) {
            const agentNode = agentNodes[i];
            setCurrentExecutingNode(agentNode.id);
            updateNodeStatus(agentNode.id, 'running');

            toast({
                title: `🔄 Processando ${agentNode.data.label}...`,
                description: `Usando ${agentNode.data.llm || 'OpenRouter'}`,
            });

            // Run agent
            const output = await runAgentNode(agentNode, context);

            // Check if touchpoint
            if (agentNode.data.isTouchpoint) {
                touchpointIndex++;
                updateNodeStatus(agentNode.id, 'editing', output);

                // Open touchpoint modal and wait for approval
                await new Promise<void>((resolve) => {
                    setTouchpointModal({
                        isOpen: true,
                        nodeId: agentNode.id,
                        output: output,
                        stageNumber: touchpointIndex
                    });

                    // Store the resolve callback in ref
                    touchpointResolveRef.current = (approvedOutput: string) => {
                        context = approvedOutput;
                        updateNodeStatus(agentNode.id, 'approved', approvedOutput);
                        touchpointResolveRef.current = null;
                        resolve();
                    };
                });
            } else {
                updateNodeStatus(agentNode.id, 'completed', output);
                context = output;
            }
        }

        // Update output node
        setNodes(nds => nds.map(n => {
            if (n.type === 'output') {
                return { ...n, data: { ...n.data, output: context } };
            }
            return n;
        }));

        setIsRunningPipeline(false);
        setCurrentExecutingNode(null);

        toast({
            title: "🎉 Pipeline Concluída!",
            description: "Seu conteúdo está pronto para publicação.",
        });
    };

    const handleTouchpointApprove = (editedOutput: string) => {
        if (touchpointResolveRef.current) {
            touchpointResolveRef.current(editedOutput);
        }
        setTouchpointModal({ isOpen: false, nodeId: null, output: '', stageNumber: 0 });
    };

    const handleTouchpointRegenerate = async () => {
        if (!touchpointModal.nodeId) return;

        setIsRegenerating(true);

        const node = nodes.find(n => n.id === touchpointModal.nodeId);
        if (node) {
            const previousNode = nodes
                .filter(n => n.type === 'agent' && n.position.x < node.position.x)
                .sort((a, b) => b.position.x - a.position.x)[0];

            const context = (previousNode?.data?.output as string) || '';
            const newOutput = await runAgentNode(node, context);

            setTouchpointModal(prev => ({ ...prev, output: newOutput }));
            updateNodeStatus(node.id, 'editing', newOutput);

            toast({
                title: "🔄 Regenerado!",
                description: "Novo output gerado pela IA.",
            });
        }

        setIsRegenerating(false);
    };

    const handleSave = async () => {
        if (!flowName) return;
        const saved = await saveWorkflow(flowName, nodes, edges, currentWorkflowId || undefined);
        if (saved && !currentWorkflowId) {
            const workflows = await loadWorkflows();
            if (workflows && workflows.length > 0) {
                setCurrentWorkflowId(workflows[0].id);
            }
        }
    };

    const handleLoad = async () => {
        const workflows = await loadWorkflows();
        if (workflows && workflows.length > 0) {
            const latest = workflows[0];
            if (latest.nodes && latest.edges) {
                setNodes((latest.nodes as unknown) as Node[]);
                setEdges((latest.edges as unknown) as Edge[]);
                setFlowName(latest.name);
                setCurrentWorkflowId(latest.id);
                toast({ title: "Carregado", description: `Fluxo "${latest.name}" carregado.` });
            }
        } else {
            toast({ title: "Sem fluxos", description: "Nenhum fluxo salvo encontrado." });
        }
    };

    const handleLoadTemplate = () => {
        setNodes(eterflowTemplate.nodes);
        setEdges(eterflowTemplate.edges);
        setFlowName("Eterflow Template");
        toast({ title: "✨ Template Carregado", description: "5 agentes prontos para execução." });
    };

    const currentNode = touchpointModal.nodeId ? nodes.find(n => n.id === touchpointModal.nodeId) : null;
    const agentNodes = getAgentNodes();
    const touchpointNodes = agentNodes.filter(n => n.data.isTouchpoint);

    return (
        <div className="flex flex-col gap-3 w-full h-full">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-black/60 backdrop-blur-xl p-3 md:p-2 rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <Input
                        value={flowName}
                        onChange={(e) => setFlowName(e.target.value)}
                        className="w-full md:w-48 h-9 bg-black/50 border-white/10 rounded-xl"
                        placeholder="Nome do Fluxo"
                    />
                    <div className="hidden md:block h-6 w-[1px] bg-white/10 mx-1"></div>
                    <Button size="sm" variant="outline" onClick={handleLoadTemplate} disabled={isSaving || isRunningPipeline} className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] rounded-xl">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Template
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleLoad} disabled={isSaving || isRunningPipeline} className="rounded-xl">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Carregar
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving || isRunningPipeline} className="rounded-xl">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-xl"
                        onClick={runFloraStylePipeline}
                        disabled={isRunningPipeline}
                    >
                        {isRunningPipeline ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        {isRunningPipeline ? 'Executando...' : 'Executar Pipeline'}
                    </Button>
                </div>

                <Link to="/central-cliente" className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden md:inline">Manual do Movimento</span>
                </Link>
            </div>

            {/* Flow Canvas */}
            <div className="flex flex-col md:flex-row gap-3 flex-1 overflow-hidden">
                <div className="relative flex-1 border border-white/5 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 backdrop-blur-sm overflow-hidden shadow-2xl min-h-[50vh]">
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"></div>
                    </div>

                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                            colorMode="dark"
                            fitView
                            defaultEdgeOptions={{
                                type: 'smoothstep',
                                animated: true,
                                style: { stroke: 'rgba(255,255,255,0.3)', strokeWidth: 2 }
                            }}
                        >
                            <Controls className="!bg-black/50 !border-white/10 !rounded-xl" />
                            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
                        </ReactFlow>
                    </ReactFlowProvider>

                    {selectedNode && (
                        <NodeProperties
                            selectedNode={selectedNode}
                            updateNodeData={updateNodeData}
                            onClose={() => setSelectedNodeId(null)}
                        />
                    )}
                </div>

                {/* Execution Logs Panel */}
                {(executionLogs.length > 0 || isRunningPipeline) && (
                    <Card className="w-full md:w-80 max-h-48 md:max-h-none bg-black/80 border border-white/5 flex flex-col rounded-2xl backdrop-blur-xl">
                        <div className="p-3 border-b border-white/5 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-primary" />
                            <span className="font-mono text-xs font-bold text-primary">Pipeline Status</span>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                            <div className="space-y-2 font-mono text-xs">
                                {executionLogs.map((log, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <span className="text-gray-500 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        <span className={log.message.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                                            {">"} {log.message}
                                        </span>
                                    </div>
                                ))}
                                {isRunningPipeline && (
                                    <div className="animate-pulse text-purple-400 text-[11px] flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        {currentExecutingNode ? `Processando ${nodes.find(n => n.id === currentExecutingNode)?.data.label}...` : 'Iniciando...'}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>
                )}
            </div>

            {/* Enhanced Touchpoint Modal */}
            <TouchpointModal
                isOpen={touchpointModal.isOpen}
                onClose={() => setTouchpointModal({ isOpen: false, nodeId: null, output: '', stageNumber: 0 })}
                nodeData={currentNode?.data}
                output={touchpointModal.output}
                onApprove={handleTouchpointApprove}
                onRegenerate={handleTouchpointRegenerate}
                isRegenerating={isRegenerating}
                stageNumber={touchpointModal.stageNumber}
                totalStages={touchpointNodes.length}
            />
        </div>
    );
}
