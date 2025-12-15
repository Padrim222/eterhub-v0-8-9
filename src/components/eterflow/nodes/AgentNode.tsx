import { Handle, Position } from '@xyflow/react';
import { Bot, Zap } from 'lucide-react';

export function AgentNode({ data }: { data: { label: string } }) {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-card border-2 border-primary w-64 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <div className="flex items-center">
                <div className="rounded-full w-10 h-10 flex justify-center items-center bg-primary/20">
                    <Bot className="text-primary" size={20} />
                </div>
                <div className="ml-2">
                    <div className="text-lg font-bold text-foreground">{data.label}</div>
                    <div className="text-gray-500 text-xs">AI Agent Worker</div>
                </div>
            </div>

            <div className="mt-2 bg-black/40 p-2 rounded text-xs text-gray-300">
                Waiting for input...
            </div>

            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary" />
        </div>
    );
}
