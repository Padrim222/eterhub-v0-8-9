import { Node, Edge } from '@xyflow/react';

export const viralEngineTemplate = {
    nodes: [
        {
            id: '1',
            type: 'trigger',
            position: { x: 50, y: 300 },
            data: { label: 'Start Flow' },
        },
        {
            id: '2',
            type: 'agent',
            position: { x: 250, y: 300 },
            data: {
                label: 'Agent 1: Observer',
                agentRole: 'observer',
                model: 'gpt-4o',
                systemPrompt: 'You are The Scientist. Analyze the input data to identify psychological triggers (Emotional Arousal, Social Currency...) and algorithmic patterns.'
            },
        },
        {
            id: '3',
            type: 'agent',
            position: { x: 500, y: 300 },
            data: {
                label: 'Agent 2: Strategist',
                agentRole: 'strategist',
                model: 'gpt-4o',
                systemPrompt: 'You are The Strategist. Formulate viral theses based on the patterns provided, intersecting Market, Audience, and Objective.'
            },
        },
        {
            id: '4',
            type: 'agent',
            position: { x: 750, y: 300 },
            data: {
                label: 'Agent 3: Researcher',
                agentRole: 'researcher',
                model: 'gpt-4o',
                systemPrompt: 'You are The Researcher. Find articulated evidence (stats, cases, studies) that prove the point of the selected thesis.'
            },
        },
        {
            id: '5',
            type: 'agent',
            position: { x: 1000, y: 300 },
            data: {
                label: 'Agent 4: Architect',
                agentRole: 'architect',
                model: 'gpt-4o',
                systemPrompt: 'You are The Architect. Structure the script following the 80/20 rule (80% proven pattern, 20% innovation).'
            },
        },
        {
            id: '6',
            type: 'agent',
            position: { x: 1250, y: 300 },
            data: {
                label: 'Agent 5: Personalizer',
                agentRole: 'personalizer',
                model: 'gpt-4o',
                // System prompt will be appended with Identity in the backend
                systemPrompt: 'You are The Voice. Rewrite the script applying the Brand Identity (Tone, Slang, Values).'
            },
        },
        {
            id: '7',
            type: 'output',
            position: { x: 1500, y: 300 },
            data: { label: 'Final Content' },
        },
    ] as Node[],
    edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
        { id: 'e3-4', source: '3', target: '4', animated: true },
        { id: 'e4-5', source: '4', target: '5', animated: true },
        { id: 'e5-6', source: '5', target: '6', animated: true },
        { id: 'e6-7', source: '6', target: '7', animated: true },
    ] as Edge[],
};
