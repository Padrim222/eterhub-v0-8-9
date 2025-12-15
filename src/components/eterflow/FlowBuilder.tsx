import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, Node, OnNodesChange, applyNodeChanges, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AgentNode } from './nodes/AgentNode';
import { TriggerNode } from './nodes/TriggerNode';
import { PromptNode } from './nodes/PromptNode';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, FolderOpen, Play, Loader2, Terminal, Sparkles } from "lucide-react";
import { useFlowPersistence } from '@/hooks/useFlowPersistence';
import { useFlowExecution } from '@/hooks/useFlowExecution';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeProperties } from './NodeProperties';

import { OutputNode } from './nodes/OutputNode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IdentityConfig } from './IdentityConfig';
import { viralEngineTemplate } from "@/lib/templates";

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

export function FlowBuilder() {
    const [nodes, setNodes] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [flowName, setFlowName] = useState("Meu Fluxo");
    const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);

    const { saveWorkflow, loadWorkflows, isLoading: isSaving } = useFlowPersistence();
    const { runWorkflow, isExecuting, executionLogs, executionStatus } = useFlowExecution();
    const { toast } = useToast();

    // Effect to update output node when execution completes
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

    const handleSave = async () => {
        if (!flowName) return;
        const saved = await saveWorkflow(flowName, nodes, edges, currentWorkflowId || undefined);
        if (saved && !currentWorkflowId) {
            // In a real app we would get the ID back from saveWorkflow, skipping for now
            // Assuming successful save means we can proceed or reloading to get ID
            // For this demo, let's try to reload immediately to get the ID if it was a new save
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

    const handleRun = async () => {
        if (!currentWorkflowId) {
            toast({ title: "Salvar primeiro", description: "Por favor, salve o fluxo antes de executar.", variant: "destructive" });
            return;
        }
        await runWorkflow(currentWorkflowId);
    };

    const handleLoadTemplate = () => {
        setNodes(viralEngineTemplate.nodes);
        setEdges(viralEngineTemplate.edges);
        setFlowName("Viral Engine V1");
        toast({ title: "Template Loaded", description: "Viral Engine workflow loaded." });
    };

    return (
        <div className="flex flex-col gap-4 w-full h-[80vh]">
            <Tabs defaultValue="builder" className="w-full h-full flex flex-col">
                <div className="flex items-center justify-between bg-card p-2 rounded-lg border border-border mb-2">
                    <TabsList>
                        <TabsTrigger value="builder">Flow Builder</TabsTrigger>
                        <TabsTrigger value="identity">Identidade (Manual)</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        {/* Only show these controls on builder tab ideally, but keeping simple for now */}
                        <Input
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            className="w-48 h-8 bg-background"
                            placeholder="Nome do Fluxo"
                        />
                        <Button size="sm" variant="outline" onClick={handleLoadTemplate} disabled={isSaving || isExecuting} className="mr-2 border-green-500/50 text-green-400 hover:bg-green-500/10">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Viral Template
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleLoad} disabled={isSaving || isExecuting}>
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Load
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving || isExecuting}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="secondary" className="ml-2" onClick={handleRun} disabled={isExecuting}>
                            {isExecuting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            {isExecuting ? 'Running...' : 'Run'}
                        </Button>
                    </div>
                </div>

                <TabsContent value="builder" className="flex-1 flex gap-4 overflow-hidden mt-0">
                    <div className="relative flex-1 border border-gray-800 rounded-lg bg-black/50 backdrop-blur-sm overflow-hidden">
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
                            >
                                <Controls />
                                <Background />
                            </ReactFlow>
                        </ReactFlowProvider>

                        {selectedNode && (
                            <NodeProperties
                                selectedNode={selectedNode}
                                updateNodeData={updateNodeData}
                            />
                        )}
                    </div>

                    {/* Execution Logs Panel (Existing code) */}
                    {
                        executionLogs.length > 0 && (
                            <Card className="w-80 bg-black/90 border-l border-gray-800 flex flex-col">
                                <div className="p-3 border-b border-gray-800 flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-primary" />
                                    <span className="font-mono text-xs font-bold text-primary">Execution Logs</span>
                                </div>
                                <ScrollArea className="flex-1 p-3">
                                    <div className="space-y-2 font-mono text-xs">
                                        {executionLogs.map((log, i) => (
                                            <div key={i} className="flex flex-col gap-1">
                                                <span className="text-gray-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                <span className={log.message.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                                                    {">"} {log.message}
                                                </span>
                                            </div>
                                        ))}
                                        {isExecuting && (
                                            <div className="animate-pulse text-gray-500 text-[10px]">Processing...</div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </Card>
                        )
                    }
                </TabsContent >

                <TabsContent value="identity" className="flex-1 mt-0 overflow-hidden">
                    <IdentityConfig />
                </TabsContent>
            </Tabs >
        </div >
    );
}
