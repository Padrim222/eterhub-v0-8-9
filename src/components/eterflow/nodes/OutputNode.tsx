import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText, Sparkles, TrendingUp, Copy, Download } from 'lucide-react';
import { useState } from 'react';

export function OutputNode({ data, selected }: NodeProps) {
    const [copied, setCopied] = useState(false);
    const output = data.output as string;

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="relative group min-w-[260px] max-w-[320px]">
            {/* Outer glow - Flora style */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500 ${selected ? 'opacity-50' : ''}`}></div>

            {/* Main card */}
            <div className={`relative shadow-xl rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl ${selected ? 'border-indigo-500/50' : ''}`}>

                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-full opacity-60"></div>

                {/* Header */}
                <div className="flex items-center justify-between p-3 mt-1 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-md rounded-xl opacity-40"></div>
                            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 border border-white/10">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">{data.label as string}</div>
                            <div className="text-[10px] text-indigo-400 font-medium">Final Output</div>
                        </div>
                    </div>

                    {output && (
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/50 hover:text-white transition-all"
                            title="Copiar"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Output Content */}
                <div className="p-3">
                    <div className="text-xs text-white/70 bg-black/40 p-3 rounded-xl border border-white/5 font-mono max-h-[200px] overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-gray-800">
                        {output ? (
                            <span className="text-green-400">{output}</span>
                        ) : (
                            <span className="opacity-40 italic flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500/50 animate-pulse" />
                                Aguardando resultado...
                            </span>
                        )}
                    </div>

                    {/* Metrics - Only show when output exists */}
                    {output && (
                        <div className="mt-3 space-y-2 pt-3 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                                    <span>Potencial Viral</span>
                                </div>
                                <span className="text-[11px] font-bold text-white">8.5/10</span>
                            </div>

                            {/* Progress bar with gradient */}
                            <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
                                    style={{ width: '85%' }}
                                />
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                                {['Curiosidade', 'Emoção', 'Identidade'].map((trigger) => (
                                    <span
                                        key={trigger}
                                        className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                                    >
                                        {trigger}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3 !h-3 !bg-gradient-to-r from-indigo-500 to-purple-500 !border-2 !border-black/50 !shadow-lg"
                />
            </div>

            {/* Copy feedback */}
            {copied && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs rounded-full animate-in fade-in slide-in-from-bottom-2">
                    Copiado!
                </div>
            )}
        </div>
    );
}
