import React, { useState } from 'react';
import {
  Wand2,
  Undo2,
  Redo2,
  Sparkles,
  Copy,
  Trash2,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Dataset, ColumnMeta, CleaningOperation, CleaningHistoryStep } from '../types';
import {
  removeDuplicates,
  dropEmptyColumns,
  trimWhitespace,
  normalizeCasing,
  fillMissingValues,
  filterOutliers,
  refreshColumnMeta,
  calculateQualityScore,
} from '../lib/dataCleaning';

interface DataCleaningStudioProps {
  originalDataset: Dataset;
  workingDataset: Dataset;
  history: CleaningHistoryStep[];
  historyIndex: number;
  onApplyCleaning: (
    updatedDataset: Dataset,
    operation: CleaningOperation,
    newStep: CleaningHistoryStep
  ) => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export const DataCleaningStudio: React.FC<DataCleaningStudioProps> = ({
  originalDataset,
  workingDataset,
  history,
  historyIndex,
  onApplyCleaning,
  onUndo,
  onRedo,
  onReset,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string>(
    workingDataset.columns[0]?.name || ''
  );
  const [casingMode, setCasingMode] = useState<'titlecase' | 'uppercase' | 'lowercase'>('titlecase');
  const [fillStrategy, setFillStrategy] = useState<'mean' | 'median' | 'mode' | 'custom' | 'drop_row'>('mean');
  const [customFillValue, setCustomFillValue] = useState('');
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  // Numerical columns for outlier/imputation
  const numColumns = workingDataset.columns.filter((c) => c.type === 'number');

  // Helper to commit operation
  const commitOperation = (
    newRows: Record<string, any>[],
    newCols: ColumnMeta[],
    op: CleaningOperation
  ) => {
    const qualityScore = calculateQualityScore(newRows, newCols);
    const updated: Dataset = {
      ...workingDataset,
      rows: newRows,
      columns: newCols,
      rowCount: newRows.length,
      columnCount: newCols.length,
      qualityScore,
    };

    const newStep: CleaningHistoryStep = {
      id: `step-${Date.now()}`,
      operation: op,
      rowsBeforeCount: workingDataset.rowCount,
      rowsAfterCount: updated.rowCount,
      columnsBeforeCount: workingDataset.columnCount,
      columnsAfterCount: updated.columnCount,
      snapshot: newRows,
    };

    onApplyCleaning(updated, op, newStep);
  };

  // Operation 1: Deduplicate
  const handleRemoveDuplicates = () => {
    const { cleanedRows, removedCount } = removeDuplicates(workingDataset.rows);
    if (removedCount === 0) {
      setLastActionResult('No duplicate rows found. Dataset is already uniquely identified.');
      return;
    }
    const cols = refreshColumnMeta(cleanedRows, workingDataset.columns);
    const op: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'remove_duplicates',
      description: `Removed ${removedCount} identical duplicate rows.`,
      timestamp: new Date().toISOString(),
      affectedRowCount: removedCount,
    };
    commitOperation(cleanedRows, cols, op);
    setLastActionResult(`Success: Purged ${removedCount} duplicate rows.`);
  };

  // Operation 2: Drop empty columns
  const handleDropEmptyCols = () => {
    const { cleanedRows, cleanedColumns, droppedColumns } = dropEmptyColumns(
      workingDataset.rows,
      workingDataset.columns
    );
    if (droppedColumns.length === 0) {
      setLastActionResult('All columns contain valid values; no empty columns detected.');
      return;
    }
    const op: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'drop_empty_columns',
      description: `Dropped ${droppedColumns.length} completely empty columns (${droppedColumns.join(', ')}).`,
      timestamp: new Date().toISOString(),
    };
    commitOperation(cleanedRows, cleanedColumns, op);
    setLastActionResult(`Success: Dropped empty columns (${droppedColumns.join(', ')}).`);
  };

  // Operation 3: Trim Whitespace
  const handleTrimWhitespace = () => {
    const { cleanedRows, modifiedCells } = trimWhitespace(workingDataset.rows);
    const cols = refreshColumnMeta(cleanedRows, workingDataset.columns);
    const op: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'trim_whitespace',
      description: `Trimmed extra whitespace across ${modifiedCells} text cells.`,
      timestamp: new Date().toISOString(),
    };
    commitOperation(cleanedRows, cols, op);
    setLastActionResult(`Success: Normalized formatting across ${modifiedCells} cells.`);
  };

  // Operation 4: Normalize Casing
  const handleNormalizeCasing = () => {
    if (!selectedColumn) return;
    const { cleanedRows, modifiedCount } = normalizeCasing(
      workingDataset.rows,
      selectedColumn,
      casingMode
    );
    const cols = refreshColumnMeta(cleanedRows, workingDataset.columns);
    const op: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'normalize_casing',
      column: selectedColumn,
      description: `Normalized '${selectedColumn}' to ${casingMode} (${modifiedCount} values modified).`,
      timestamp: new Date().toISOString(),
    };
    commitOperation(cleanedRows, cols, op);
    setLastActionResult(`Success: Converted ${modifiedCount} entries to ${casingMode}.`);
  };

  // Operation 5: Impute missing values
  const handleFillMissing = () => {
    if (!selectedColumn) return;
    const { cleanedRows, imputedCount } = fillMissingValues(
      workingDataset.rows,
      selectedColumn,
      fillStrategy,
      customFillValue
    );
    const cols = refreshColumnMeta(cleanedRows, workingDataset.columns);
    const op: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'fill_missing',
      column: selectedColumn,
      description: `Handled ${imputedCount} missing values in '${selectedColumn}' using '${fillStrategy}'.`,
      timestamp: new Date().toISOString(),
      affectedRowCount: imputedCount,
    };
    commitOperation(cleanedRows, cols, op);
    setLastActionResult(`Success: Processed ${imputedCount} missing cells in ${selectedColumn}.`);
  };

  // Operation 6: Filter outliers (IQR)
  const handleFilterOutliers = () => {
    if (!selectedColumn) return;
    const { cleanedRows, removedCount, lowerBound, upperBound } = filterOutliers(
      workingDataset.rows,
      selectedColumn
    );
    if (removedCount === 0) {
      setLastActionResult(`No statistical outliers found in '${selectedColumn}' within IQR bounds [${lowerBound}, ${upperBound}].`);
      return;
    }
    const cols = refreshColumnMeta(cleanedRows, workingDataset.columns);
    const op: CleaningOperation = {
      id: `op-${Date.now()}`,
      type: 'filter_outliers',
      column: selectedColumn,
      description: `Filtered ${removedCount} numerical outliers from '${selectedColumn}' outside IQR range [${lowerBound}, ${upperBound}].`,
      timestamp: new Date().toISOString(),
      affectedRowCount: removedCount,
    };
    commitOperation(cleanedRows, cols, op);
    setLastActionResult(`Success: Filtered ${removedCount} statistical outliers from ${selectedColumn}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Studio Header & Quality Indicator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Data Cleaning Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Clean datasets without destructively altering raw imports. Every transformation is non-destructive,
            previewable, and backed by full multi-level undo/redo.
          </p>
        </div>

        {/* Quality Score Meter */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data Health Score</div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{workingDataset.qualityScore}</span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-200" />

          {/* Undo / Redo controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={historyIndex <= 0}
              title="Undo last cleaning operation"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo operation"
              className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={onReset}
              title="Reset working dataset to original raw import"
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {lastActionResult && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{lastActionResult}</span>
          </div>
          <button
            onClick={() => setLastActionResult(null)}
            className="text-sky-600 hover:text-sky-900 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Before & After Audit Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Original Import Rows</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{originalDataset.rowCount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Current Clean Rows</p>
          <p className="text-xl font-bold text-sky-600 mt-1">{workingDataset.rowCount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Columns Active</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{workingDataset.columnCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Operations Applied</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{history.length}</p>
        </div>
      </div>

      {/* Interactive Cleaning Tools Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Global Cleanup Suite */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            Dataset-Wide Hygiene
          </h3>

          <div className="space-y-3">
            {/* Deduplicate */}
            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Deduplicate Identical Rows</p>
                <p className="text-[11px] text-slate-500">
                  Detects and removes rows where every cell matches a previous record.
                </p>
              </div>
              <button
                onClick={handleRemoveDuplicates}
                className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                Remove Duplicates
              </button>
            </div>

            {/* Drop empty columns */}
            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Prune Empty Columns</p>
                <p className="text-[11px] text-slate-500">
                  Eliminates columns that contain zero non-null values across all rows.
                </p>
              </div>
              <button
                onClick={handleDropEmptyCols}
                className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                Drop Empty Columns
              </button>
            </div>

            {/* Trim whitespace */}
            <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Trim Extra Whitespace</p>
                <p className="text-[11px] text-slate-500">
                  Strips leading/trailing spaces and tab characters from all text columns.
                </p>
              </div>
              <button
                onClick={handleTrimWhitespace}
                className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs shrink-0 cursor-pointer transition-colors"
              >
                Trim Strings
              </button>
            </div>
          </div>
        </div>

        {/* Targeted Column-Specific Cleaners */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            Targeted Column Transformations
          </h3>

          {/* Column selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Column</label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500"
            >
              {workingDataset.columns.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type} • {c.missingCount} missing)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-2">
            {/* Normalize casing */}
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-800">Normalize String Casing</p>
              <div className="flex gap-2">
                <select
                  value={casingMode}
                  onChange={(e) => setCasingMode(e.target.value as any)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="titlecase">Title Case (John Smith)</option>
                  <option value="uppercase">UPPERCASE (JOHN SMITH)</option>
                  <option value="lowercase">lowercase (john smith)</option>
                </select>
                <button
                  onClick={handleNormalizeCasing}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Apply Casing
                </button>
              </div>
            </div>

            {/* Impute missing values */}
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-slate-800">Handle Missing Values</p>
              <div className="flex flex-wrap gap-2">
                <select
                  value={fillStrategy}
                  onChange={(e) => setFillStrategy(e.target.value as any)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="mean">Fill with Column Mean</option>
                  <option value="median">Fill with Median</option>
                  <option value="mode">Fill with Most Frequent (Mode)</option>
                  <option value="custom">Fill with Custom Value</option>
                  <option value="drop_row">Drop Rows with Missing Values</option>
                </select>

                {fillStrategy === 'custom' && (
                  <input
                    type="text"
                    value={customFillValue}
                    onChange={(e) => setCustomFillValue(e.target.value)}
                    placeholder="Enter fill value"
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 w-32"
                  />
                )}

                <button
                  onClick={handleFillMissing}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Impute
                </button>
              </div>
            </div>

            {/* IQR Outlier Filter */}
            {numColumns.some((c) => c.name === selectedColumn) && (
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-amber-50/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Numerical Outlier Filter (IQR 1.5x)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Isolate statistical anomalies outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR] to prevent skewed forecasts.
                </p>
                <button
                  onClick={handleFilterOutliers}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors"
                >
                  Filter IQR Outliers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cleaning History Timeline */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Cleaning Audit Trail ({history.length} operations applied)
          </h4>
          <div className="divide-y divide-slate-100">
            {history.map((step, idx) => (
              <div key={step.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">#{idx + 1}</span>
                  <span className="font-medium text-slate-800">{step.operation.description}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {step.rowsAfterCount} rows remaining
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
