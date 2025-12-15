import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function OutputNode({ data, selected }: NodeProps) {
    return (
        <Card className={`relative min-w-[200px] border-2 bg-black/80 backdrop-blur-md transition-all ${selected ? 'border-primary shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-gray-800'
            }`}>
            <div className="flex items-center gap-3 p-3 border-b border-gray-800 bg-gray-900/50">
                <div className="p-2 rounded-lg bg-blue-500/20">
                    <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{data.label as string}</span>
                    <span className="text-[10px] text-muted-foreground">Final Result</span>
                </div>
            </div>

            <div className="p-3 space-y-3">
                <div className="text-xs text-gray-400 bg-black/40 p-2 rounded border border-gray-800 font-mono max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                    {data.output ? (
                        <span className="text-green-400">{data.output as string}</span>
                    ) : (
                        <span className="opacity-50">Waiting for output...</span>
                    )}
                </div>

                {data.output && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                            <span>Viral Potential</span>
                            <span>8.5/10</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 w-[85%] shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        </div>
                        <p className="text-[10px] text-gray-500 text-right pt-1">
                            Triggers: <span className="text-white">Curiosity, Identity</span>
                        </p>
                    </div>
                )}
            </div>

            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-black" />
        </Card>
    );
}
