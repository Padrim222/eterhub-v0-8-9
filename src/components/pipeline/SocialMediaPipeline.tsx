import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ArrowRight, FileText, Search, PenTool, BookOpen, RefreshCw, Braces, Clock, Database } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReporteiPDFUploader } from "@/components/dashboard/ReporteiPDFUploader";
import { LegoIdeation } from "./lego/LegoIdeation";
import { LegoResearch } from "./lego/LegoResearch";
import { LegoStructure } from "./lego/LegoStructure";
import { campaignService, ContentCampaign } from "@/services/campaignService";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Webhooks N8N
const WEBHOOKS = {
    IDEATION: "https://webhook.symbiotic.com.br/webhook/ac58524c-3b78-4d7f-a445-e02acee24d5d",
    RESEARCH: "https://webhook.symbiotic.com.br/webhook/b7bc9d28-0a5d-4551-9d66-6bcf8ce47d89",
    STRUCTURE: "https://webhook.symbiotic.com.br/webhook/cb985f5c-dd2c-493d-810e-1ab25ab5d6d6",
    COPY: "https://webhook.symbiotic.com.br/webhook/f4c95d48-6404-4098-af0c-8307c67ca0a0"
};

type PipelineStep = 'upload' | 'ideation_review' | 'research_review' | 'structure_review' | 'final_script';

export default function SocialMediaPipeline() {
    const { toast } = useToast();
    const [campaignId, setCampaignId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<PipelineStep>('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [recentCampaigns, setRecentCampaigns] = useState<ContentCampaign[]>([]);

    // Data States
    const [ideationData, setIdeationData] = useState<any>(null);
    const [researchData, setResearchData] = useState<any>(null);
    const [structureData, setStructureData] = useState<any>(null);
    const [scriptData, setScriptData] = useState<any>(null);

    // Interaction States
    const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([]);
    const [researchRefinement, setResearchRefinement] = useState("");
    const [structureBlocks, setStructureBlocks] = useState<any[]>([]);
    const [structureRefinement, setStructureRefinement] = useState("");

    // Auth Check & Load Campaigns
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserId(data.user.id);
                loadRecentCampaigns();
            }
        });
    }, []);

    const loadRecentCampaigns = async () => {
        try {
            const list = await campaignService.list();
            setRecentCampaigns(list || []);
        } catch (e) {
            console.error("Failed to load campaigns", e);
        }
    };

    const loadCampaign = (c: ContentCampaign) => {
        setCampaignId(c.id);
        setIdeationData(c.ideation_data?.raw_output || c.ideation_data); // Handle legacy/structure mismatch
        setResearchData(c.research_data?.raw_output || c.research_data);
        setStructureData(c.structure_data?.raw_output || c.structure_data);
        setScriptData(c.script_data?.raw_output || c.script_data);

        // Load selections/refinements if stored (needs structure update but for now raw is fine)
        if (c.ideation_data?.selected_ids) setSelectedIdeaIds(c.ideation_data.selected_ids);

        // Determine step based on status
        if (c.status === 'completed') setCurrentStep('final_script');
        else if (c.status === 'script') setCurrentStep('final_script');
        else if (c.status === 'structure') setCurrentStep('structure_review');
        else if (c.status === 'research') setCurrentStep('research_review');
        else if (c.status === 'ideation') setCurrentStep('ideation_review');
        else setCurrentStep('upload');

        toast({ title: "Campanha Carregada", description: `Retomando: ${c.title}` });
    };

    // -- Handlers --

    const saveCampaignState = async (step: string, dataUpdate: Partial<ContentCampaign>) => {
        if (!userId) return;
        try {
            if (!campaignId) {
                const newCampaign = await campaignService.create(`Campanha ${new Date().toLocaleString()}`);
                if (newCampaign) {
                    setCampaignId(newCampaign.id);
                    await campaignService.update(newCampaign.id, { ...dataUpdate, status: step as any, current_step: getStepIndex(step) });
                    loadRecentCampaigns(); // Refresh list
                }
            } else {
                await campaignService.update(campaignId, { ...dataUpdate, status: step as any, current_step: getStepIndex(step) });
                loadRecentCampaigns();
            }
        } catch (error) {
            console.error("Failed to save campaign:", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível persistir o estado.", variant: "destructive" });
        }
    };

    const getStepIndex = (step: string) => {
        const steps = ['upload', 'ideation_review', 'research_review', 'structure_review', 'final_script'];
        return steps.indexOf(step);
    };

    // 1. Ideation Success (After Upload)
    const handleIdeationSuccess = async (data: any) => {
        const content = data.output || data.text || data;
        setIdeationData(content);
        setCurrentStep('ideation_review');
        await saveCampaignState('ideation', { ideation_data: content });
    };

    // 2. Approve Ideas -> Call Research
    const handleApproveIdeas = async () => {
        if (selectedIdeaIds.length === 0) {
            toast({ title: "Selecione pelo menos uma ideia", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const rawList = Array.isArray(ideationData) ? ideationData : (ideationData?.ideas || []);
            const selectedIdeasObjects = rawList.filter((i: any) => selectedIdeaIds.includes(i.id || ""));

            const payload = {
                context: "approved_ideas",
                // Envia os objetos selecionados
                selected_ideas: selectedIdeasObjects.length > 0 ? selectedIdeasObjects : selectedIdeaIds,
                previous_output: ideationData
            };

            const response = await fetch(WEBHOOKS.RESEARCH, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Erro na solicitação de pesquisa");

            const result = await response.json();
            const content = result.output || result.text || result;

            setResearchData(content);
            setCurrentStep('research_review');
            await saveCampaignState('research', { research_data: content, ideation_data: { ...ideationData, selected_ids: selectedIdeaIds } });

            toast({ title: "Pesquisa Concluída", description: "Mapa de Conteúdo gerado." });

        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha Agente Pesquisa.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Approve Research -> Call Structure
    const handleApproveResearch = async () => {
        setIsLoading(true);
        try {
            const payload = {
                context: "approved_research",
                user_refinement: researchRefinement,
                previous_output: researchData
            };

            const response = await fetch(WEBHOOKS.STRUCTURE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Erro na solicitação de estrutura");

            const result = await response.json();
            const content = result.output || result.text || result;

            setStructureData(content);
            setCurrentStep('structure_review');
            await saveCampaignState('structure', { structure_data: content });

            toast({ title: "Estrutura Criada", description: "Esqueleto narrativo pronto." });

        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha Agente Arquiteto.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Approve Structure -> Call Copywriter
    const handleApproveStructure = async () => {
        setIsLoading(true);
        try {
            const payload = {
                context: "approved_structure",
                user_refinement: structureRefinement,
                structure_blocks: structureBlocks,
                previous_output: structureData
            };

            const response = await fetch(WEBHOOKS.COPY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Erro na solicitação de copy");

            const result = await response.json();
            const content = result.output || result.text || result;

            setScriptData(content);
            setCurrentStep('final_script');
            await saveCampaignState('script', { script_data: content, structure_data: { ...structureData, final_blocks: structureBlocks } });

            toast({ title: "Roteiro Pronto", description: "Conteúdo finalizado." });

        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha Agente Copywriter.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // -- Render --

    const renderStepIndicator = () => {
        const steps = [
            { id: 'upload', label: 'Upload', icon: FileText },
            { id: 'ideation_review', label: 'Ideação', icon: CheckCircle },
            { id: 'research_review', label: 'Pesquisa', icon: Search },
            { id: 'structure_review', label: 'Estrutura', icon: BookOpen },
            { id: 'final_script', label: 'Roteiro', icon: PenTool },
        ];

        const currentIndex = steps.findIndex(s => s.id === currentStep);

        return (
            <div className="flex justify-between items-center mb-8 px-8 relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-muted -z-10" />
                <div
                    className="absolute left-0 top-1/2 h-1 bg-primary -z-10 transition-all duration-500"
                    style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isActive = index === currentIndex;
                    const isCompleted = index < currentIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="flex flex-col items-center bg-background px-2">
                            <div className={`
                flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                ${isActive ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25' :
                                    isCompleted ? 'border-primary bg-primary text-primary-foreground' : 'border-muted text-muted-foreground bg-card'}
              `}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs mt-2 font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">

            {renderStepIndicator()}

            {/* Step 1: Upload & History */}
            {currentStep === 'upload' && (
                <div className="space-y-8">
                    <ReporteiPDFUploader mode="pipeline" onSuccess={handleIdeationSuccess} />

                    {recentCampaigns.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                Histórico de Campanhas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentCampaigns.map(campaign => (
                                    <Card
                                        key={campaign.id}
                                        className="cursor-pointer hover:border-primary transition-colors hover:shadow-md"
                                        onClick={() => loadCampaign(campaign)}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium leading-none truncate">
                                                {campaign.title}
                                            </CardTitle>
                                            <div className="flex items-center justify-between pt-2">
                                                <CardDescription className="text-xs">
                                                    {formatDistanceToNow(new Date(campaign.updated_at), { addSuffix: true, locale: ptBR })}
                                                </CardDescription>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold
                                            ${campaign.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                                    {campaign.status}
                                                </span>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 2: Ideation Review (LEGO) */}
            {currentStep === 'ideation_review' && (
                <Card className="min-h-[600px] flex flex-col border-primary/20">
                    <CardHeader>
                        <CardTitle>Seleção de Ideias</CardTitle>
                        <CardDescription>Selecione os conceitos que você quer desenvolver.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <LegoIdeation
                            data={ideationData}
                            selectedIds={selectedIdeaIds}
                            onSelectionChange={setSelectedIdeaIds}
                        />
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-end">
                        <Button onClick={handleApproveIdeas} disabled={isLoading} size="lg" className="w-full md:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                            Aprovar e Pesquisar ({selectedIdeaIds.length})
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Step 3: Research Review (LEGO/Accordion) */}
            {currentStep === 'research_review' && (
                <Card className="min-h-[600px] flex flex-col border-primary/20">
                    <CardHeader>
                        <CardTitle>Validação da Pesquisa</CardTitle>
                        <CardDescription>Revise os pontos levantados pelo agente.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <LegoResearch data={researchData} />

                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <Label>Instruções para a Estrutura</Label>
                            <Textarea
                                placeholder="Adicione diretrizes para a montagem do esqueleto..."
                                value={researchRefinement}
                                onChange={(e) => setResearchRefinement(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-end">
                        <Button onClick={handleApproveResearch} disabled={isLoading} size="lg" className="w-full md:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                            Gerar Estrutura
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Step 4: Structure Review (LEGO/DragDrop) */}
            {currentStep === 'structure_review' && (
                <Card className="min-h-[600px] flex flex-col border-primary/20">
                    <CardHeader>
                        <CardTitle>Arquiteto de Narrativa</CardTitle>
                        <CardDescription>Organize os blocos da sua história. Arraste para reordenar.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <LegoStructure
                            data={structureData}
                            onChange={setStructureBlocks}
                        />

                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                            <Label>Tom de Voz & Refinamento Final</Label>
                            <Textarea
                                placeholder="Ex: Reforce o CTA para conversão..."
                                value={structureRefinement}
                                onChange={(e) => setStructureRefinement(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-end">
                        <Button onClick={handleApproveStructure} disabled={isLoading} size="lg" className="w-full md:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PenTool className="mr-2 h-4 w-4" />}
                            Escrever Roteiro Final
                        </Button>
                    </CardFooter>
                </Card>
            )}

            {/* Step 5: Final Script */}
            {currentStep === 'final_script' && (
                <Card className="min-h-[600px] flex flex-col border-primary shadow-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <CheckCircle className="h-6 w-6" />
                            Roteiro Finalizado
                        </CardTitle>
                        <CardDescription>Seu conteúdo viral está pronto.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ScrollArea className="h-[500px] border rounded-md p-6">
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                    {typeof scriptData === 'string' ? scriptData : (scriptData?.final_content || scriptData?.content || JSON.stringify(scriptData, null, 2))}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-6 border-t">
                        <Button variant="outline" onClick={() => {
                            setCurrentStep('upload');
                            setCampaignId(null);
                            setSelectedIdeaIds([]);
                        }}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Novo Pipeline
                        </Button>
                        <Button variant="default" onClick={() => {
                            const text = typeof scriptData === 'string' ? scriptData : (scriptData?.final_content || JSON.stringify(scriptData));
                            navigator.clipboard.writeText(text);
                            toast({ title: "Copiado!" });
                        }}>
                            Copiar Texto
                        </Button>
                    </CardFooter>
                </Card>
            )}

        </div>
    );
}
