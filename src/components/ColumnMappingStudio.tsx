/**
 * ClientReport AI - Column Mapping Studio
 * Allows users to inspect, fuzzy auto-match, map, type-cast, or exclude custom spreadsheet headers
 * to standardized business intelligence schemas before importing into the project workspace.
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  Layers,
  HelpCircle,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  XCircle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Dataset, DataType } from '../types';
import {
  SCHEMA_PRESETS,
  SchemaPreset,
  ColumnMappingItem,
  autoDetectPreset,
  generateSmartMapping,
  applyColumnMapping,
} from '../lib/schemaPresets';

interface ColumnMappingStudioProps {
  rawDataset: Dataset;
  onConfirmMapping: (mappedDataset: Dataset) => void;
  onCancel: () => void;
  onSkipMapping: () => void;
}

export const ColumnMappingStudio: React.FC<ColumnMappingStudioProps> = ({
  rawDataset,
  onConfirmMapping,
  onCancel,
  onSkipMapping,
}) => {
  // Detect default preset based on column names
  const initialPresetId = useMemo(() => autoDetectPreset(rawDataset.columns), [rawDataset.columns]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPresetId);

  // Active mappings state
  const [mappings, setMappings] = useState<ColumnMappingItem[]>(() =>
    generateSmartMapping(rawDataset.columns, initialPresetId)
  );

  // View mode: 'mapping_table' | 'live_preview'
  const [viewMode, setViewMode] = useState<'mapping_table' | 'live_preview'>('mapping_table');

  // Currently selected preset definition
  const currentPreset: SchemaPreset = useMemo(
    () => SCHEMA_PRESETS.find((p) => p.id === selectedPresetId) || SCHEMA_PRESETS[0],
    [selectedPresetId]
  );

  // Switch preset handler
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    setMappings(generateSmartMapping(rawDataset.columns, presetId));
  };

  // Re-run auto match
  const handleRerunAutoMatch = () => {
    setMappings(generateSmartMapping(rawDataset.columns, selectedPresetId));
  };

  // Reset all to custom keeping source names
  const handleResetToCustom = () => {
    setMappings(
      rawDataset.columns.map((c) => ({
        sourceColumn: c.name,
        targetFieldId: '__custom__',
        customTargetName: c.name,
        targetType: c.type,
        confidence: 0,
        isAutoMatched: false,
      }))
    );
  };

  // Exclude all unmapped
  const handleExcludeUnmapped = () => {
    setMappings((prev) =>
      prev.map((m) =>
        m.targetFieldId === '__custom__' && !m.isAutoMatched
          ? { ...m, targetFieldId: '__exclude__' }
          : m
      )
    );
  };

  // Update a single column mapping item
  const handleUpdateItem = (sourceCol: string, updates: Partial<ColumnMappingItem>) => {
    setMappings((prev) =>
      prev.map((item) => {
        if (item.sourceColumn !== sourceCol) return item;
        const updated = { ...item, ...updates };

        // If targetFieldId changed to a schema field, automatically adapt targetType and name
        if (updates.targetFieldId && updates.targetFieldId !== '__custom__' && updates.targetFieldId !== '__exclude__') {
          const fieldDef = currentPreset.fields.find((f) => f.id === updates.targetFieldId);
          if (fieldDef) {
            updated.targetType = fieldDef.type;
            updated.customTargetName = fieldDef.name;
          }
        }

        return updated;
      })
    );
  };

  // Validation & Stats
  const activeCount = mappings.filter((m) => m.targetFieldId !== '__exclude__').length;
  const excludedCount = mappings.length - activeCount;
  const autoMatchedCount = mappings.filter((m) => m.isAutoMatched && m.targetFieldId !== '__exclude__').length;

  // Check required fields for the current preset
  const requiredFields = currentPreset.fields.filter((f) => f.required);
  const mappedTargetIds = new Set(mappings.map((m) => m.targetFieldId));
  const missingRequired = requiredFields.filter((rf) => !mappedTargetIds.has(rf.id));

  // Check for duplicate target column names among active items
  const duplicateNameErrors = useMemo(() => {
    const names = new Map<string, number>();
    for (const m of mappings) {
      if (m.targetFieldId === '__exclude__') continue;
      let effectiveName = m.customTargetName.trim();
      if (m.targetFieldId !== '__custom__') {
        const f = currentPreset.fields.find((field) => field.id === m.targetFieldId);
        if (f) effectiveName = f.name;
      }
      if (!effectiveName) effectiveName = m.sourceColumn;
      const lower = effectiveName.toLowerCase();
      names.set(lower, (names.get(lower) || 0) + 1);
    }
    const dupes: string[] = [];
    names.forEach((count, name) => {
      if (count > 1) dupes.push(name);
    });
    return dupes;
  }, [mappings, currentPreset]);

  // Compute live preview of mapped dataset
  const transformedResult = useMemo(() => {
    return applyColumnMapping(rawDataset.rows, mappings, currentPreset);
  }, [rawDataset.rows, mappings, currentPreset]);

  // Final confirmation handler
  const handleConfirm = () => {
    if (activeCount === 0) {
      alert('Please keep at least one column mapped to import data.');
      return;
    }
    if (duplicateNameErrors.length > 0) {
      alert(`Duplicate column names found: ${duplicateNameErrors.join(', ')}. Please make sure all imported column names are unique.`);
      return;
    }

    const finalizedDataset: Dataset = {
      ...rawDataset,
      rowCount: transformedResult.rows.length,
      columnCount: transformedResult.columns.length,
      columns: transformedResult.columns,
      rows: transformedResult.rows,
      name: rawDataset.name || rawDataset.fileName,
    };

    onConfirmMapping(finalizedDataset);
  };

  // Helper icon for data types
  const getTypeIcon = (type: DataType) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-sky-600" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-amber-600" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" />;
      case 'string':
      default:
        return <Type className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Top Breadcrumb & Workflow Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-slate-400">Step 1: File Ingestion</span>
            <span>→</span>
            <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              Step 2: Schema & Column Mapping
            </span>
            <span>→</span>
            <span className="text-slate-400">Step 3: Business Analytics Workspace</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Map Dataset Columns</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {rawDataset.fileName} ({rawDataset.rowCount.toLocaleString()} rows, {rawDataset.columnCount} columns)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Upload</span>
          </button>

          <button
            onClick={onSkipMapping}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs transition-colors cursor-pointer"
            title="Import raw headers as-is without remapping"
          >
            Skip Mapping (Raw Import)
          </button>

          <button
            onClick={handleConfirm}
            disabled={duplicateNameErrors.length > 0 || activeCount === 0}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Apply Mapping & Open Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schema Preset Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Target Analytics Schema Presets</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an industry model to automatically normalize your columns for high-impact dashboards and KPI cards.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Detected best match:{' '}
            <span className="text-sky-600 font-bold uppercase">{initialPresetId.replace('_', ' ')}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SCHEMA_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {preset.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{preset.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {preset.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Match & Mapping Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Smart Column Auto-Match Engine</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {autoMatchedCount} matched automatically
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Target fields match your headers based on fuzzy keywords, synonyms, and data type compatibility.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleRerunAutoMatch}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-sky-400" />
            <span>Re-Run Auto Match</span>
          </button>
          <button
            onClick={handleResetToCustom}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition-colors cursor-pointer"
          >
            Keep All Custom
          </button>
          <button
            onClick={handleExcludeUnmapped}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition-colors cursor-pointer"
          >
            Exclude Unmatched
          </button>
        </div>
      </div>

      {/* Warnings & Notices */}
      {missingRequired.length > 0 && selectedPresetId !== 'custom_schema' && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Recommended Schema Fields Unmapped: </span>
            <span className="text-amber-700">
              {missingRequired.map((f) => f.name).join(', ')}. You can still proceed, but mapping these will maximize automated dashboard charts.
            </span>
          </div>
        </div>
      )}

      {duplicateNameErrors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Duplicate Destination Column Names: </span>
            <span>
              Two or more columns are mapped to &quot;{duplicateNameErrors.join(', ')}&quot;. Each destination column name must be unique.
            </span>
          </div>
        </div>
      )}

      {/* View Switcher: Mapping Table vs Live Transformed Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('mapping_table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'mapping_table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Column Mapping Table ({mappings.length})</span>
          </button>
          <button
            onClick={() => setViewMode('live_preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'live_preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Transformed Preview (5 Sample Rows)</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800">{activeCount}</span> columns active,{' '}
          <span className="text-slate-400">{excludedCount} excluded</span>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'mapping_table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Source Spreadsheet Header</th>
                  <th className="py-3 px-4 min-w-[240px]">Target Schema Field</th>
                  <th className="py-3 px-4 min-w-[180px]">Destination Name</th>
                  <th className="py-3 px-4 min-w-[130px]">Target Type</th>
                  <th className="py-3 px-4 min-w-[140px] text-right">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mappings.map((item, idx) => {
                  const srcMeta = rawDataset.columns.find((c) => c.name === item.sourceColumn);
                  const isExcluded = item.targetFieldId === '__exclude__';
                  const isCustom = item.targetFieldId === '__custom__';

                  return (
                    <tr
                      key={item.sourceColumn}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isExcluded ? 'bg-slate-50/40 opacity-60' : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Source Column & Sample Values */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{item.sourceColumn}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                              {getTypeIcon(srcMeta?.type || 'string')}
                              <span>{srcMeta?.type || 'string'}</span>
                            </span>
                          </div>

                          {/* Sample real values preview */}
                          {srcMeta?.sampleValues && srcMeta.sampleValues.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="text-[10px] text-slate-400">Samples:</span>
                              {srcMeta.sampleValues.slice(0, 3).map((val, vIdx) => (
                                <span
                                  key={vIdx}
                                  className="text-[10px] px-1.5 py-0.2 bg-slate-100/80 rounded text-slate-600 truncate max-w-[110px]"
                                  title={String(val)}
                                >
                                  {String(val)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Target Schema Field Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.targetFieldId}
                          onChange={(e) =>
                            handleUpdateItem(item.sourceColumn, {
                              targetFieldId: e.target.value,
                              isAutoMatched: false,
                            })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                            isExcluded
                              ? 'border-slate-200 bg-slate-100 text-slate-500'
                              : isCustom
                              ? 'border-slate-300 bg-white text-slate-700'
                              : 'border-sky-300 bg-sky-50/50 text-sky-900 font-semibold'
                          }`}
                        >
                          <optgroup label="Standard Schema Fields">
                            {currentPreset.fields.map((field) => (
                              <option key={field.id} value={field.id}>
                                {field.name} ({field.type}) {field.required ? '★ Required' : ''}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Custom Actions">
                            <option value="__custom__">Custom Column (Keep Original or Rename)</option>
                            <option value="__exclude__">✕ Do Not Import (Exclude Column)</option>
                          </optgroup>
                        </select>
                      </td>

                      {/* Destination Name */}
                      <td className="py-3.5 px-4">
                        {isExcluded ? (
                          <span className="text-[11px] text-slate-400 italic">Excluded from import</span>
                        ) : isCustom ? (
                          <input
                            type="text"
                            value={item.customTargetName}
                            onChange={(e) =>
                              handleUpdateItem(item.sourceColumn, {
                                customTargetName: e.target.value,
                              })
                            }
                            placeholder="Enter column name"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs font-medium"
                          />
                        ) : (
                          <div className="font-semibold text-slate-800 text-xs flex items-center justify-between">
                            <span className="truncate">{item.customTargetName}</span>
                            <span className="text-[10px] text-slate-400 font-normal ml-1">Standard</span>
                          </div>
                        )}
                      </td>

                      {/* Target Type */}
                      <td className="py-3.5 px-4">
                        {isExcluded ? (
                          <span className="text-[11px] text-slate-400">—</span>
                        ) : (
                          <select
                            value={item.targetType}
                            onChange={(e) =>
                              handleUpdateItem(item.sourceColumn, {
                                targetType: e.target.value as DataType,
                              })
                            }
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium cursor-pointer"
                          >
                            <option value="number">Number (#)</option>
                            <option value="string">String (Text)</option>
                            <option value="date">Date (ISO)</option>
                            <option value="boolean">Boolean (Yes/No)</option>
                          </select>
                        )}
                      </td>

                      {/* Match Status */}
                      <td className="py-3.5 px-4 text-right">
                        {isExcluded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            Excluded
                          </span>
                        ) : item.isAutoMatched ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Auto ({item.confidence}%)
                          </span>
                        ) : isCustom ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Custom
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            Manual
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Live Transformed Data Preview */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-500" />
                <span>Real-Time Transformed Data Sample (First 5 Rows)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Here is exactly how your data will appear in the workspace with your current mapping and type casting rules.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {transformedResult.columns.length} columns active
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
                  {transformedResult.columns.map((c) => (
                    <th key={c.name} className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({c.type})</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transformedResult.rows.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[10px]">
                      {rIdx + 1}
                    </td>
                    {transformedResult.columns.map((c) => (
                      <td key={c.name} className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        {row[c.name] !== null && row[c.name] !== undefined
                          ? String(row[c.name])
                          : <span className="text-slate-300 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Confirmation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Need to adjust later? You can always rename, transform types, or remove columns inside the{' '}
            <strong className="text-slate-800">Data Cleaning Studio</strong> at any time.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-medium text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={duplicateNameErrors.length > 0 || activeCount === 0}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Confirm & Import Dataset</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
