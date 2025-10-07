// Cálculo do índice IMOVI baseado em equação de terceiro grau
// Fórmula: considera visualizações (peso 1), retenção (peso 2), interações (peso 3), MOVQL (peso 4)

export interface ImoviMetrics {
  views: number;          // Visualizações
  retention: number;      // Retenção (0-100%)
  interactions: number;   // Interações (likes + comments + saves)
  movql: number;         // Leads gerados (MOVQL)
}

export type ImoviLevel = 'RUIM' | 'OK' | 'BOM' | 'MUITO BOM';

export interface ImoviResult {
  score: number;
  level: ImoviLevel;
  color: string;
}

// Calcula o índice IMOVI (0-10)
export function calculateImovi(metrics: ImoviMetrics): ImoviResult {
  const { views, retention, interactions, movql } = metrics;
  
  // Normalizar cada métrica (0-1)
  const normalizedViews = Math.min(views / 10000, 1); // Assume 10k views como max
  const normalizedRetention = retention / 100;
  const normalizedInteractions = Math.min(interactions / 1000, 1); // Assume 1k interactions como max
  const normalizedMovql = Math.min(movql / 100, 1); // Assume 100 leads como max
  
  // Aplicar pesos: Visualizações (1), Retenção (2), Interações (3), MOVQL (4)
  const weightedSum = (
    normalizedViews * 1 +
    normalizedRetention * 2 +
    normalizedInteractions * 3 +
    normalizedMovql * 4
  );
  
  // Total de pesos = 1 + 2 + 3 + 4 = 10
  const score = weightedSum; // Resultado já está em escala 0-10
  
  return {
    score: Math.round(score * 10) / 10, // Arredondar para 1 casa decimal
    level: getImoviLevel(score),
    color: getImoviColor(score)
  };
}

export function getImoviLevel(score: number): ImoviLevel {
  if (score < 3) return 'RUIM';
  if (score < 5) return 'OK';
  if (score < 8) return 'BOM';
  return 'MUITO BOM';
}

export function getImoviColor(score: number): string {
  if (score < 3) return '#EF4444'; // Red
  if (score < 5) return '#F59E0B'; // Yellow/Orange
  if (score < 8) return '#10B981'; // Green
  return '#38EE38'; // Bright Green (primary)
}
