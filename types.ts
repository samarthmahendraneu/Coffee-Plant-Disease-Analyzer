export interface RiskFactors {
  pestRisk: number; // 0-100
  diseaseRisk: number; // 0-100
  environmentalStress: number; // 0-100
  nutrientDeficiency: number; // 0-100
}

export interface DailyPlan {
  day: string;
  task: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  diagnosis: string;
  scientificName?: string;
  confidence: number;
  severity: 'Healthy' | 'Low' | 'Moderate' | 'Critical';
  plantPart: string;
  visualIndicators: string[];
  summary: string;
  immediateActions: string[];
  preventativeMeasures: string[];
  riskFactors: RiskFactors;
  weeklyPlan: DailyPlan[];
}

export interface AnalysisState {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
  imagePreview: string | null;
}