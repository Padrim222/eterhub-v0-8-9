import { useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StructureBlock {
    id: string;
    type: string;
    content: string;
}

interface LegoStructureProps {
    data: any;
    onChange: (blocks: StructureBlock[]) => void;
}

export function LegoStructure({ data, onChange }: LegoStructureProps) {
    const [blocks, setBlocks] = useState<StructureBlock[]>([]);

    // Parse initial data
    useEffect(() => {
        if (!data) return;

        let parsed: StructureBlock[] = [];

        // Tenta encontrar array de blocos no objeto
        const rawList = Array.isArray(data) ? data : (data.blocks || data.sections || data.structure || []);

        if (rawList.length > 0) {
            parsed = rawList.map((item: any, idx: number) => ({
                id: item.id || `block-${idx}-${Date.now()}`,
                type: item.type || 'section',
                content: item.content || (typeof item === 'string' ? item : JSON.stringify(item))
            }));
        } else if (typeof data === 'string') {
            // Fallback: Split by paragraphs
            parsed = data.split('\n\n').filter(t => t.trim()).map((text, idx) => ({
                id: `text-${idx}`,
                type: 'paragraph',
                content: text
            }));
        }

        setBlocks(parsed);
    }, [data]);

    // Propagate changes
    useEffect(() => {
        onChange(blocks);
    }, [blocks, onChange]);

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlockContent = (id: string, newContent: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Estrutura Narrativa (Arraste para Reordenar)</h3>
            </div>

            <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-3">
                {blocks.map((block) => (
                    <Reorder.Item key={block.id} value={block}>
                        <Card className="cursor-grab active:cursor-grabbing border-muted-foreground/20 hover:border-primary/50 transition-colors group">
                            <CardContent className="p-3 flex items-start gap-3">
                                <div className="mt-2 text-muted-foreground/50 group-hover:text-primary transition-colors">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                            {block.type}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeBlock(block.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={block.content}
                                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                                        className="min-h-[80px] bg-transparent border-transparent hover:border-input focus:border-input resize-none transition-all"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {blocks.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    Nenhuma estrutura detectada. O retorno do agente pode não estar em formato JSON compatível.
                </div>
            )}
        </div>
    );
}
