'use client';

import { useState } from 'react';
import { Risk, Activity } from '@/lib/risk-analysis/types';

interface Step3AssignmentProps {
  risks: Risk[];
  activities: Activity[];
  onRisksChange: (risks: Risk[]) => void;
}

export default function Step3Assignment({
  risks,
  activities,
  onRisksChange,
}: Step3AssignmentProps) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const toggleRiskAssignment = (riskId: string, activityId: string) => {
    const updatedRisks = risks.map((risk) => {
      if (risk.id === riskId) {
        const affectedActivities = risk.affectedActivities.includes(activityId)
          ? risk.affectedActivities.filter((id) => id !== activityId)
          : [...risk.affectedActivities, activityId];
        return { ...risk, affectedActivities };
      }
      return risk;
    });
    onRisksChange(updatedRisks);
  };

  const selectedActivity = activities.find((a) => a.id === selectedActivityId);
  const assignedRisks = selectedActivityId
    ? risks.filter((r) => r.affectedActivities.includes(selectedActivityId))
    : [];

  const canProceed = risks.every((risk) => risk.affectedActivities.length > 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Step 3: Assign Risks to Activities
        </h2>
        <p className="text-gray-700">
          Click on an activity from the left list, then select which risks affect it from the right panel. Each risk must have at least one activity assigned.
        </p>
        <p className="text-sm text-gray-800 mt-2">
          <strong>Note:</strong> Only Level 2 activities contribute to time and cost impact calculations. Level 1 artifacts (artifacts) are for organization only.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Activities List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto">
              {activities.map((activity) => {
                const assignedCount = risks.filter((r) =>
                  r.affectedActivities.includes(activity.id)
                ).length;
                const isSelected = selectedActivityId === activity.id;
                return (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivityId(activity.id)}
                    className={`p-4 border-b border-gray-200 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 border-l-4'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{activity.id}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                            Level {activity.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{activity.title}</p>
                        <p className="text-xs text-gray-700">
                          {assignedCount} risk{assignedCount !== 1 ? 's' : ''} assigned
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-2">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Risks for Selected Activity */}
        <div>
          {selectedActivity ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Risks for: {selectedActivity.id}
                </h3>
                <p className="text-sm text-gray-700 mb-2">{selectedActivity.title}</p>
                <p className="text-xs text-gray-700">
                  Select risks that affect this activity
                </p>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  {risks.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-700">No risks defined yet. Go back to Step 2 to add risks.</p>
                    </div>
                  ) : (
                    risks.map((risk) => {
                      const isAssigned = risk.affectedActivities.includes(selectedActivity.id);
                      return (
                        <div
                          key={risk.id}
                          className={`p-4 border-b border-gray-200 transition-all ${
                            isAssigned ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() =>
                                toggleRiskAssignment(risk.id, selectedActivity.id)
                              }
                              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{risk.id}</span>
                                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                                  {risk.category}
                                </span>
                                {isAssigned && (
                                  <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded">
                                    Assigned
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 mb-1">{risk.title}</p>
                              <div className="flex gap-4 text-xs text-gray-700">
                                <span>Probability: {risk.probability}%</span>
                                <span>Time Impact: {risk.timeImpactPercent}%</span>
                                <span>Cost Impact: {risk.costImpactPercent}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>{assignedRisks.length}</strong> risk{assignedRisks.length !== 1 ? 's' : ''} assigned to this activity
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-700 mb-2">Select an activity from the left</p>
              <p className="text-sm text-gray-600">
                Click on any activity to see and assign risks
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <p className="text-sm text-gray-700">Total Activities</p>
          <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
        </div>
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <p className="text-sm text-gray-700">Total Risks</p>
          <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
        </div>
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
          <p className="text-sm text-gray-700">Risks with Assignments</p>
          <p className="text-2xl font-bold text-gray-900">
            {risks.filter((r) => r.affectedActivities.length > 0).length} / {risks.length}
          </p>
        </div>
      </div>

      {!canProceed && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900 font-medium mb-2">
            ⚠ Warning: Some risks have no activity assignments
          </p>
          <ul className="text-sm text-red-800 list-disc list-inside">
            {risks
              .filter((r) => r.affectedActivities.length === 0)
              .map((r) => (
                <li key={r.id}>
                  {r.id}: {r.title}
                </li>
              ))}
          </ul>
        </div>
      )}

      {canProceed && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            ✓ All risks have at least one activity assigned.
          </p>
        </div>
      )}
    </div>
  );
}
