'use client';

import { useState } from 'react';
import Wizard from '@/components/risk-analysis/Wizard';
import Step1Activities from '@/components/risk-analysis/Step1Activities';
import Step2Risks from '@/components/risk-analysis/Step2Risks';
import Step3Assignment from '@/components/risk-analysis/Step3Assignment';
import Step4Results from '@/components/risk-analysis/Step4Results';
import { Activity, Risk, Input, AnalysisOutput } from '@/lib/risk-analysis/types';
import { analyzeRiskBehavior } from '@/lib/risk-analysis/analyzer';

const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Activities',
    description: 'Define project activities',
  },
  {
    id: 2,
    title: 'Risks',
    description: 'Define risks',
  },
  {
    id: 3,
    title: 'Assignment',
    description: 'Assign risks to activities',
  },
  {
    id: 4,
    title: 'Results',
    description: 'View analysis results',
  },
];

export default function RiskBehaviorAnalysisPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [analysisOutput, setAnalysisOutput] = useState<AnalysisOutput | null>(null);
  const [enableMonteCarlo, setEnableMonteCarlo] = useState(false);
  const [monteCarloIterations, setMonteCarloIterations] = useState(7500);

  const handleStepChange = (step: number) => {
    // If moving to step 4 (results), run analysis first
    if (step === 3 && currentStep < 3) {
      runAnalysis();
    }
    setCurrentStep(step);
  };

  const runAnalysis = () => {
    const input: Input = {
      activities,
      risks,
    };

    const output = analyzeRiskBehavior(
      input,
      enableMonteCarlo,
      monteCarloIterations
    );

    setAnalysisOutput(output);
  };

  const handleExport = () => {
    if (!analysisOutput) return;

    const dataStr = JSON.stringify(analysisOutput, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const canProceedStep0 = (() => {
    const artifacts = activities.filter((a) => a.level === 1);
    const level2Activities = activities.filter((a) => a.level === 2);
    
    // All artifacts must have titles
    if (artifacts.length === 0 || !artifacts.every((a) => a.title && a.title.trim().length > 0)) {
      return false;
    }
    
    // All level 2 activities must have valid dates and costs
    if (level2Activities.length === 0) return false;
    
    return level2Activities.every((a) => {
      if (!a.title || !a.start || !a.end) return false;
      const startDate = new Date(a.start);
      const endDate = new Date(a.end);
      if (endDate < startDate) return false;
      if (a.cost < 0) return false;
      return true;
    });
  })();

  const canProceedStep1 = risks.length > 0;

  const canProceedStep2 = risks.every((r) => r.affectedActivities.length > 0);

  const canProceed = (() => {
    switch (currentStep) {
      case 0:
        return canProceedStep0;
      case 1:
        return canProceedStep1;
      case 2:
        return canProceedStep2;
      case 3:
        return true; // Results page, no validation needed
      default:
        return false;
    }
  })();

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1Activities
            activities={activities}
            onActivitiesChange={setActivities}
          />
        );
      case 1:
        return (
          <Step2Risks risks={risks} onRisksChange={setRisks} />
        );
      case 2:
        return (
          <Step3Assignment
            risks={risks}
            activities={activities}
            onRisksChange={setRisks}
          />
        );
      case 3:
        return analysisOutput ? (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Analysis Complete</h3>
                  <p className="text-sm text-blue-700">
                    {analysisOutput.perRiskAnalysis.length} risks analyzed
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableMonteCarlo}
                      onChange={(e) => setEnableMonteCarlo(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-900 font-medium">Enable Monte Carlo</span>
                  </label>
                  {enableMonteCarlo && (
                    <input
                      type="number"
                      value={monteCarloIterations}
                      onChange={(e) => setMonteCarloIterations(parseInt(e.target.value) || 7500)}
                      min="5000"
                      max="10000"
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-black"
                    />
                  )}
                  <button
                    onClick={runAnalysis}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Re-run Analysis
                  </button>
                </div>
              </div>
            </div>
            <Step4Results
              analysisOutput={analysisOutput}
              onExport={handleExport}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Running analysis...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Risk Behavior Analysis Module
          </h1>
          <p className="text-gray-600">
            Deterministic, analytical, and simulation-based risk evaluation for project management
          </p>
        </div>
      </div>

      <Wizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        canProceed={canProceed}
      >
        {renderStepContent()}
      </Wizard>
    </div>
  );
}

