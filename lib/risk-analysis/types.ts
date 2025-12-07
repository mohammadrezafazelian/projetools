/**
 * Type definitions for Risk Behavior Analysis Module
 * All types match the specification exactly
 */

export type ActivityLevel = 1 | 2;

export interface Activity {
  id: string;
  title: string;
  level: ActivityLevel;
  start: string; // ISO date string
  end: string; // ISO date string
  cost: number;
  // Derived fields (computed)
  durationDays?: number;
  baselineCost?: number;
}

export type RelationType = "dependency" | "concurrent";

export interface RiskRelation {
  riskId: string;
  relationType: RelationType;
  strength?: number; // default 0.3
}

export interface Risk {
  id: string;
  title: string;
  probability: number; // 0-100
  timeImpactPercent: number;
  costImpactPercent: number;
  scopeImpactPercent: number;
  category: string;
  trigger: string;
  responsePlan: string;
  relatedRisks: RiskRelation[];
  affectedActivities: string[]; // Activity IDs
}

export interface Input {
  activities: Activity[];
  risks: Risk[];
}

// Sensitivity analysis output
export interface Sensitivity {
  probabilitySensitivity: number;
  timeImpactSensitivity: number;
  costImpactSensitivity: number;
  scopeImpactSensitivity: number;
}

// Recommendation output
export interface Recommendation {
  action: string;
  ROI?: number; // Only if mitigation cost is provided
}

// Per-risk analysis output
export interface RiskAnalysisOutput {
  riskId: string;
  title: string;
  affectedDurationSum: number;
  affectedCostSum: number;
  addedDays: number;
  expectedTimeImpact: number;
  addedCost: number;
  expectedCostImpact: number;
  scopeChangeRatio: number;
  propagatedProbability: number;
  behaviorScore: number;
  sensitivity: Sensitivity;
  recommendations: Recommendation[];
}

// Combined scenario output
export interface CombinedScenario {
  riskIds: string[];
  combinedTimeImpactPercent: number;
  combinedCostImpactPercent: number;
  combinedExpectedTimeImpact: number;
  combinedExpectedCostImpact: number;
}

// Propagation result
export interface PropagationResult {
  riskId: string;
  originalProbability: number;
  finalProbability: number;
  propagationPath: string[];
}

// Monte Carlo simulation output (optional)
export interface MonteCarloOutput {
  enabled: boolean;
  iterations?: number;
  totalCostDistribution?: {
    mean: number;
    stdDev: number;
    percentiles: {
      p10: number;
      p50: number;
      p90: number;
    };
  };
  totalDurationDistribution?: {
    mean: number;
    stdDev: number;
    percentiles: {
      p10: number;
      p50: number;
      p90: number;
    };
  };
  probabilityOverDeadline?: number;
  probabilityOverBudget?: number;
}

// Main analysis output
export interface AnalysisOutput {
  perRiskAnalysis: RiskAnalysisOutput[];
  combinedScenarios: CombinedScenario[];
  propagationResults: PropagationResult[];
  topRisksByBehaviorScore: RiskAnalysisOutput[];
  topRisksByExpectedImpact: RiskAnalysisOutput[];
  monteCarlo?: MonteCarloOutput;
}

