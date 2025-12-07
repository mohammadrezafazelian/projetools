/**
 * Main orchestrator function for Risk Behavior Analysis
 * analyzeRiskBehavior(input: Input): AnalysisOutput
 */

import {
  Input,
  AnalysisOutput,
  RiskAnalysisOutput,
  CombinedScenario,
  PropagationResult,
  Risk,
  Activity,
} from "./types";
import {
  enrichActivities,
  calculateSingleRisk,
  calculateCombinedImpact,
  propagateRisk,
} from "./calculations";
import { runMonteCarloSimulation } from "./monte-carlo";

/**
 * Main analysis function
 * Orchestrates all calculations and returns complete analysis output
 */
export function analyzeRiskBehavior(
  input: Input,
  enableMonteCarlo: boolean = false,
  monteCarloIterations: number = 7500,
  deadline?: number,
  budget?: number
): AnalysisOutput {
  // Step 1: Enrich activities with derived fields
  const enrichedActivities = enrichActivities(input.activities);

  // Step 2: Calculate per-risk analysis (initial pass to get max values)
  const initialAnalyses: RiskAnalysisOutput[] = [];
  for (const risk of input.risks) {
    // Use temporary max values (will recalculate)
    const analysis = calculateSingleRisk(
      risk,
      enrichedActivities,
      input.risks,
      1000, // Temporary max
      100000 // Temporary max
    );
    initialAnalyses.push(analysis);
  }

  // Step 3: Find max values for normalization
  const maxExpectedTimeImpact = Math.max(
    1,
    ...initialAnalyses.map((a) => a.expectedTimeImpact)
  );
  const maxExpectedCostImpact = Math.max(
    1,
    ...initialAnalyses.map((a) => a.expectedCostImpact)
  );

  // Step 4: Recalculate with correct max values
  const perRiskAnalysis: RiskAnalysisOutput[] = [];
  for (let i = 0; i < input.risks.length; i++) {
    const risk = input.risks[i];
    const analysis = calculateSingleRisk(
      risk,
      enrichedActivities,
      input.risks,
      maxExpectedTimeImpact,
      maxExpectedCostImpact
    );
    perRiskAnalysis.push(analysis);
  }

  // Step 5: Propagate risks through relationships
  // Use iterative approach to handle all relationships properly
  const propagationResults: PropagationResult[] = [];
  const propagatedRisks: Risk[] = input.risks.map((r) => ({ ...r }));
  
  // Multiple passes to ensure all propagations are captured
  for (let pass = 0; pass < 3; pass++) {
    for (const risk of input.risks) {
      const currentRisk = propagatedRisks.find((r) => r.id === risk.id);
      if (!currentRisk) continue;

      // Check all risks that might affect this one
      for (const otherRisk of propagatedRisks) {
        const relation = otherRisk.relatedRisks.find((rel) => rel.riskId === risk.id);
        if (relation) {
          const strength = relation.strength ?? 0.3;
          const probabilityIncrease = strength * otherRisk.probability;
          
          if (probabilityIncrease > 0.1) {
            const newProbability = Math.min(
              100,
              currentRisk.probability + probabilityIncrease
            );
            currentRisk.probability = newProbability;
          }
        }
      }
    }
  }

  // Create propagation results
  for (const risk of input.risks) {
    const propagated = propagatedRisks.find((r) => r.id === risk.id);
    if (propagated) {
      propagationResults.push({
        riskId: risk.id,
        originalProbability: risk.probability,
        finalProbability: propagated.probability,
        propagationPath: [], // Simplified for now
      });

      // Update analysis with propagated probability
      const analysisIndex = perRiskAnalysis.findIndex(
        (a) => a.riskId === risk.id
      );
      if (analysisIndex >= 0) {
        perRiskAnalysis[analysisIndex].propagatedProbability =
          propagated.probability;
      }
    }
  }

  // Step 6: Recalculate impacts with propagated probabilities
  for (let i = 0; i < perRiskAnalysis.length; i++) {
    const risk = propagatedRisks[i];
    const analysis = perRiskAnalysis[i];

    // Recalculate with propagated probability
    const affectedDurationSum = analysis.affectedDurationSum;
    const affectedCostSum = analysis.affectedCostSum;

    const addedDays = affectedDurationSum * (risk.timeImpactPercent / 100);
    const expectedTimeImpact = addedDays * (risk.probability / 100);

    const addedCost = affectedCostSum * (risk.costImpactPercent / 100);
    const expectedCostImpact = addedCost * (risk.probability / 100);

    perRiskAnalysis[i] = {
      ...analysis,
      addedDays,
      expectedTimeImpact,
      addedCost,
      expectedCostImpact,
    };
  }

  // Step 7: Calculate combined scenarios (top 3 risks by expected impact)
  const top3Risks = [...perRiskAnalysis]
    .sort((a, b) => {
      const impactA = a.expectedTimeImpact + a.expectedCostImpact;
      const impactB = b.expectedTimeImpact + b.expectedCostImpact;
      return impactB - impactA;
    })
    .slice(0, 3)
    .map((a) => a.riskId);

  const combinedScenarios: CombinedScenario[] = [];
  if (top3Risks.length >= 2) {
    // Generate combinations of top 3 risks
    for (let i = 0; i < top3Risks.length; i++) {
      for (let j = i + 1; j < top3Risks.length; j++) {
        const scenario = calculateCombinedImpact(
          [top3Risks[i], top3Risks[j]],
          propagatedRisks,
          enrichedActivities
        );
        combinedScenarios.push(scenario);
      }
    }
    // All 3 together
    if (top3Risks.length === 3) {
      const scenario = calculateCombinedImpact(
        top3Risks,
        propagatedRisks,
        enrichedActivities
      );
      combinedScenarios.push(scenario);
    }
  }

  // Step 8: Sort risks by behavior score and expected impact
  const topRisksByBehaviorScore = [...perRiskAnalysis].sort(
    (a, b) => b.behaviorScore - a.behaviorScore
  );

  const topRisksByExpectedImpact = [...perRiskAnalysis].sort((a, b) => {
    const impactA = a.expectedTimeImpact + a.expectedCostImpact;
    const impactB = b.expectedTimeImpact + b.expectedCostImpact;
    return impactB - impactA;
  });

  // Step 9: Optional Monte Carlo simulation
  let monteCarlo;
  if (enableMonteCarlo) {
    monteCarlo = runMonteCarloSimulation(
      propagatedRisks,
      enrichedActivities,
      monteCarloIterations,
      deadline,
      budget
    );
  }

  return {
    perRiskAnalysis,
    combinedScenarios,
    propagationResults,
    topRisksByBehaviorScore,
    topRisksByExpectedImpact,
    monteCarlo,
  };
}

