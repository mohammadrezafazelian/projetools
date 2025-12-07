'use client';

import { useState } from 'react';
import { Risk, RiskRelation } from '@/lib/risk-analysis/types';

interface Step2RisksProps {
  risks: Risk[];
  onRisksChange: (risks: Risk[]) => void;
}

const RISK_CATEGORIES = [
  'Technical',
  'Schedule',
  'Cost',
  'Resources',
  'External',
  'Operational',
  'Quality',
  'Stakeholder',
];

export default function Step2Risks({ risks, onRisksChange }: Step2RisksProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Risk>>({
    title: '',
    probability: 0,
    timeImpactPercent: 0,
    costImpactPercent: 0,
    scopeImpactPercent: 0,
    category: 'Technical',
    trigger: '',
    responsePlan: '',
    relatedRisks: [],
    affectedActivities: [],
  });

  const [newRelatedRisk, setNewRelatedRisk] = useState<{
    riskId: string;
    relationType: 'dependency' | 'concurrent';
    strength: number;
  }>({
    riskId: '',
    relationType: 'dependency',
    strength: 0.3,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      probability: 0,
      timeImpactPercent: 0,
      costImpactPercent: 0,
      scopeImpactPercent: 0,
      category: 'Technical',
      trigger: '',
      responsePlan: '',
      relatedRisks: [],
      affectedActivities: [],
    });
    setEditingIndex(null);
    setNewRelatedRisk({
      riskId: '',
      relationType: 'dependency',
      strength: 0.3,
    });
  };

  const handleSave = () => {
    if (!formData.title) return;

    const newRisk: Risk = {
      id: editingIndex !== null ? risks[editingIndex].id : `R-${risks.length + 1}`,
      title: formData.title,
      probability: formData.probability ?? 0,
      timeImpactPercent: formData.timeImpactPercent ?? 0,
      costImpactPercent: formData.costImpactPercent ?? 0,
      scopeImpactPercent: formData.scopeImpactPercent ?? 0,
      category: formData.category ?? 'Technical',
      trigger: formData.trigger ?? '',
      responsePlan: formData.responsePlan ?? '',
      relatedRisks: formData.relatedRisks ?? [],
      affectedActivities: formData.affectedActivities ?? [],
    };

    if (editingIndex !== null) {
      const newRisks = [...risks];
      newRisks[editingIndex] = newRisk;
      onRisksChange(newRisks);
    } else {
      onRisksChange([...risks, newRisk]);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setFormData(risks[index]);
  };

  const handleDelete = (index: number) => {
    onRisksChange(risks.filter((_, i) => i !== index));
  };

  const addRelatedRisk = () => {
    if (!newRelatedRisk.riskId) return;

    const newRelation: RiskRelation = {
      riskId: newRelatedRisk.riskId,
      relationType: newRelatedRisk.relationType,
      strength: newRelatedRisk.strength,
    };

    // Check if already exists
    const exists = formData.relatedRisks?.some(
      (r) => r.riskId === newRelatedRisk.riskId
    );
    if (exists) {
      alert('This risk is already in the related risks list');
      return;
    }

    setFormData({
      ...formData,
      relatedRisks: [...(formData.relatedRisks ?? []), newRelation],
    });

    setNewRelatedRisk({
      riskId: '',
      relationType: 'dependency',
      strength: 0.3,
    });
  };

  const removeRelatedRisk = (index: number) => {
    const newRelatedRisks = [...(formData.relatedRisks ?? [])];
    newRelatedRisks.splice(index, 1);
    setFormData({ ...formData, relatedRisks: newRelatedRisks });
  };

  const canProceed = risks.length > 0;

  // Available risk IDs for related risks dropdown (exclude current risk if editing)
  const availableRiskIds = risks
    .filter((r) => editingIndex === null || r.id !== risks[editingIndex].id)
    .map((r) => r.id);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Step 2: Risk Definition
        </h2>
        <p className="text-gray-700">
          Create risks one-by-one. Activities will be assigned in the next step.
        </p>
      </div>

      {/* Risk Form */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          {editingIndex !== null ? 'Edit Risk' : 'Add New Risk'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Risk title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              {RISK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Probability with slider */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Probability: {formData.probability}%
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) || 0 })}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          {/* Time Impact with slider */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Time Impact: {formData.timeImpactPercent}%
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="200"
                value={formData.timeImpactPercent}
                onChange={(e) => setFormData({ ...formData, timeImpactPercent: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                value={formData.timeImpactPercent}
                onChange={(e) => setFormData({ ...formData, timeImpactPercent: parseFloat(e.target.value) || 0 })}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          {/* Cost Impact with slider */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Cost Impact: {formData.costImpactPercent}%
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="200"
                value={formData.costImpactPercent}
                onChange={(e) => setFormData({ ...formData, costImpactPercent: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min="0"
                value={formData.costImpactPercent}
                onChange={(e) => setFormData({ ...formData, costImpactPercent: parseFloat(e.target.value) || 0 })}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          {/* Scope Impact with slider */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Scope Impact: {formData.scopeImpactPercent}%
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-100"
                max="100"
                value={formData.scopeImpactPercent}
                onChange={(e) => setFormData({ ...formData, scopeImpactPercent: parseInt(e.target.value) })}
                className="flex-1"
              />
              <input
                type="number"
                min="-100"
                max="100"
                value={formData.scopeImpactPercent}
                onChange={(e) => setFormData({ ...formData, scopeImpactPercent: parseFloat(e.target.value) || 0 })}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Trigger
            </label>
            <input
              type="text"
              value={formData.trigger}
              onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Risk trigger description"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Response Plan
            </label>
            <textarea
              value={formData.responsePlan}
              onChange={(e) => setFormData({ ...formData, responsePlan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Response plan description"
            />
          </div>

          {/* Related Risks Table */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Related Risks
            </label>
            
            {/* Add new related risk */}
            <div className="mb-3 p-3 bg-white rounded border border-gray-300">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Risk ID</label>
                  <select
                    value={newRelatedRisk.riskId}
                    onChange={(e) => setNewRelatedRisk({ ...newRelatedRisk, riskId: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="">Select risk...</option>
                    {availableRiskIds.map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Relation Type</label>
                  <select
                    value={newRelatedRisk.relationType}
                    onChange={(e) =>
                      setNewRelatedRisk({
                        ...newRelatedRisk,
                        relationType: e.target.value as 'dependency' | 'concurrent',
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  >
                    <option value="dependency">Dependency</option>
                    <option value="concurrent">Concurrent</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-900 mb-1">Strength</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newRelatedRisk.strength}
                    onChange={(e) =>
                      setNewRelatedRisk({
                        ...newRelatedRisk,
                        strength: parseFloat(e.target.value) || 0.3,
                      })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    onClick={addRelatedRisk}
                    disabled={!newRelatedRisk.riskId}
                    className={`w-full px-3 py-1 rounded text-sm font-medium ${
                      !newRelatedRisk.riskId
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Related risks table */}
            {(formData.relatedRisks ?? []).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase">Risk ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase">Relation Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase">Strength</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(formData.relatedRisks ?? []).map((rel, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{rel.riskId}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{rel.relationType}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{rel.strength ?? 0.3}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <button
                            onClick={() => removeRelatedRisk(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 border border-gray-300 rounded bg-gray-50 text-center">
                <p className="text-sm text-gray-700">No related risks added yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            disabled={!formData.title}
            className={`px-4 py-2 rounded-lg font-medium ${
              !formData.title
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {editingIndex !== null ? 'Update' : 'Add'} Risk
          </button>
          {editingIndex !== null && (
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Risks Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Probability</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {risks.map((risk, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{risk.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{risk.title}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{risk.probability}%</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{risk.category}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(index)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canProceed && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            Please add at least one risk before proceeding.
          </p>
        </div>
      )}
    </div>
  );
}
