import { Handle, Position } from '@xyflow/react';
import { Play, Zap } from 'lucide-react';

export function TriggerNode({ data, selected }: any) {
    return (
        <div className="relative group min-w-[180px]">
            {/* Outer glow - Flora style */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500 ${selected ? 'opacity-50' : ''}`}></div>

            {/* Main card */}
            <div className={`relative px-4 py-3 shadow-xl rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 backdrop-blur-xl border border-white/10 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl ${selected ? 'border-emerald-500/50' : ''}`}>

                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-60"></div>

                <div className="flex items-center gap-3 mt-1">
                    {/* Icon with glow */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-md rounded-xl opacity-40"></div>
                        <div className="relative z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-black/40 border border-white/10">
                            <Play className="w-5 h-5 text-emerald-400 ml-0.5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white max-w-[120px] truncate">{data.label as string}</div>
                        <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                            <Zap className="w-3 h-3" /> Start Point
                        </div>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-3 !h-3 !bg-gradient-to-r from-emerald-500 to-teal-500 !border-2 !border-black/50 !shadow-lg"
                />
            </div>
        </div>
    );
}
