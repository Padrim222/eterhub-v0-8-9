import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export function TriggerNode({ data }: { data: { label: string } }) {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-card border-2 border-white w-40 flex items-center justify-center gap-2">
            <div className="bg-white text-black rounded-full p-1">
                <Play size={12} fill="currentColor" />
            </div>
            <span className="font-bold text-foreground">Start Flow</span>
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-white" />
        </div>
    );
}
