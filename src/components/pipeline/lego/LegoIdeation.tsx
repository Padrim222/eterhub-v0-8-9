import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Idea {
    id: string;
    title: string;
    description: string;
    tags?: string[];
    rationale?: string;
}

interface LegoIdeationProps {
    data: any;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function LegoIdeation({ data, selectedIds, onSelectionChange }: LegoIdeationProps) {
    const [ideas, setIdeas] = useState<Idea[]>([]);

    // Parse initial data
    useEffect(() => {
        if (!data) return;

        let parsed: Idea[] = [];
        const rawList = Array.isArray(data) ? data : (data.ideas || data.themes || []);

        if (rawList.length > 0) {
            parsed = rawList.map((item: any, idx: number) => ({
                id: item.id || `idea-${idx}-${Date.now()}`,
                title: item.title || item.theme || `Ideia ${idx + 1}`,
                description: item.description || item.concept || item.content || "",
                tags: item.tags || item.keywords || [],
                rationale: item.rationale
            }));
        }

        setIdeas(parsed);
    }, [data]);

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(sid => sid !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Ideias Geradas
                </h3>
                <span className="text-sm text-muted-foreground">
                    {selectedIds.length} selecionada(s)
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ideas.map((idea) => {
                    const isSelected = selectedIds.includes(idea.id);
                    return (
                        <Card
                            key={idea.id}
                            onClick={() => toggleSelection(idea.id)}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md border-2 relative overflow-hidden",
                                isSelected ? "border-primary bg-primary/5" : "border-transparent bg-card hover:border-primary/20"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 text-primary">
                                    <CheckCircle className="h-5 w-5 fill-primary text-primary-foreground" />
                                </div>
                            )}

                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold pr-6 leading-tight">
                                    {idea.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-4">
                                    {idea.description}
                                </p>
                                {idea.rationale && (
                                    <p className="text-xs italic text-muted-foreground/80 bg-muted/50 p-2 rounded">
                                        "{idea.rationale}"
                                    </p>
                                )}
                                {idea.tags && idea.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-2">
                                        {idea.tags.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="text-[10px]">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {ideas.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    Nenhuma lista de ideias detectada no retorno do agente.
                </div>
            )}
        </div>
    );
}
