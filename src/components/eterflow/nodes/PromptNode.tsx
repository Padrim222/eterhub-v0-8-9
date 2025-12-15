import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Instagram, FileText, BarChart3, Database } from 'lucide-react';

interface PromptNodeData {
    label: string;
    prompt?: string;
    dataSource?: 'instagram' | 'manual' | 'metrics';
    postFormat?: 'carousel' | 'reel' | 'image' | 'any';
}

const dataSourceConfig = {
    instagram: { icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
    manual: { icon: FileText, label: 'Manual', color: 'text-blue-400' },
    metrics: { icon: BarChart3, label: 'Métricas', color: 'text-cyan-400' },
};

const formatLabels: Record<string, string> = {
    carousel: 'Carrossel',
    reel: 'Reels',
    image: 'Imagem',
    any: 'Qualquer',
};

export function PromptNode({ data, selected }: { data: PromptNodeData; selected?: boolean }) {
    const source = data.dataSource || 'instagram';
    const format = data.postFormat || 'any';
    const config = dataSourceConfig[source] || dataSourceConfig.instagram;
    const SourceIcon = config.icon;

    return (
        <div className="relative group w-52 md:w-60">
            {/* Outer glow - Flora style */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500 ${selected ? 'opacity-50' : ''}`}></div>

            {/* Main card */}
            <div className={`relative shadow-xl rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl ${selected ? 'border-pink-500/50' : ''}`}>

                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-pink-500 to-rose-500 rounded-full opacity-60"></div>

                {/* Header */}
                <div className="flex items-center gap-3 p-3 mt-1">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 blur-md rounded-xl opacity-40"></div>
                        <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 border border-white/10">
                            <Database className="w-5 h-5 text-pink-400" />
                        </div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{data.label}</div>
                        <div className="text-[10px] text-pink-400 font-medium">Data Source</div>
                    </div>
                </div>

                {/* Data Source & Format */}
                <div className="px-3 pb-2 space-y-1.5">
                    <div className="flex items-center justify-between bg-black/30 rounded-lg px-2 py-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                            <SourceIcon className={`w-3.5 h-3.5 ${config.color}`} />
                            <span>Fonte</span>
                        </div>
                        <span className={`text-[11px] font-medium ${config.color}`}>{config.label}</span>
                    </div>

                    <div className="flex items-center justify-between bg-black/30 rounded-lg px-2 py-1.5">
                        <span className="text-[11px] text-white/50">Formato</span>
                        <span className="text-[11px] text-pink-300 font-medium">{formatLabels[format]}</span>
                    </div>
                </div>

                {/* Prompt Preview */}
                {data.prompt && (
                    <div className="px-3 pb-3">
                        <div className="text-[10px] text-white/40 bg-black/30 p-2 rounded-lg line-clamp-2 italic">
                            {data.prompt}
                        </div>
                    </div>
                )}

                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-gradient-to-r from-pink-500 to-rose-500 !border-2 !border-black/50 !shadow-lg"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-3 !h-3 !bg-gradient-to-r from-pink-500 to-rose-500 !border-2 !border-black/50 !shadow-lg"
                />
            </div>
        </div>
    );
}
