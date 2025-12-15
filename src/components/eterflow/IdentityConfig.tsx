import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface BrandIdentity {
    id: string;
    name: string;
    tone_of_voice: string | null;
    key_terms: string[] | null;
    beliefs: string | null;
    avoid_terms: string[] | null;
}

export function IdentityConfig() {
    const { toast } = useToast();
    const [identities, setIdentities] = useState<BrandIdentity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentIdentity, setCurrentIdentity] = useState<Partial<BrandIdentity>>({
        name: "",
        tone_of_voice: "",
        key_terms: [],
        beliefs: "",
        avoid_terms: [],
    });
    const [isEditing, setIsEditing] = useState(false);

    const [termInput, setTermInput] = useState("");
    const [avoidInput, setAvoidInput] = useState("");

    useEffect(() => {
        fetchIdentities();
    }, []);

    const fetchIdentities = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('brand_identities')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: "Erro", description: "Falha ao carregar identidades.", variant: "destructive" });
        } else {
            setIdentities(data || []);
        }
    };

    const handleSave = async () => {
        if (!currentIdentity.name) {
            toast({ title: "Nome obrigatório", description: "Dê um nome para a identidade.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        const payload = {
            user_id: user.id,
            name: currentIdentity.name,
            tone_of_voice: currentIdentity.tone_of_voice || null,
            key_terms: currentIdentity.key_terms || [],
            beliefs: currentIdentity.beliefs || null,
            avoid_terms: currentIdentity.avoid_terms || [],
            psychological_profile: {}
        };

        let error;
        if (currentIdentity.id) {
            // Update
            const { error: updateError } = await supabase
                .from('brand_identities')
                .update(payload)
                .eq('id', currentIdentity.id);
            error = updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('brand_identities')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Sucesso", description: "Manual do Movimento salvo!" });
            fetchIdentities();
            resetForm();
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('brand_identities').delete().eq('id', id);
        if (error) {
            toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
        } else {
            fetchIdentities();
            if (currentIdentity.id === id) resetForm();
        }
    };

    const resetForm = () => {
        setCurrentIdentity({
            name: "",
            tone_of_voice: "",
            key_terms: [],
            beliefs: "",
            avoid_terms: [],
        });
        setIsEditing(false);
    };

    const selectIdentity = (identity: BrandIdentity) => {
        setCurrentIdentity(identity);
        setIsEditing(true);
    };

    const addTerm = () => {
        if (termInput.trim()) {
            setCurrentIdentity(prev => ({ ...prev, key_terms: [...(prev.key_terms || []), termInput.trim()] }));
            setTermInput("");
        }
    };

    const addAvoidTerm = () => {
        if (avoidInput.trim()) {
            setCurrentIdentity(prev => ({ ...prev, avoid_terms: [...(prev.avoid_terms || []), avoidInput.trim()] }));
            setAvoidInput("");
        }
    };

    const removeTerm = (term: string) => {
        setCurrentIdentity(prev => ({ ...prev, key_terms: prev.key_terms?.filter(t => t !== term) }));
    };

    const removeAvoidTerm = (term: string) => {
        setCurrentIdentity(prev => ({ ...prev, avoid_terms: prev.avoid_terms?.filter(t => t !== term) }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full p-4 text-white">
            {/* List of Identities */}
            <Card className="col-span-1 bg-black/50 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Meus Movimentos</CardTitle>
                    <Button size="sm" variant="ghost" onClick={resetForm}><Plus className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {identities.map(id => (
                        <div key={id.id} className="flex items-center justify-between p-3 rounded bg-gray-900/50 hover:bg-gray-800 cursor-pointer border border-gray-800" onClick={() => selectIdentity(id)}>
                            <span className="font-medium text-sm">{id.name}</span>
                            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(id.id); }}>
                                <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                        </div>
                    ))}
                    {identities.length === 0 && <p className="text-muted-foreground text-xs">Nenhuma identidade criada.</p>}
                </CardContent>
            </Card>

            {/* Editor Form */}
            <Card className="col-span-1 md:col-span-2 bg-black/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">{currentIdentity.id ? 'Editar' : 'Novo'} Manual do Movimento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome do Movimento / Persona</Label>
                            <Input
                                value={currentIdentity.name}
                                onChange={(e) => setCurrentIdentity({ ...currentIdentity, name: e.target.value })}
                                placeholder="Ex: Cyberpunk Rebel, Agência Minimalista..."
                                className="bg-gray-950 border-gray-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tom de Voz</Label>
                            <Input
                                value={currentIdentity.tone_of_voice || ''}
                                onChange={(e) => setCurrentIdentity({ ...currentIdentity, tone_of_voice: e.target.value })}
                                placeholder="Ex: Provocador, Direto, Técnico, Descontraído..."
                                className="bg-gray-950 border-gray-800"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Crenças & Proposta de Valor</Label>
                        <Textarea
                            value={currentIdentity.beliefs || ''}
                            onChange={(e) => setCurrentIdentity({ ...currentIdentity, beliefs: e.target.value })}
                            placeholder="No que você acredita? O que você combate? Qual sua promessa?"
                            className="bg-gray-950 border-gray-800 min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Vocabulário & Expressões (Key Terms)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={termInput}
                                    onChange={(e) => setTermInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTerm()}
                                    placeholder="Add termo..."
                                    className="bg-gray-950 border-gray-800"
                                />
                                <Button onClick={addTerm} variant="secondary" size="sm"><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {currentIdentity.key_terms?.map(term => (
                                    <span key={term} className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                                        {term} <span className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeTerm(term)}>×</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Termos a Evitar</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={avoidInput}
                                    onChange={(e) => setAvoidInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addAvoidTerm()}
                                    placeholder="Add termo..."
                                    className="bg-gray-950 border-gray-800"
                                />
                                <Button onClick={addAvoidTerm} variant="secondary" size="sm"><Plus className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {currentIdentity.avoid_terms?.map(term => (
                                    <span key={term} className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                                        {term} <span className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => removeAvoidTerm(term)}>×</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} disabled={isLoading} className="w-40">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Salvar Manual
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
