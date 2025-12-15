import { Handle, Position } from '@xyflow/react';
import { Bot, Zap, BarChart3, Lightbulb, Search, Layers, PenTool, UserCircle, Hand, Cpu, Loader2, Check, Eye } from 'lucide-react';
import { useState } from 'react';

const roleConfig: Record<string, { icon: any; color: string; gradient: string; bgGradient: string }> = {
    observer: {
        icon: BarChart3,
        color: 'text-blue-400',
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        bgGradient: 'from-blue-500/20 to-cyan-500/20'
    },
    strategist: {
        icon: Lightbulb,
        color: 'text-yellow-400',
        gradient: 'from-yellow-500 via-amber-500 to-orange-500',
        bgGradient: 'from-yellow-500/20 to-orange-500/20'
    },
    researcher: {
        icon: Search,
        color: 'text-purple-400',
        gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
        bgGradient: 'from-purple-500/20 to-fuchsia-500/20'
    },
    architect: {
        icon: Layers,
        color: 'text-orange-400',
        gradient: 'from-orange-500 via-red-500 to-rose-500',
        bgGradient: 'from-orange-500/20 to-rose-500/20'
    },
    copywriter: {
        icon: PenTool,
        color: 'text-pink-400',
        gradient: 'from-pink-500 via-rose-500 to-red-500',
        bgGradient: 'from-pink-500/20 to-red-500/20'
    },
    personalizer: {
        icon: UserCircle,
        color: 'text-teal-400',
        gradient: 'from-teal-500 via-emerald-500 to-green-500',
        bgGradient: 'from-teal-500/20 to-green-500/20'
    },
    generic: {
        icon: Bot,
        color: 'text-green-400',
        gradient: 'from-green-500 via-emerald-500 to-teal-500',
        bgGradient: 'from-green-500/20 to-teal-500/20'
    },
};

interface AgentNodeData {
    label: string;
    agentRole?: string;
    agentDescription?: string;
    llm?: string;
    isTouchpoint?: boolean;
    status?: 'pending' | 'running' | 'completed' | 'editing' | 'approved';
    output?: string;
}

export function AgentNode({ data }: { data: AgentNodeData }) {
    const [showPreview, setShowPreview] = useState(false);
    const role = data.agentRole || 'generic';
    const config = roleConfig[role] || roleConfig.generic;
    const Icon = config.icon;
    const isTouchpoint = data.isTouchpoint || false;
    const llm = data.llm || 'OpenRouter';
    const status = data.status || 'pending';

    const getStatusDisplay = () => {
        switch (status) {
            case 'running':
                return {
                    text: 'Processando...',
                    class: 'text-blue-400',
                    icon: <Loader2 className="w-3 h-3 animate-spin" />,
                    bg: 'bg-blue-500/20 border-blue-500/30'
                };
            case 'completed':
                return {
                    text: 'Concluído',
                    class: 'text-green-400',
                    icon: <Check className="w-3 h-3" />,
                    bg: 'bg-green-500/20 border-green-500/30'
                };
            case 'editing':
                return {
                    text: 'Aguardando revisão',
                    class: 'text-yellow-400',
                    icon: <Hand className="w-3 h-3" />,
                    bg: 'bg-yellow-500/20 border-yellow-500/30 animate-pulse'
                };
            case 'approved':
                return {
                    text: 'Aprovado',
                    class: 'text-green-400',
                    icon: <Check className="w-3 h-3" />,
                    bg: 'bg-green-500/20 border-green-500/30'
                };
            default:
                return {
                    text: 'Aguardando...',
                    class: 'text-gray-500',
                    icon: null,
                    bg: 'bg-gray-500/10 border-gray-500/20'
                };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className="relative group">
            {/* Outer glow - Flora style */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500`}></div>

            {/* Touchpoint pulsing ring */}
            {isTouchpoint && (
                <div className="absolute -inset-2 border-2 border-dashed border-yellow-500/40 rounded-2xl animate-[pulse_2s_ease-in-out_infinite]"></div>
            )}

            {/* Main card - Flora style with glass effect */}
            <div className={`relative px-4 py-3 rounded-2xl bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl border border-white/10 w-56 md:w-64 shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl`}>

                {/* Top accent line */}
                <div className={`absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r ${config.gradient} rounded-full opacity-60`}></div>

                {/* Header */}
                <div className="flex items-center gap-3 mt-1">
                    {/* Icon with glow */}
                    <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} blur-md rounded-xl opacity-40`}></div>
                        <div className={`relative z-10 rounded-xl w-11 h-11 flex justify-center items-center bg-black/40 border border-white/10`}>
                            {status === 'running' ? (
                                <Loader2 className={`${config.color} w-5 h-5 animate-spin`} />
                            ) : (
                                <Icon className={`${config.color} w-5 h-5`} />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{data.label}</span>
                            {isTouchpoint && (
                                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30 whitespace-nowrap">
                                    <Hand className="w-2.5 h-2.5" />
                                    TP
                                </span>
                            )}
                        </div>
                        <div className={`text-[10px] ${config.color} font-medium flex items-center gap-1 mt-0.5`}>
                            <Zap className="w-3 h-3" />
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {data.agentDescription && (
                    <div className="mt-2 text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                        {data.agentDescription}
                    </div>
                )}

                {/* LLM Badge */}
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <Cpu className="w-3 h-3" />
                        <span>{llm}</span>
                    </div>

                    {/* Status indicator */}
                    <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${statusDisplay.bg}`}>
                        {statusDisplay.icon}
                        <span className={statusDisplay.class}>{statusDisplay.text}</span>
                    </div>
                </div>

                {/* Output preview - Flora style */}
                {data.output && (
                    <div
                        className="mt-2 relative cursor-pointer group/preview"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <div className="flex items-center gap-1 text-[10px] text-white/40 mb-1">
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                        </div>
                        <div className={`bg-black/40 border border-white/5 p-2 rounded-xl text-[10px] text-white/60 font-mono transition-all duration-300 ${showPreview ? 'max-h-40' : 'max-h-12'} overflow-hidden`}>
                            {data.output.substring(0, showPreview ? 400 : 100)}
                            {data.output.length > (showPreview ? 400 : 100) && '...'}
                        </div>
                    </div>
                )}

                {/* Connection handles - Flora style */}
                <Handle
                    type="target"
                    position={Position.Left}
                    className={`!w-3 !h-3 !bg-gradient-to-r ${config.gradient} !border-2 !border-black/50 !shadow-lg`}
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    className={`!w-3 !h-3 !bg-gradient-to-r ${config.gradient} !border-2 !border-black/50 !shadow-lg`}
                />
            </div>
        </div>
    );
}
