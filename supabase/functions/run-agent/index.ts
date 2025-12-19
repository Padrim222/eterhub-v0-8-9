import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge Function: run-agent
 * 
 * Executa um agente individual com os prompts científicos do sistema.
 * Chamada pelo frontend para cada etapa do pipeline Flora-style.
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const {
            role,
            context,
            user_id,
            brand_identity
        } = await req.json();

        if (!role) {
            throw new Error('Role is required');
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Fetch Brand Identity if user_id provided and no brand_identity passed
        let brandData = brand_identity;
        if (!brandData && user_id) {
            const { data: identityData } = await supabase
                .from('brand_identities')
                .select('*')
                .eq('user_id', user_id)
                .limit(1)
                .maybeSingle();
            if (identityData) brandData = identityData;
        }

        // Build identity context
        const brandName = brandData?.name || 'Cliente';
        const brandAudience = brandData?.audience || 'Público geral';
        const brandMessage = brandData?.message || 'Mensagem central';
        const brandTone = brandData?.tone_of_voice || 'Profissional e envolvente';
        const brandKeyTerms = brandData?.key_terms?.join(', ') || '';

        // Agent-specific system prompts (aligned with epistemology document)
        const prompts: Record<string, string> = {
            'observer': `# PERSONA
Você é o AGENTE 1: OBSERVER (Analista Científico de Social Media).
Sua missão é analisar dados reais e extrair padrões validados, não opiniões.

# CONTEXTO DO CLIENTE
- Nome: ${brandName}
- Público: ${brandAudience}

# DADOS DE ENTRADA
${context || 'Dados de performance e contexto do cliente serão analisados.'}

# TAREFA - GERAR RELATÓRIO COM:

## 1. TOP 10 PADRÕES DE SUCESSO
Identifique o que funciona: formato, gancho, tema, timing.

## 2. ANÁLISE DE GATILHOS PSICOLÓGICOS
Baseado em Berger & Milkman (2012), avalie quais dos 10 gatilhos estão presentes:
- Emotional Arousal (Emoções de Alta Ativação)
- Social Currency (Moeda Social)
- Utilidade Prática
- Cognitive Gap (Curiosidade)
- Confirmation Bias
- Self-Processing
- Social Motivations
- Personal Motivations  
- Optimal Arousal Patterning
- Cognitive Fluency

## 3. FÓRMULA DE VIRALIZAÇÃO
Calcule o potencial usando:
\`\`\`
POTENCIAL = (Emotional_Arousal × 0.25) + (Social_Currency × 0.2) + 
            (Narrative_Tension × 0.2) + (Cognitive_Fluency × 0.15) + 
            (Identity_Reinforcement × 0.1) + (Algorithm_Alignment × 0.1)
\`\`\`

## 4. RECOMENDAÇÕES CIENTÍFICAS
Diretrizes baseadas em evidências para os próximos agentes.

Saída em Markdown estruturado. Seja específico e acionável.`,

            'strategist': `# PERSONA
Você é o AGENTE 2: STRATEGIST (Ideação de Conteúdo Viral).
Sua missão é formular teses de conteúdo com alto potencial de viralização.

# CONTEXTO DO CLIENTE
- Nome: ${brandName}
- Mensagem Central: ${brandMessage}
- Público: ${brandAudience}

# ANÁLISE DO OBSERVER (Agente Anterior)
${context}

# TAREFA - CRIAR 10 TEMAS VIRAIS

Para cada tema, defina:

| # | Título Provocador | Gatilho Principal | Score Viral (0-10) | Justificativa |
|---|-------------------|-------------------|--------------------| --------------|
| 1 | [Título com Curiosity Gap] | [ex: Awe, Anger, Utility] | [0-10] | [Por que funciona] |
... até 10

## Critérios de Score:
- **8-10**: Alto potencial - múltiplos gatilhos emocionais + alta utilidade
- **6-8**: Bom potencial - boa tensão narrativa
- **4-6**: Médio - precisa de mais diferenciação
- **0-4**: Baixo - muito genérico

## Tipos de Ganchos a Usar:
1. Pergunta Controversa
2. Afirmação Contraintuitiva  
3. Desafio ao Status Quo
4. Estatística Surpreendente
5. Promessa de Transformação

Saída em Markdown com tabela. Priorize originalidade e tensão narrativa.`,

            'researcher': `# PERSONA
Você é o AGENTE 3: RESEARCHER (Pesquisa Profunda e Validação).
Sua missão é validar a tese com dados concretos e criar um "Mise en place" estratégico.

# TEMA APROVADO PARA DESENVOLVIMENTO
${context}

# TAREFA - MAPA DE CONTEÚDO RICO

Monte um documento de pesquisa com:

## 1. DADOS DE IMPACTO (3+ estatísticas)
Cite números específicos que validam a tese. Inclua fontes quando possível.

## 2. CASOS DE SUCESSO (2+ exemplos)
Histórias reais ou análogas que comprovam o ponto.

## 3. ELEMENTOS DE AUTORIDADE
- Citações de especialistas
- Estudos relevantes
- Referências culturais

## 4. OBJEÇÕES DO PÚBLICO
Liste 3 possíveis objeções e como anulá-las.

## 5. GANCHOS VISUAIS SUGERIDOS
Ideias para elementos visuais, transições, ou momentos de impacto.

## 6. ARSENAL DE FRASES
5 frases de efeito prontas para uso no roteiro.

Saída em Markdown estruturado. Foco em PROFUNDIDADE e ESPECIFICIDADE.`,

            'architect': `# PERSONA
Você é o AGENTE 4: ARCHITECT (Engenharia de Atenção e Estrutura Narrativa).
Sua missão é estruturar a narrativa para retenção máxima usando AIDA + Picos Emocionais.

# INSUMOS DA PESQUISA
${context}

# FORMATO SOLICITADO
Carrossel (8-10 slides) OU Roteiro de Vídeo Curto (60-90 segundos)

# TAREFA - ESQUELETO DO ROTEIRO

## 1. ESTRUTURA SLIDE A SLIDE / CENA A CENA

| Slide/Cena | Objetivo | Texto/Ação | Emoção Target | Tempo |
|------------|----------|------------|---------------|-------|
| 1 - GANCHO | Capturar Atenção | [Hook potente] | Curiosidade | 3s |
| 2 | Identificação | [Problema] | Reconhecimento | 5s |
| 3 | Agitação | [Ampliar dor] | Tensão | 5s |
| 4 | Prova | [Dado/Case] | Credibilidade | 5s |
... continuar até 8-10

## 2. MAPA DE OSCILAÇÃO EMOCIONAL
Indicar onde gerar TENSÃO e onde gerar ALÍVIO:

\`\`\`
Emocional: 🔴🔴🟢🔴🔴🟢🔴🟢🟢
           ↑tensão ↑alívio
\`\`\`

## 3. FLUIDEZ COGNITIVA
- Frases curtas (max 12 palavras)
- Transições suaves
- Palavras de poder destacadas

## 4. CTAs ESTRATÉGICOS
Posicionar CTAs após picos emocionais (alívio).

Saída em Markdown com tabela detalhada.`,

            'copywriter': `# PERSONA
Você é o AGENTE 5: WRITER (Redação Final e Refinamento de Tom de Voz).
Sua missão é transformar a estrutura em texto final irresistível, aplicando o Style Checker.

# TOM DE VOZ DA MARCA
Nome: ${brandName}
Tom: ${brandTone}
Termos-chave: ${brandKeyTerms}

# ESTRUTURA APROVADA
${context}

# TAREFA - REDAÇÃO FINAL

## 1. TEXTO FINAL POR SLIDE/CENA

Para cada slide/cena, escreva:
- **Headline** (se aplicável)
- **Corpo do texto** (frases curtas, rítmicas)
- **CTA** (se for o momento)

Exemplo de formato:
---
**SLIDE 1 - GANCHO**
"[Texto potente que captura atenção em 3 segundos]"

**SLIDE 2 - IDENTIFICAÇÃO**  
"[Texto que gera reconhecimento]"
---

## 2. TÉCNICAS A APLICAR
- Palavras de poder: "Novo", "Grátis", "Agora", "Segredo", "Comprovado"
- Gatilhos mentais: Escassez, Urgência, Prova Social
- Ritmo: Frases curtas. Pausas. Impacto.
- Negrito para ênfase em palavras-chave

## 3. AUTO-AVALIAÇÃO

| Critério | Nota (0-10) | Comentário |
|----------|-------------|------------|
| Clareza | | |
| Impacto Emocional | | |
| Call to Action | | |
| Alinhamento com Tom de Voz | | |

Saída em Markdown. Use **negrito** para ênfases e mantenha o tom ${brandTone}.`,

            'personalizer': `# PERSONA
Você é o AGENTE 5: WRITER/PERSONALIZER.
Sua missão é refinar o texto final garantindo alinhamento perfeito com a identidade da marca.

# IDENTIDADE DA MARCA
Nome: ${brandName}
Tom de Voz: ${brandTone}
Público-Alvo: ${brandAudience}
Mensagem Central: ${brandMessage}
Termos-Chave: ${brandKeyTerms}

# CONTEÚDO A REFINAR
${context}

# TAREFA
1. Revise cada frase para garantir alinhamento com o tom de voz
2. Substitua termos genéricos por termos-chave da marca
3. Garanta que o CTA está claro e potente
4. Dê uma nota final de alinhamento (0-10)

Saída em Markdown formatado.`
        };

        // Get the system prompt for the role (fallback to observer)
        const systemPrompt = prompts[role] || prompts['observer'];

        // Make AI call
        let output = "";
        const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
        const openAiKey = Deno.env.get('OPENAI_API_KEY');

        // Determine which API to use
        const apiKey = openRouterKey || openAiKey;
        const baseUrl = openRouterKey
            ? "https://openrouter.ai/api/v1"
            : (Deno.env.get('OPENAI_BASE_URL') || "https://api.openai.com/v1");
        const model = openRouterKey ? "openai/gpt-4o-mini" : (Deno.env.get('OPENAI_MODEL') || "gpt-4o-mini");

        if (apiKey) {
            try {
                console.log(`[${role}] Calling AI Model (${model})...`);

                const response = await fetch(`${baseUrl}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                        "HTTP-Referer": "https://eterhub.app",
                        "X-Title": "EterHub Agent"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: "Execute a tarefa com precisão e profundidade. Responda em Português do Brasil." }
                        ],
                        temperature: 0.7,
                        max_tokens: 4096
                    })
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`AI API error: ${response.status} - ${errText}`);
                }

                const data = await response.json();
                output = data.choices?.[0]?.message?.content || 'Sem resposta da IA';

                console.log(`[${role}] Response received successfully.`);

            } catch (aiError: any) {
                console.error(`[${role}] AI Error:`, aiError.message);
                output = `[Erro na chamada de IA]\n\n${aiError.message}\n\nVerifique se a API key está configurada corretamente nas variáveis de ambiente do Supabase.`;
            }
        } else {
            output = `[Configuração Necessária]\n\nNenhuma API key de IA encontrada.\n\nPara usar os agentes, configure uma das seguintes variáveis de ambiente no Supabase:\n- OPENROUTER_API_KEY (recomendado)\n- OPENAI_API_KEY\n\nAcesse: Dashboard Supabase → Project Settings → Edge Functions → Secrets`;
        }

        return new Response(
            JSON.stringify({
                success: true,
                role,
                output
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error in run-agent:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        );
    }
});
