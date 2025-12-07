/**
 * Core calculation functions for Risk Behavior Analysis
 * All formulas are explicitly documented and match the specification
 */

import {
  Activity,
  Risk,
  RiskAnalysisOutput,
  CombinedScenario,
  PropagationResult,
  Sensitivity,
} from "./types";

/**
 * Calculate duration in calendar days between two dates
 * Formula: durationDays = end - start (calendar days)
 */
export function calculateDurationDays(start: string, end: string): number {
  if (!start || !end || start.trim() === '' || end.trim() === '') {
    return 0;
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 0;
  }
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate derived fields for activities
 * Only Level 2 activities have durations (Level 1 artifacts have no dates)
 */
export function enrichActivities(activities: Activity[]): Activity[] {
  return activities.map((activity) => {
    // Only calculate duration for Level 2 activities (which have dates)
    // Level 1 artifacts have empty start/end dates
    const durationDays = activity.level === 2 && activity.start && activity.end
      ? calculateDurationDays(activity.start, activity.end)
      : 0;
    
    return {
      ...activity,
      durationDays,
      baselineCost: activity.cost,
    };
  });
}

/**
 * Get sum of durations for affected activities
 * Formula: Sum of durations of affected activities
 * Only includes Level 2 activities (Level 1 artifacts have no durations)
 */
export function getAffectedDurationSum(
  risk: Risk,
  activities: Activity[]
): number {
  const affectedActivities = activities.filter((a) =>
    risk.affectedActivities.includes(a.id) && a.level === 2
  );
  return affectedActivities.reduce((sum, a) => {
    // Only calculate duration for Level 2 activities with valid dates
    if (a.level === 2 && a.start && a.end) {
      const duration = a.durationDays ?? calculateDurationDays(a.start, a.end);
      return sum + duration;
    }
    return sum;
  }, 0);
}

/**
 * Get sum of costs for affected activities
 * Formula: Sum of cost of affected activities
 * Only includes Level 2 activities (Level 1 artifacts have no costs)
 */
export function getAffectedCostSum(risk: Risk, activities: Activity[]): number {
  const affectedActivities = activities.filter((a) =>
    risk.affectedActivities.includes(a.id) && a.level === 2
  );
  return affectedActivities.reduce((sum, a) => sum + (a.baselineCost ?? a.cost), 0);
}

/**
 * Calculate single-risk time impact
 * Formula: addedDays_R = affectedDurationSum * (timeImpactPercent / 100)
 * Formula: expectedTimeImpact_R = addedDays_R * (probability / 100)
 */
export function calculateTimeImpact(
  risk: Risk,
  affectedDurationSum: number
): { addedDays: number; expectedTimeImpact: number } {
  const addedDays = affectedDurationSum * (risk.timeImpactPercent / 100);
  const expectedTimeImpact = addedDays * (risk.probability / 100);
  return { addedDays, expectedTimeImpact };
}

/**
 * Calculate single-risk cost impact
 * Formula: addedCost_R = affectedCostSum * (costImpactPercent / 100)
 * Formula: expectedCostImpact_R = addedCost_R * (probability / 100)
 */
export function calculateCostImpact(
  risk: Risk,
  affectedCostSum: number
): { addedCost: number; expectedCostImpact: number } {
  const addedCost = affectedCostSum * (risk.costImpactPercent / 100);
  const expectedCostImpact = addedCost * (risk.probability / 100);
  return { addedCost, expectedCostImpact };
}

/**
 * Calculate scope change ratio
 * Formula: scopeChangeRatio = scopeImpactPercent / 100
 */
export function calculateScopeChangeRatio(risk: Risk): number {
  return risk.scopeImpactPercent / 100;
}

/**
 * Calculate sensitivity analysis for a risk
 * Formula: dExpectedCost/dProb ≈ expectedCostImpact / probability
 * Formula: dExpectedTime/dProb ≈ expectedTimeImpact / probability
 * Formula: dAddedDays/dTimeImpactPercent = affectedDurationSum / 100
 * Formula: dAddedCost/dCostImpactPercent = affectedCostSum / 100
 */
export function calculateSensitivity(
  risk: Risk,
  affectedDurationSum: number,
  affectedCostSum: number,
  expectedTimeImpact: number,
  expectedCostImpact: number
): Sensitivity {
  const probabilitySensitivity =
    risk.probability > 0 ? expectedCostImpact / risk.probability : 0;
  const timeImpactSensitivity = affectedDurationSum / 100;
  const costImpactSensitivity = affectedCostSum / 100;
  const scopeImpactSensitivity = risk.scopeImpactPercent / 100;

  return {
    probabilitySensitivity,
    timeImpactSensitivity,
    costImpactSensitivity,
    scopeImpactSensitivity,
  };
}

/**
 * Calculate dependency centrality for a risk
 * Formula: normalized degree in risk network
 */
export function calculateDependencyCentrality(
  risk: Risk,
  allRisks: Risk[]
): number {
  // Count incoming and outgoing relations
  let degree = risk.relatedRisks.length;

  // Count how many other risks reference this risk
  const incomingCount = allRisks.filter((r) =>
    r.relatedRisks.some((rel) => rel.riskId === risk.id)
  ).length;

  degree += incomingCount;

  // Normalize to 0-100 based on max degree in the network
  const maxDegree = Math.max(
    1,
    ...allRisks.map((r) => {
      const out = r.relatedRisks.length;
      const in_ = allRisks.filter((other) =>
        other.relatedRisks.some((rel) => rel.riskId === r.id)
      ).length;
      return out + in_;
    })
  );

  return (degree / maxDegree) * 100;
}

/**
 * Check if risk affects final activities or milestones
 * Formula: timeSensitivityFlag = 1 if affects final activities or milestones else 0
 * For simplicity, we consider activities with level 1 as milestones/final activities
 */
export function calculateTimeSensitivityFlag(
  risk: Risk,
  activities: Activity[]
): number {
  const affectedActivities = activities.filter((a) =>
    risk.affectedActivities.includes(a.id)
  );
  // Check if any affected activity is level 1 (milestone/final)
  const hasFinalActivity = affectedActivities.some((a) => a.level === 1);
  return hasFinalActivity ? 1 : 0;
}

/**
 * Calculate detectability score
 * Formula: detectabilityScore = 1 if trigger exists else 0.5
 */
export function calculateDetectabilityScore(risk: Risk): number {
  return risk.trigger && risk.trigger.trim().length > 0 ? 1 : 0.5;
}

/**
 * Normalize a value to 0-100 range based on max value in array
 */
export function normalizeValue(value: number, maxValue: number): number {
  if (maxValue === 0) return 0;
  return (value / maxValue) * 100;
}

/**
 * Calculate behavior score for a risk
 * Formula: behaviorScore =
 *   0.35 * normalized(expectedTimeImpact)
 * + 0.25 * normalized(expectedCostImpact)
 * + 0.20 * dependencyCentrality
 * + 0.15 * timeSensitivityFlag
 * - 0.05 * detectabilityScore
 */
export function calculateBehaviorScore(
  risk: Risk,
  expectedTimeImpact: number,
  expectedCostImpact: number,
  allRisks: Risk[],
  activities: Activity[],
  maxExpectedTimeImpact: number,
  maxExpectedCostImpact: number
): number {
  const normalizedTimeImpact = normalizeValue(
    expectedTimeImpact,
    maxExpectedTimeImpact
  );
  const normalizedCostImpact = normalizeValue(
    expectedCostImpact,
    maxExpectedCostImpact
  );
  const dependencyCentrality = calculateDependencyCentrality(risk, allRisks);
  const timeSensitivityFlag = calculateTimeSensitivityFlag(risk, activities);
  const detectabilityScore = calculateDetectabilityScore(risk);

  const behaviorScore =
    0.35 * normalizedTimeImpact +
    0.25 * normalizedCostImpact +
    0.2 * dependencyCentrality +
    0.15 * timeSensitivityFlag * 100 - // Convert flag to 0-100 scale
    0.05 * detectabilityScore * 100; // Convert score to 0-100 scale

  return Math.max(0, Math.min(100, behaviorScore)); // Clamp to 0-100
}

/**
 * Calculate single-risk analysis
 */
export function calculateSingleRisk(
  risk: Risk,
  activities: Activity[],
  allRisks: Risk[],
  maxExpectedTimeImpact: number,
  maxExpectedCostImpact: number
): RiskAnalysisOutput {
  const affectedDurationSum = getAffectedDurationSum(risk, activities);
  const affectedCostSum = getAffectedCostSum(risk, activities);

  const { addedDays, expectedTimeImpact } = calculateTimeImpact(
    risk,
    affectedDurationSum
  );
  const { addedCost, expectedCostImpact } = calculateCostImpact(
    risk,
    affectedCostSum
  );

  const scopeChangeRatio = calculateScopeChangeRatio(risk);
  const sensitivity = calculateSensitivity(
    risk,
    affectedDurationSum,
    affectedCostSum,
    expectedTimeImpact,
    expectedCostImpact
  );

  const behaviorScore = calculateBehaviorScore(
    risk,
    expectedTimeImpact,
    expectedCostImpact,
    allRisks,
    activities,
    maxExpectedTimeImpact,
    maxExpectedCostImpact
  );

  return {
    riskId: risk.id,
    title: risk.title,
    affectedDurationSum,
    affectedCostSum,
    addedDays,
    expectedTimeImpact,
    addedCost,
    expectedCostImpact,
    scopeChangeRatio,
    propagatedProbability: risk.probability, // Will be updated by propagation
    behaviorScore,
    sensitivity,
    recommendations: [], // Will be populated if mitigation options provided
  };
}

/**
 * Calculate combined impact for multiple risks affecting the same activity
 * Formula: combinedTimeImpactPercent = min(200, sum(timeImpactPercent_i))
 * Formula: combinedCostImpactPercent = min(200, sum(costImpactPercent_i))
 */
export function calculateCombinedImpact(
  riskIds: string[],
  risks: Risk[],
  activities: Activity[]
): CombinedScenario {
  const selectedRisks = risks.filter((r) => riskIds.includes(r.id));

  // Find activities affected by all selected risks
  // Only consider Level 2 activities (Level 1 artifacts have no dates/costs)
  const commonActivities = activities.filter((a) =>
    selectedRisks.every((r) => r.affectedActivities.includes(a.id)) && a.level === 2
  );

  if (commonActivities.length === 0) {
    return {
      riskIds,
      combinedTimeImpactPercent: 0,
      combinedCostImpactPercent: 0,
      combinedExpectedTimeImpact: 0,
      combinedExpectedCostImpact: 0,
    };
  }

  // Sum impact percentages (capped at 200%)
  const combinedTimeImpactPercent = Math.min(
    200,
    selectedRisks.reduce((sum, r) => sum + r.timeImpactPercent, 0)
  );
  const combinedCostImpactPercent = Math.min(
    200,
    selectedRisks.reduce((sum, r) => sum + r.costImpactPercent, 0)
  );

  // Calculate combined impacts using the combined percentages
  // Only sum durations from Level 2 activities with valid dates
  const affectedDurationSum = commonActivities.reduce((sum, a) => {
    if (a.level === 2 && a.start && a.end) {
      const duration = a.durationDays ?? calculateDurationDays(a.start, a.end);
      return sum + duration;
    }
    return sum;
  }, 0);

  const affectedCostSum = commonActivities.reduce(
    (sum, a) => sum + (a.baselineCost ?? a.cost),
    0
  );

  // Use average probability of selected risks
  const avgProbability =
    selectedRisks.reduce((sum, r) => sum + r.probability, 0) /
    selectedRisks.length;

  const combinedAddedDays =
    affectedDurationSum * (combinedTimeImpactPercent / 100);
  const combinedExpectedTimeImpact =
    combinedAddedDays * (avgProbability / 100);

  const combinedAddedCost = affectedCostSum * (combinedCostImpactPercent / 100);
  const combinedExpectedCostImpact =
    combinedAddedCost * (avgProbability / 100);

  return {
    riskIds,
    combinedTimeImpactPercent,
    combinedCostImpactPercent,
    combinedExpectedTimeImpact,
    combinedExpectedCostImpact,
  };
}

/**
 * Propagate risk probabilities through relationships
 * Formula: P_target_new = min(100, P_target + strength * P_source)
 * Stop after depth 3 OR no further changes > 0.1%
 */
export function propagateRisk(
  risk: Risk,
  allRisks: Risk[],
  visited: Set<string> = new Set(),
  depth: number = 0,
  path: string[] = []
): PropagationResult {
  if (depth > 3 || visited.has(risk.id)) {
    return {
      riskId: risk.id,
      originalProbability: risk.probability,
      finalProbability: risk.probability,
      propagationPath: path,
    };
  }

  visited.add(risk.id);
  const newPath = [...path, risk.id];

  let finalProbability = risk.probability;

  // Process each related risk
  for (const relation of risk.relatedRisks) {
    const relatedRisk = allRisks.find((r) => r.id === relation.riskId);
    if (!relatedRisk) continue;

    const strength = relation.strength ?? 0.3; // Default 0.3
    const probabilityIncrease = strength * risk.probability;

    // Only propagate if change is significant (> 0.1%)
    if (probabilityIncrease > 0.1) {
      const newProbability = Math.min(
        100,
        relatedRisk.probability + probabilityIncrease
      );

      // Recursively propagate if depth allows
      if (depth < 3 && Math.abs(newProbability - relatedRisk.probability) > 0.1) {
        const propagatedRelated = propagateRisk(
          { ...relatedRisk, probability: newProbability },
          allRisks,
          new Set(visited),
          depth + 1,
          newPath
        );
        finalProbability = Math.max(
          finalProbability,
          propagatedRelated.finalProbability
        );
      }
    }
  }

  return {
    riskId: risk.id,
    originalProbability: risk.probability,
    finalProbability,
    propagationPath: newPath,
  };
}

