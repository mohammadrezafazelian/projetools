'use client';

import { useState } from 'react';
import { Activity } from '@/lib/risk-analysis/types';
import { calculateDurationDays } from '@/lib/risk-analysis/calculations';

interface Step1ActivitiesProps {
  activities: Activity[];
  onActivitiesChange: (activities: Activity[]) => void;
}

export default function Step1Activities({
  activities,
  onActivitiesChange,
}: Step1ActivitiesProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  // Separate level 1 (artifacts) and level 2 (activities)
  const artifacts = activities.filter((a) => a.level === 1);
  const level2Activities = activities.filter((a) => a.level === 2);

  const addArtifact = () => {
    const newArtifact: Activity = {
      id: `A-${artifacts.length + 1}`,
      title: '',
      level: 1,
      start: '', // No dates for artifacts
      end: '',
      cost: 0, // No cost for artifacts
    };
    onActivitiesChange([...activities, newArtifact]);
  };

  const removeArtifact = (artifactId: string) => {
    // Remove artifact and all its level 2 activities
    const newActivities = activities.filter(
      (a) => a.id !== artifactId && !a.id.startsWith(`${artifactId}-`)
    );
    onActivitiesChange(newActivities);
    if (selectedArtifactId === artifactId) {
      setSelectedArtifactId(null);
    }
  };

  const updateArtifact = (artifactId: string, field: keyof Activity, value: any) => {
    const newActivities = activities.map((a) =>
      a.id === artifactId ? { ...a, [field]: value } : a
    );
    onActivitiesChange(newActivities);
  };

  const addActivityToArtifact = (artifactId: string) => {
    const artifactActivities = level2Activities.filter((a) => a.id.startsWith(`${artifactId}-`));
    const activityNumber = artifactActivities.length + 1;
    const newActivity: Activity = {
      id: `${artifactId}-${activityNumber}`,
      title: '',
      level: 2,
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      cost: 0,
    };
    onActivitiesChange([...activities, newActivity]);
  };

  const removeActivity = (activityId: string) => {
    onActivitiesChange(activities.filter((a) => a.id !== activityId));
  };

  const updateActivity = (activityId: string, field: keyof Activity, value: any) => {
    const newActivities = activities.map((a) => {
      if (a.id === activityId) {
        const updated = { ...a, [field]: value };
        
        // Validate
        const newErrors = { ...errors };
        const errorKey = `${activityId}-${field}`;

        if (field === 'end' && updated.start && updated.end) {
          const startDate = new Date(updated.start);
          const endDate = new Date(updated.end);
          if (endDate < startDate) {
            newErrors[errorKey] = 'End date must be >= start date';
          } else {
            delete newErrors[errorKey];
          }
        }

        if (field === 'cost' && value < 0) {
          newErrors[errorKey] = 'Cost must be >= 0';
        } else if (field === 'cost') {
          delete newErrors[errorKey];
        }

        setErrors(newErrors);
        return updated;
      }
      return a;
    });
    onActivitiesChange(newActivities);
  };

  const selectedArtifact = artifacts.find((a) => a.id === selectedArtifactId);
  const selectedArtifactActivities = selectedArtifactId
    ? level2Activities.filter((a) => a.id.startsWith(`${selectedArtifactId}-`))
    : [];

  const canProceed =
    artifacts.length > 0 &&
    artifacts.every((a) => a.title && a.title.trim().length > 0) &&
    level2Activities.length > 0 &&
    level2Activities.every((a) => {
      if (!a.title || !a.start || !a.end) return false;
      const startDate = new Date(a.start);
      const endDate = new Date(a.end);
      if (endDate < startDate) return false;
      if (a.cost < 0) return false;
      return true;
    });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Step 1: Activity Definition
        </h2>
        <p className="text-gray-700">
          First, add Level 1 activities (artifacts). Then select an artifact to add Level 2 activities with dates, costs, and durations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Artifacts (Level 1) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Level 1: Artifacts</h3>
            <button
              onClick={addArtifact}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              + Add Artifact
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {artifacts.map((artifact) => (
              <div
                key={artifact.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedArtifactId === artifact.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                onClick={() => setSelectedArtifactId(artifact.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={artifact.title}
                      onChange={(e) => updateArtifact(artifact.id, 'title', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium"
                      placeholder="Artifact title"
                    />
                    <p className="text-xs text-gray-700 mt-1">ID: {artifact.id}</p>
                    <p className="text-xs text-gray-700">
                      Activities: {level2Activities.filter((a) => a.id.startsWith(`${artifact.id}-`)).length}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArtifact(artifact.id);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Activities (Level 2) for selected artifact */}
        <div>
          {selectedArtifact ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Level 2: Activities for {selectedArtifact.title || selectedArtifact.id}
                  </h3>
                  <p className="text-sm text-gray-700">Add activities with dates, costs, and durations</p>
                </div>
                <button
                  onClick={() => addActivityToArtifact(selectedArtifact.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  + Add Activity
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedArtifactActivities.length === 0 ? (
                  <div className="p-8 text-center border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-700">No activities yet. Click "+ Add Activity" to add one.</p>
                  </div>
                ) : (
                  selectedArtifactActivities.map((activity) => {
                    const duration = activity.start && activity.end
                      ? calculateDurationDays(activity.start, activity.end)
                      : 0;
                    return (
                      <div
                        key={activity.id}
                        className="p-4 border border-gray-300 rounded-lg bg-white"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-900 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={activity.title}
                              onChange={(e) => updateActivity(activity.id, 'title', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                              placeholder="Activity title"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-900 mb-1">
                                Start Date
                              </label>
                              <input
                                type="date"
                                value={activity.start}
                                onChange={(e) => updateActivity(activity.id, 'start', e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                                  errors[`${activity.id}-end`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-900 mb-1">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={activity.end}
                                onChange={(e) => updateActivity(activity.id, 'end', e.target.value)}
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                                  errors[`${activity.id}-end`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors[`${activity.id}-end`] && (
                                <p className="text-xs text-red-600 mt-1">{errors[`${activity.id}-end`]}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-900 mb-1">
                                Cost
                              </label>
                              <input
                                type="number"
                                value={activity.cost}
                                onChange={(e) => updateActivity(activity.id, 'cost', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                                  errors[`${activity.id}-cost`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {errors[`${activity.id}-cost`] && (
                                <p className="text-xs text-red-600 mt-1">{errors[`${activity.id}-cost`]}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-900 mb-1">
                                Duration (days)
                              </label>
                              <div className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-900">
                                {duration}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeActivity(activity.id)}
                            className="w-full px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                          >
                            Remove Activity
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-700">Select an artifact from the left to add activities.</p>
            </div>
          )}
        </div>
      </div>

      {!canProceed && activities.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            Please complete all required fields: artifacts must have titles, and all level 2 activities must have valid dates and costs.
          </p>
        </div>
      )}
    </div>
  );
}
