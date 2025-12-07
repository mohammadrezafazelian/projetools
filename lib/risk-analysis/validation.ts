/**
 * Validation utilities for Risk Behavior Analysis inputs
 */

import { Activity, Risk, Input } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate an activity
 */
export function validateActivity(activity: Activity): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!activity.id || activity.id.trim().length === 0) {
    errors.push({ field: 'id', message: 'Activity ID is required' });
  }

  if (!activity.title || activity.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Activity title is required' });
  }

  if (!activity.start) {
    errors.push({ field: 'start', message: 'Start date is required' });
  }

  if (!activity.end) {
    errors.push({ field: 'end', message: 'End date is required' });
  }

  if (activity.start && activity.end) {
    const startDate = new Date(activity.start);
    const endDate = new Date(activity.end);
    if (endDate < startDate) {
      errors.push({
        field: 'end',
        message: 'End date must be >= start date',
      });
    }
  }

  if (activity.cost < 0) {
    errors.push({ field: 'cost', message: 'Cost must be >= 0' });
  }

  if (activity.level !== 1 && activity.level !== 2) {
    errors.push({ field: 'level', message: 'Level must be 1 or 2' });
  }

  return errors;
}

/**
 * Validate a risk
 */
export function validateRisk(risk: Risk, allActivityIds: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!risk.id || risk.id.trim().length === 0) {
    errors.push({ field: 'id', message: 'Risk ID is required' });
  }

  if (!risk.title || risk.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Risk title is required' });
  }

  if (risk.probability < 0 || risk.probability > 100) {
    errors.push({
      field: 'probability',
      message: 'Probability must be between 0 and 100',
    });
  }

  if (risk.timeImpactPercent < 0) {
    errors.push({
      field: 'timeImpactPercent',
      message: 'Time impact must be >= 0',
    });
  }

  if (risk.costImpactPercent < 0) {
    errors.push({
      field: 'costImpactPercent',
      message: 'Cost impact must be >= 0',
    });
  }

  // Validate affected activities exist
  for (const activityId of risk.affectedActivities) {
    if (!allActivityIds.includes(activityId)) {
      errors.push({
        field: 'affectedActivities',
        message: `Activity ${activityId} does not exist`,
      });
    }
  }

  // Validate related risks exist
  const allRiskIds = []; // Will be passed separately if needed
  for (const relation of risk.relatedRisks) {
    if (relation.strength !== undefined && (relation.strength < 0 || relation.strength > 1)) {
      errors.push({
        field: 'relatedRisks',
        message: `Relation strength must be between 0 and 1 for ${relation.riskId}`,
      });
    }
  }

  return errors;
}

/**
 * Validate complete input
 */
export function validateInput(input: Input): ValidationError[] {
  const errors: ValidationError[] = [];

  if (input.activities.length === 0) {
    errors.push({
      field: 'activities',
      message: 'At least one activity is required',
    });
  }

  if (input.risks.length === 0) {
    errors.push({
      field: 'risks',
      message: 'At least one risk is required',
    });
  }

  // Validate all activities
  const activityIds = new Set<string>();
  for (const activity of input.activities) {
    const activityErrors = validateActivity(activity);
    errors.push(...activityErrors);

    if (activityIds.has(activity.id)) {
      errors.push({
        field: 'activities',
        message: `Duplicate activity ID: ${activity.id}`,
      });
    }
    activityIds.add(activity.id);
  }

  // Validate all risks
  const riskIds = new Set<string>();
  const allActivityIds = Array.from(activityIds);
  for (const risk of input.risks) {
    const riskErrors = validateRisk(risk, allActivityIds);
    errors.push(...riskErrors);

    if (riskIds.has(risk.id)) {
      errors.push({
        field: 'risks',
        message: `Duplicate risk ID: ${risk.id}`,
      });
    }
    riskIds.add(risk.id);

    // Check that each risk has at least one affected activity
    if (risk.affectedActivities.length === 0) {
      errors.push({
        field: 'risks',
        message: `Risk ${risk.id} must have at least one affected activity`,
      });
    }
  }

  return errors;
}

