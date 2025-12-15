import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Node } from '@xyflow/react';
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface NodePropertiesProps {
    selectedNode: Node | undefined;
    updateNodeData: (key: string, value: string) => void;
    onClose?: () => void;
}

const PropertiesContent = ({ selectedNode, updateNodeData }: { selectedNode: Node; updateNodeData: (key: string, value: string) => void }) => (
    <div className="space-y-4">
        <div className="space-y-1.5">
            <Label className="text-xs text-gray-400 font-mono uppercase">Node Label</Label>
            <Input
                value={selectedNode.data.label as string}
                onChange={(e) => updateNodeData('label', e.target.value)}
                className="bg-black/40 border-white/5 text-white focus:border-green-500/50"
            />
        </div>

        {selectedNode.type === 'agent' && (
            <>
                <div className="space-y-1.5">
                    <Label className="text-xs text-green-400 font-mono uppercase">Agent Role</Label>
                    <Select
                        value={(selectedNode.data.agentRole as string) || 'generic'}
                        onValueChange={(val) => {
                            let desc = '';
                            if (val === 'observer') desc = 'Analisa dados de performance (Views, Engajamento, Leads) e identifica os Top 10 padrões de sucesso.';
                            if (val === 'strategist') desc = 'Gera 10 ideias de temas virais com base nos padrões e tendências de mercado.';
                            if (val === 'researcher') desc = 'Pesquisa dados, cases, estatísticas e insumos para cada tema escolhido.';
                            if (val === 'architect') desc = 'Estrutura o roteiro seguindo a lógica AIDA (Atenção, Interesse, Desejo, Ação).';
                            if (val === 'copywriter') desc = 'Escreve o texto final humanizado, no tom de voz da marca.';
                            if (val === 'personalizer') desc = 'Aplica a identidade da marca (Manual do Movimento) ao conteúdo.';

                            updateNodeData('agentRole', val);
                            updateNodeData('agentDescription', desc);
                        }}
                    >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-gray-200">
                            <SelectItem value="generic">🤖 Generic Assistant</SelectItem>
                            <SelectItem value="observer">📊 1. Observer (Análise de Dados)</SelectItem>
                            <SelectItem value="strategist">💡 2. Strategist (Ideação & Tendências)</SelectItem>
                            <SelectItem value="researcher">🔬 3. Researcher (Pesquisa Profunda)</SelectItem>
                            <SelectItem value="architect">🏗️ 4. Architect (Estrutura Narrativa)</SelectItem>
                            <SelectItem value="copywriter">✍️ 5. Copywriter (Redação Final)</SelectItem>
                            <SelectItem value="personalizer">🗣️ 6. Personalizer (Voz da Marca)</SelectItem>
                        </SelectContent>
                    </Select>
                    {(selectedNode.data.agentDescription) && (
                        <p className="text-[11px] text-gray-400 mt-1 italic">{selectedNode.data.agentDescription as string}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-400 font-mono uppercase">AI Model</Label>
                    <Select
                        value={(selectedNode.data.model as string) || 'gpt-4o'}
                        onValueChange={(val) => updateNodeData('model', val)}
                    >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-gray-200">
                            <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-gray-400 font-mono uppercase">System Prompt</Label>
                    <Textarea
                        value={(selectedNode.data.systemPrompt as string) || ''}
                        onChange={(e) => updateNodeData('systemPrompt', e.target.value)}
                        className="bg-black/40 border-white/5 text-gray-300 min-h-[100px] md:min-h-[120px] text-xs font-mono leading-relaxed"
                        placeholder="You are a helpful assistant..."
                    />
                </div>
            </>
        )}

        {selectedNode.type === 'prompt' && (
            <>
                <div className="space-y-1.5">
                    <Label className="text-xs text-pink-400 font-mono uppercase">Fonte de Dados</Label>
                    <Select
                        value={(selectedNode.data.dataSource as string) || 'instagram'}
                        onValueChange={(val) => updateNodeData('dataSource', val)}
                    >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                            <SelectValue placeholder="Selecione a fonte" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-gray-200">
                            <SelectItem value="instagram">📸 Instagram (Métricas)</SelectItem>
                            <SelectItem value="manual">📝 Entrada Manual</SelectItem>
                            <SelectItem value="metrics">📊 Métricas do Dashboard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs text-pink-400 font-mono uppercase">Formato de Post</Label>
                    <Select
                        value={(selectedNode.data.postFormat as string) || 'any'}
                        onValueChange={(val) => updateNodeData('postFormat', val)}
                    >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                            <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 text-gray-200">
                            <SelectItem value="any">🎯 Qualquer Formato</SelectItem>
                            <SelectItem value="carousel">📚 Carrossel</SelectItem>
                            <SelectItem value="reel">🎬 Reels</SelectItem>
                            <SelectItem value="image">🖼️ Imagem/Post</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </>
        )}

        {(selectedNode.type === 'prompt' || selectedNode.type === 'agent') && (
            <div className="space-y-1.5">
                <Label className="text-xs text-gray-400 font-mono uppercase">
                    {selectedNode.type === 'agent' ? 'Instruções do Usuário' : 'Instruções Adicionais'}
                </Label>
                <Textarea
                    value={(selectedNode.data.prompt as string) || ''}
                    onChange={(e) => updateNodeData('prompt', e.target.value)}
                    className="bg-black/40 border-white/5 text-gray-300 min-h-[80px] md:min-h-[100px]"
                    placeholder={selectedNode.type === 'agent' ? "Instruções específicas para este agente..." : "Contexto adicional ou instruções..."}
                />
            </div>
        )}
    </div>
);

export const NodeProperties = ({ selectedNode, updateNodeData, onClose }: NodePropertiesProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (!selectedNode) return null;

    // Mobile: use Sheet/drawer
    if (!isDesktop) {
        return (
            <Sheet open={!!selectedNode} onOpenChange={() => onClose?.()}>
                <SheetContent side="bottom" className="h-[80vh] bg-black/95 border-t border-gray-800 p-0 rounded-t-xl">
                    <SheetHeader className="p-4 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                {selectedNode.type} Properties
                            </SheetTitle>
                            <span className="text-[11px] text-gray-400 font-mono">{selectedNode.id}</span>
                        </div>
                    </SheetHeader>
                    <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
                        <PropertiesContent selectedNode={selectedNode} updateNodeData={updateNodeData} />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop: use absolute positioned card
    return (
        <div className="absolute top-4 right-4 w-80 z-10">
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                <Card className="relative p-5 bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            {selectedNode.type} Properties
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 font-mono">{selectedNode.id}</span>
                            {onClose && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={onClose}>
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <PropertiesContent selectedNode={selectedNode} updateNodeData={updateNodeData} />
                </Card>
            </div>
        </div>
    );
};
