/**
 * Monte Carlo Simulation for Risk Analysis
 * Only enabled if user explicitly turns it on
 */

import { Activity, Risk, MonteCarloOutput } from "./types";
import { calculateDurationDays } from "./calculations";

/**
 * Generate triangular distribution random value
 * min = 0.8 × mode, mode = actual%, max = 1.2 × mode
 */
function triangularRandom(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * Run single Monte Carlo iteration
 */
function runIteration(risks: Risk[], activities: Activity[]): {
  totalCost: number;
  totalDuration: number;
} {
  let totalCost = 0;
  let totalDuration = 0;

  // Calculate baseline totals (only Level 2 activities have costs and durations)
  const level2Activities = activities.filter((a) => a.level === 2);
  const baselineCost = level2Activities.reduce((sum, a) => sum + a.cost, 0);
  const baselineDuration = level2Activities.reduce((sum, a) => {
    if (a.start && a.end) {
      const duration = a.durationDays ?? calculateDurationDays(a.start, a.end);
      return sum + duration;
    }
    return sum;
  }, 0);

  // Simulate each risk
  for (const risk of risks) {
    // Bernoulli trigger: risk occurs with probability
    const riskOccurs = Math.random() * 100 < risk.probability;

    if (riskOccurs) {
      // Get affected activities (only Level 2 activities have costs and durations)
      const affectedActivities = level2Activities.filter((a) =>
        risk.affectedActivities.includes(a.id)
      );

      if (affectedActivities.length > 0) {
        const affectedCost = affectedActivities.reduce(
          (sum, a) => sum + a.cost,
          0
        );
        const affectedDuration = affectedActivities.reduce((sum, a) => {
          if (a.start && a.end) {
            const duration = a.durationDays ?? calculateDurationDays(a.start, a.end);
            return sum + duration;
          }
          return sum;
        }, 0);

        // Triangular distribution for impact percentages
        const timeImpactMultiplier = triangularRandom(
          risk.timeImpactPercent * 0.8,
          risk.timeImpactPercent,
          risk.timeImpactPercent * 1.2
        ) / 100;

        const costImpactMultiplier = triangularRandom(
          risk.costImpactPercent * 0.8,
          risk.costImpactPercent,
          risk.costImpactPercent * 1.2
        ) / 100;

        totalCost += affectedCost * costImpactMultiplier;
        totalDuration += affectedDuration * timeImpactMultiplier;
      }
    }
  }

  return {
    totalCost: baselineCost + totalCost,
    totalDuration: baselineDuration + totalDuration,
  };
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  const index = Math.ceil((p / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
}

/**
 * Calculate mean and standard deviation
 */
function calculateStats(values: number[]): {
  mean: number;
  stdDev: number;
} {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev };
}

/**
 * Run Monte Carlo simulation
 * Iterations: 5k-10k (default 7500)
 */
export function runMonteCarloSimulation(
  risks: Risk[],
  activities: Activity[],
  iterations: number = 7500,
  deadline?: number,
  budget?: number
): MonteCarloOutput {
  const costResults: number[] = [];
  const durationResults: number[] = [];

  // Run iterations
  for (let i = 0; i < iterations; i++) {
    const { totalCost, totalDuration } = runIteration(risks, activities);
    costResults.push(totalCost);
    durationResults.push(totalDuration);
  }

  // Sort for percentile calculation
  costResults.sort((a, b) => a - b);
  durationResults.sort((a, b) => a - b);

  // Calculate statistics
  const costStats = calculateStats(costResults);
  const durationStats = calculateStats(durationResults);

  // Calculate probabilities
  let probabilityOverDeadline = 0;
  if (deadline !== undefined) {
    probabilityOverDeadline =
      durationResults.filter((d) => d > deadline).length / iterations;
  }

  let probabilityOverBudget = 0;
  if (budget !== undefined) {
    probabilityOverBudget =
      costResults.filter((c) => c > budget).length / iterations;
  }

  return {
    enabled: true,
    iterations,
    totalCostDistribution: {
      mean: costStats.mean,
      stdDev: costStats.stdDev,
      percentiles: {
        p10: percentile(costResults, 10),
        p50: percentile(costResults, 50),
        p90: percentile(costResults, 90),
      },
    },
    totalDurationDistribution: {
      mean: durationStats.mean,
      stdDev: durationStats.stdDev,
      percentiles: {
        p10: percentile(durationResults, 10),
        p50: percentile(durationResults, 50),
        p90: percentile(durationResults, 90),
      },
    },
    probabilityOverDeadline:
      deadline !== undefined ? probabilityOverDeadline : undefined,
    probabilityOverBudget:
      budget !== undefined ? probabilityOverBudget : undefined,
  };
}

