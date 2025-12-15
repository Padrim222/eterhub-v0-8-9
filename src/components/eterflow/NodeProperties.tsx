import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Node } from '@xyflow/react';

interface NodePropertiesProps {
    selectedNode: Node | undefined;
    updateNodeData: (key: string, value: string) => void;
}

export const NodeProperties = ({ selectedNode, updateNodeData }: NodePropertiesProps) => {
    if (!selectedNode) return null;

    return (
        <div className="absolute top-4 right-4 w-80 z-10">
            <Card className="p-4 bg-card border-border shadow-2xl backdrop-blur-md">
                <h3 className="text-lg font-bold mb-4 text-white">Properties: {selectedNode.type}</h3>
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs text-muted-foreground">Label</Label>
                        <Input
                            value={selectedNode.data.label as string}
                            onChange={(e) => updateNodeData('label', e.target.value)}
                            className="bg-background border-input text-foreground"
                        />
                    </div>

                    {selectedNode.type === 'agent' && (
                        <>
                            <div>
                                <Label className="text-xs text-muted-foreground">Agent Role</Label>
                                <Select
                                    value={(selectedNode.data.agentRole as string) || 'generic'}
                                    onValueChange={(val) => {
                                        let sysPrompt = '';
                                        if (val === 'observer') sysPrompt = 'You are The Scientist. Analyze the input data to identify psychological triggers (Emotional Arousal, Social Currency...) and algorithmic patterns.';
                                        if (val === 'strategist') sysPrompt = 'You are The Strategist. Formulate viral theses based on the patterns provided, intersecting Market, Audience, and Objective.';
                                        if (val === 'researcher') sysPrompt = 'You are The Researcher. Find articulated evidence (stats, cases, studies) that prove the point of the selected thesis.';
                                        if (val === 'architect') sysPrompt = 'You are The Architect. Structure the script following the 80/20 rule (80% proven pattern, 20% innovation).';
                                        if (val === 'personalizer') sysPrompt = 'You are The Voice. Rewrite the script applying the Brand Identity (Tone, Slang, Values).';

                                        updateNodeData('agentRole', val);
                                        updateNodeData('systemPrompt', sysPrompt);
                                    }}
                                >
                                    <SelectTrigger className="bg-background border-input text-foreground">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="generic">Generic Assistant</SelectItem>
                                        <SelectItem value="observer">1. Observer (Scientist)</SelectItem>
                                        <SelectItem value="strategist">2. Strategist (Formulator)</SelectItem>
                                        <SelectItem value="researcher">3. Researcher (Journalist)</SelectItem>
                                        <SelectItem value="architect">4. Architect (Scriptwriter)</SelectItem>
                                        <SelectItem value="personalizer">5. Personalizer (Voice)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">AI Model</Label>
                                <Select
                                    value={(selectedNode.data.model as string) || 'gpt-4o'}
                                    onValueChange={(val) => updateNodeData('model', val)}
                                >
                                    <SelectTrigger className="bg-background border-input text-foreground">
                                        <SelectValue placeholder="Select Model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                                        <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">System Prompt</Label>
                                <Textarea
                                    value={(selectedNode.data.systemPrompt as string) || ''}
                                    onChange={(e) => updateNodeData('systemPrompt', e.target.value)}
                                    className="bg-background border-input text-foreground min-h-[80px]"
                                    placeholder="You are a helpful assistant..."
                                />
                            </div>
                        </>
                    )}

                    {(selectedNode.type === 'prompt' || selectedNode.type === 'agent') && (
                        <div>
                            <Label className="text-xs text-muted-foreground">
                                {selectedNode.type === 'agent' ? 'User Instructions' : 'Prompt Content'}
                            </Label>
                            <Textarea
                                value={(selectedNode.data.prompt as string) || ''}
                                onChange={(e) => updateNodeData('prompt', e.target.value)}
                                className="bg-background border-input text-foreground min-h-[100px]"
                                placeholder="Enter instructions available to the user..."
                            />
                        </div>
                    )}

                    <div className="pt-2 text-[10px] text-gray-500 border-t border-gray-800 mt-2">
                        ID: {selectedNode.id}
                    </div>
                </div>
            </Card>
        </div>
    );
};
