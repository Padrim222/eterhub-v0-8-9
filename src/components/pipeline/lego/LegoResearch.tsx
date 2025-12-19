import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Search, Link as LinkIcon, ExternalLink } from "lucide-react";

interface ResearchPoint {
    topic: string;
    details: string;
    sources?: string[];
}

interface LegoResearchProps {
    data: any;
}

export function LegoResearch({ data }: LegoResearchProps) {
    const [points, setPoints] = useState<ResearchPoint[]>([]);

    // Parse initial data
    useEffect(() => {
        if (!data) return;

        let parsed: ResearchPoint[] = [];
        const rawList = Array.isArray(data) ? data : (data.map || data.points || data.research || []);

        if (rawList.length > 0) {
            parsed = rawList.map((item: any) => ({
                topic: item.topic || item.title || "Tópico de Pesquisa",
                details: item.details || item.content || item.summary || "",
                sources: item.sources || item.links || []
            }));
        }

        setPoints(parsed);
    }, [data]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Mapa de Conteúdo (Pesquisa)</h3>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-2">
                {points.map((point, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-md px-4 bg-card">
                        <AccordionTrigger className="hover:no-underline hover:bg-muted/50 transition-colors rounded-t-md">
                            <span className="font-semibold text-left">{point.topic}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-4 space-y-4">
                            <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
                                {point.details}
                            </div>

                            {point.sources && point.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                                        <LinkIcon className="h-3 w-3" /> Fontes
                                    </h4>
                                    <ul className="space-y-1">
                                        {point.sources.map((source, sIdx) => (
                                            <li key={sIdx}>
                                                <a href={source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                    {source} <ExternalLink className="h-2 w-2" />
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {points.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    O retorno da pesquisa não está estruturado como esperado.
                </div>
            )}
        </div>
    );
}
