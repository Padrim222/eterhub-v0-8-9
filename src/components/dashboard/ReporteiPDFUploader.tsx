import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileText, Loader2, CheckCircle, ArrowRight, RefreshCw, Play } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReporteiPDFUploaderProps {
    onSuccess?: (data: any) => void;
    mode?: 'standalone' | 'pipeline';
}

export function ReporteiPDFUploader({ onSuccess, mode = 'standalone' }: ReporteiPDFUploaderProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState<'upload' | 'review' | 'refine'>('upload');
    const [analysisResult, setAnalysisResult] = useState<string>("");
    const [refinementInstructions, setRefinementInstructions] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf') {
                toast({
                    title: "Formato inválido",
                    description: "Por favor, selecione um arquivo PDF.",
                    variant: "destructive"
                });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('source', 'eterhub_frontend');

            // Webhook 1: Upload & Análise (Observer/Strategist)
            const webhookUrl = "https://webhook.symbiotic.com.br/webhook/ac58524c-3b78-4d7f-a445-e02acee24d5d";

            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

            const result = await response.json();

            const rawOutput = result.output || result.text || result;
            // Garante string para evitar crash se vier objeto
            const markdownOutput = typeof rawOutput === 'object'
                ? JSON.stringify(rawOutput, null, 2)
                : String(rawOutput);

            setAnalysisResult(markdownOutput);

            if (mode === 'pipeline' && onSuccess) {
                onSuccess(result);
            } else {
                setStep('review');
            }

            toast({
                title: "Análise concluída",
                description: "Insights recebidos do Agente Observer.",
            });

        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Erro no processamento",
                description: "Falha ao enviar para o N8N.",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleApproveAndContinue = async () => {
        // Legacy / Standalone flow
        console.log("Standalone flow finish");
    };

    // Se estiver em modo pipeline, só mostra o upload. O resto é com o Pai.
    if (mode === 'pipeline' && step === 'upload') {
        // Apenas renderiza o Card de Upload
        return (
            <Card className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CloudUpload className="h-6 w-6 text-primary" />
                        <CardTitle>Nova Análise de Conteúdo</CardTitle>
                    </div>
                    <CardDescription>
                        Faça upload do relatório PDF da Reportei para iniciar o pipeline de IA.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
                        <Input
                            id="reportei-pdf-pipeline"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="hidden"
                        />
                        <Label
                            htmlFor="reportei-pdf-pipeline"
                            className="cursor-pointer flex flex-col items-center gap-2 text-center"
                        >
                            {file ? (
                                <>
                                    <FileText className="h-10 w-10 text-primary" />
                                    <span className="font-semibold text-foreground">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">Clique para trocar</span>
                                </>
                            ) : (
                                <>
                                    <CloudUpload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <span className="font-semibold">Clique para selecionar o PDF</span>
                                    <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>
                                </>
                            )}
                        </Label>
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full"
                        size="lg"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processando via N8N...
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-5 w-5" />
                                Iniciar Pipeline
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full space-y-6">

            {/* Etapa 1: Upload (Standalone) */}
            {step === 'upload' && (
                <Card className="w-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CloudUpload className="h-6 w-6 text-primary" />
                            <CardTitle>Nova Análise de Conteúdo</CardTitle>
                        </div>
                        <CardDescription>
                            Faça upload do relatório PDF da Reportei para alimentar a IA.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-lg">
                            <Input
                                id="reportei-pdf"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="hidden"
                            />
                            <Label
                                htmlFor="reportei-pdf"
                                className="cursor-pointer flex flex-col items-center gap-2 text-center"
                            >
                                {file ? (
                                    <>
                                        <FileText className="h-10 w-10 text-primary" />
                                        <span className="font-semibold text-foreground">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">Clique para trocar</span>
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload className="h-10 w-10 text-muted-foreground mb-2" />
                                        <span className="font-semibold">Clique para selecionar o PDF</span>
                                        <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>
                                    </>
                                )}
                            </Label>
                        </div>

                        <Button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="w-full"
                            size="lg"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processando via N8N...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-5 w-5" />
                                    Iniciar Análise
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Etapa 2: Review (Standalone) */}
            {step === 'review' && (
                <Card className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Análise Concluída
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="p-6">
                            <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/10">
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                                </div>
                            </ScrollArea>
                            <div className="mt-4 pt-4 border-t text-center text-muted-foreground text-sm">
                                Modo Standalone - Visualize o resultado acima.
                                <Button variant="outline" className="ml-4" onClick={() => setStep('upload')}>Novo Upload</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
