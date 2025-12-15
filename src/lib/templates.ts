import { Node, Edge } from '@xyflow/react';

export const eterflowTemplate = {
    nodes: [
        {
            id: '1',
            type: 'trigger',
            position: { x: 50, y: 300 },
            data: { label: 'Start' },
        },
        {
            id: '2',
            type: 'prompt',
            position: { x: 220, y: 300 },
            data: {
                label: 'Fonte de Dados',
                prompt: 'Métricas do Instagram serão carregadas automaticamente.',
                dataSource: 'instagram',
                postFormat: 'any'
            },
        },
        {
            id: '3',
            type: 'agent',
            position: { x: 450, y: 300 },
            data: {
                label: '1. Observer',
                agentRole: 'observer',
                agentDescription: 'Analisa dados de performance e identifica os Top 10 padrões de sucesso.',
                llm: 'Claude 3 Haiku',
                isTouchpoint: false
            },
        },
        {
            id: '4',
            type: 'agent',
            position: { x: 680, y: 300 },
            data: {
                label: '2. Strategist',
                agentRole: 'strategist',
                agentDescription: 'Gera 10 ideias de temas virais com base nos padrões e tendências.',
                llm: 'Gemini 2.0 Flash',
                isTouchpoint: true  // TOUCHPOINT: Aprovar temas
            },
        },
        {
            id: '5',
            type: 'agent',
            position: { x: 910, y: 300 },
            data: {
                label: '3. Researcher',
                agentRole: 'researcher',
                agentDescription: 'Pesquisa dados, cases, estatísticas e insumos para cada tema.',
                llm: 'Perplexity Sonar',
                isTouchpoint: false
            },
        },
        {
            id: '6',
            type: 'agent',
            position: { x: 1140, y: 300 },
            data: {
                label: '4. Architect',
                agentRole: 'architect',
                agentDescription: 'Estrutura o roteiro seguindo a lógica AIDA.',
                llm: 'Claude 3.5 Sonnet',
                isTouchpoint: true  // TOUCHPOINT: Aprovar estrutura
            },
        },
        {
            id: '7',
            type: 'agent',
            position: { x: 1370, y: 300 },
            data: {
                label: '5. Copywriter',
                agentRole: 'copywriter',
                agentDescription: 'Escreve o texto final humanizado, no tom de voz da marca.',
                llm: 'Gemini 2.0 Flash',
                isTouchpoint: true  // TOUCHPOINT: Aprovar texto final
            },
        },
        {
            id: '8',
            type: 'output',
            position: { x: 1600, y: 300 },
            data: { label: 'Roteiro Final' },
        },
    ] as Node[],
    edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
        { id: 'e3-4', source: '3', target: '4', animated: true },
        { id: 'e4-5', source: '4', target: '5', animated: true },
        { id: 'e5-6', source: '5', target: '6', animated: true },
        { id: 'e6-7', source: '6', target: '7', animated: true },
        { id: 'e7-8', source: '7', target: '8', animated: true },
    ] as Edge[],
};
