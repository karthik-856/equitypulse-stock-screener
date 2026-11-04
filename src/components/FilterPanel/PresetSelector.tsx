'use client';

import React, { useState } from 'react';
import { useStockStore } from '@/stores/stockStore';
import { Bookmark, Plus, Trash2, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function PresetSelector() {
  const presets = useStockStore((s) => s.presets);
  const activeFilters = useStockStore((s) => s.activeFilters);
  const applyPreset = useStockStore((s) => s.applyPreset);
  const savePreset = useStockStore((s) => s.savePreset);
  const deletePreset = useStockStore((s) => s.deletePreset);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDesc, setPresetDesc] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    savePreset({
      name: presetName.trim(),
      description: presetDesc.trim(),
      filters: activeFilters,
    });

    setPresetName('');
    setPresetDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-brand-500" />
          <span>Screener Presets</span>
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={activeFilters.length === 0}
          title={activeFilters.length === 0 ? 'Apply filters to save preset' : 'Save current filter set'}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-40"
        >
          <Plus className="w-3 h-3" />
          <span>Save View</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <div key={preset.id} className="relative group inline-block">
            <button
              onClick={() => applyPreset(preset)}
              title={preset.description}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shadow-2xs"
            >
              {preset.name}
            </button>
            {!preset.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePreset(preset.id);
                }}
                className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 bg-red-500 text-white p-0.5 rounded-full hover:scale-110 transition-opacity"
                title="Delete custom preset"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Save Preset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Save Custom Screener"
        description={`Save the currently active ${activeFilters.length} filter rules as a reusable preset.`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preset Name
            </label>
            <Input
              placeholder="e.g. High ROE Tech Stars"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <Input
              placeholder="e.g. Filters for IT sector with ROE > 25% and positive cash flow"
              value={presetDesc}
              onChange={(e) => setPresetDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Preset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
