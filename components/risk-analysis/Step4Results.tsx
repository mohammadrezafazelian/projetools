'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { AnalysisOutput, RiskAnalysisOutput } from '@/lib/risk-analysis/types';

interface Step4ResultsProps {
  analysisOutput: AnalysisOutput;
  onExport: () => void;
}

export default function Step4Results({
  analysisOutput,
  onExport,
}: Step4ResultsProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'combined' | 'monteCarlo'>('overview');

  // Prepare chart data
  const behaviorScoreData = analysisOutput.topRisksByBehaviorScore
    .slice(0, 10)
    .map((r) => ({
      risk: r.riskId,
      score: Math.round(r.behaviorScore * 10) / 10,
    }));

  const expectedImpactData = analysisOutput.topRisksByExpectedImpact
    .slice(0, 10)
    .map((r) => ({
      risk: r.riskId,
      timeImpact: Math.round(r.expectedTimeImpact * 10) / 10,
      costImpact: Math.round(r.expectedCostImpact * 10) / 10,
    }));

  const sensitivityData = analysisOutput.perRiskAnalysis
    .slice(0, 10)
    .map((r) => ({
      risk: r.riskId,
      probability: Math.round(r.sensitivity.probabilitySensitivity * 100) / 100,
      time: Math.round(r.sensitivity.timeImpactSensitivity * 100) / 100,
      cost: Math.round(r.sensitivity.costImpactSensitivity * 100) / 100,
    }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Step 4: Analysis Results
        </h2>
        <p className="text-gray-900">
          Review the risk behavior analysis results below.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-900">Total Risks</p>
          <p className="text-2xl font-bold text-gray-900">
            {analysisOutput.perRiskAnalysis.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-900">Combined Scenarios</p>
          <p className="text-2xl font-bold text-gray-900">
            {analysisOutput.combinedScenarios.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-900">Top Risk Score</p>
          <p className="text-2xl font-bold text-gray-900">
            {analysisOutput.topRisksByBehaviorScore[0]?.behaviorScore.toFixed(1) || 'N/A'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-900">Total Expected Cost Impact</p>
          <p className="text-2xl font-bold text-gray-900">
            {analysisOutput.perRiskAnalysis
              .reduce((sum, r) => sum + r.expectedCostImpact, 0)
              .toFixed(0)}
          </p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'detailed', label: 'Per-Risk Details' },
            { id: 'combined', label: 'Combined Scenarios' },
            { id: 'monteCarlo', label: 'Monte Carlo' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                selectedView === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-800 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Top Risks by Behavior Score</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behaviorScoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="risk" 
                  tick={{ fill: '#111827', fontSize: 12 }}
                  label={{ value: 'Risk ID', position: 'insideBottom', offset: -5, fill: '#111827', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#111827', fontSize: 12 }}
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#111827', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: '#111827' }} />
                <Bar dataKey="score" fill="#3b82f6" name="Behavior Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Expected Impact Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expectedImpactData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="risk" 
                  tick={{ fill: '#111827', fontSize: 12 }}
                  label={{ value: 'Risk ID', position: 'insideBottom', offset: -5, fill: '#111827', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#111827', fontSize: 12 }}
                  label={{ value: 'Impact', angle: -90, position: 'insideLeft', fill: '#111827', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: '#111827' }} />
                <Bar dataKey="timeImpact" fill="#ef4444" name="Time Impact (days)" />
                <Bar dataKey="costImpact" fill="#10b981" name="Cost Impact" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Sensitivity Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="risk" 
                  tick={{ fill: '#111827', fontSize: 12 }}
                  label={{ value: 'Risk ID', position: 'insideBottom', offset: -5, fill: '#111827', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: '#111827', fontSize: 12 }}
                  label={{ value: 'Sensitivity', angle: -90, position: 'insideLeft', fill: '#111827', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ color: '#111827' }} />
                <Bar dataKey="probability" fill="#8b5cf6" name="Probability Sensitivity" />
                <Bar dataKey="time" fill="#f59e0b" name="Time Impact Sensitivity" />
                <Bar dataKey="cost" fill="#06b6d4" name="Cost Impact Sensitivity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {selectedView === 'detailed' && (
        <div className="space-y-4">
          {analysisOutput.perRiskAnalysis.map((risk) => (
            <div
              key={risk.riskId}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {risk.riskId}: {risk.title}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-900">Expected Time Impact</p>
                  <p className="text-xl font-bold text-gray-900">{risk.expectedTimeImpact.toFixed(2)} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Expected Cost Impact</p>
                  <p className="text-xl font-bold text-gray-900">{risk.expectedCostImpact.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Propagated Probability</p>
                  <p className="text-xl font-bold text-gray-900">{risk.propagatedProbability.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Behavior Score</p>
                  <p className="text-xl font-bold text-gray-900">{risk.behaviorScore.toFixed(1)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Sensitivity:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-900">
                  <div>Probability: {risk.sensitivity.probabilitySensitivity.toFixed(3)}</div>
                  <div>Time Impact: {risk.sensitivity.timeImpactSensitivity.toFixed(3)}</div>
                  <div>Cost Impact: {risk.sensitivity.costImpactSensitivity.toFixed(3)}</div>
                  <div>Scope Impact: {risk.sensitivity.scopeImpactSensitivity.toFixed(3)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Combined Scenarios View */}
      {selectedView === 'combined' && (
        <div className="space-y-4">
          {analysisOutput.combinedScenarios.map((scenario, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg border border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Combined Scenario: {scenario.riskIds.join(', ')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-900">Combined Time Impact %</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.combinedTimeImpactPercent.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Combined Cost Impact %</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.combinedCostImpactPercent.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Expected Time Impact</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.combinedExpectedTimeImpact.toFixed(2)} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-900">Expected Cost Impact</p>
                  <p className="text-xl font-bold text-gray-900">{scenario.combinedExpectedCostImpact.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monte Carlo View */}
      {selectedView === 'monteCarlo' && (
        <div>
          {analysisOutput.monteCarlo?.enabled ? (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Monte Carlo Simulation Results</h3>
                <p className="text-sm text-gray-900 mb-4">
                  Iterations: {analysisOutput.monteCarlo.iterations}
                </p>
                {analysisOutput.monteCarlo.totalCostDistribution && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-900">Total Cost Distribution</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">Mean</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalCostDistribution.mean.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Std Dev</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalCostDistribution.stdDev.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">P50</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalCostDistribution.percentiles.p50.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">P90</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalCostDistribution.percentiles.p90.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {analysisOutput.monteCarlo.totalDurationDistribution && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-900">Total Duration Distribution</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-900">Mean</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalDurationDistribution.mean.toFixed(2)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Std Dev</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalDurationDistribution.stdDev.toFixed(2)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">P50</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalDurationDistribution.percentiles.p50.toFixed(2)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">P90</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysisOutput.monteCarlo.totalDurationDistribution.percentiles.p90.toFixed(2)} days
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {analysisOutput.monteCarlo.probabilityOverDeadline !== undefined && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-900">Probability Over Deadline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(analysisOutput.monteCarlo.probabilityOverDeadline * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                {analysisOutput.monteCarlo.probabilityOverBudget !== undefined && (
                  <div>
                    <p className="text-sm text-gray-900">Probability Over Budget</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(analysisOutput.monteCarlo.probabilityOverBudget * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-900">Monte Carlo simulation was not enabled for this analysis.</p>
            </div>
          )}
        </div>
      )}

      {/* Export Button */}
      <div className="mt-6">
        <button
          onClick={onExport}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}

