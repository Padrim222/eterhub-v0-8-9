import { Handle, Position } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export function PromptNode({ data }: { data: { label: string; prompt?: string } }) {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-card border border-border w-64">
            <div className="flex items-center mb-2">
                <div className="rounded-full w-8 h-8 flex justify-center items-center bg-accent/20">
                    <MessageSquare className="text-accent" size={16} />
                </div>
                <div className="ml-2">
                    <div className="text-sm font-bold text-foreground">{data.label}</div>
                    <div className="text-[10px] text-muted-foreground">Prompt Config</div>
                </div>
            </div>

            <div className="text-xs text-muted-foreground truncate">
                {data.prompt ? `"${data.prompt}"` : "No prompt set..."}
            </div>

            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-accent" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-accent" />
        </div>
    );
}
