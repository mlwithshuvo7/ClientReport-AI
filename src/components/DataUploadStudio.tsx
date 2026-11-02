import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { processUploadedFile } from '../lib/fileProcessor';
import { getSampleDataset } from '../lib/sampleDatasets';
import { Dataset } from '../types';
import { ColumnMappingStudio } from './ColumnMappingStudio';

interface DataUploadStudioProps {
  onDatasetLoaded: (dataset: Dataset) => void;
  onNavigateTemplates?: () => void;
}

export const DataUploadStudio: React.FC<DataUploadStudioProps> = ({
  onDatasetLoaded,
  onNavigateTemplates,
}) => {
  const [stage, setStage] = useState<'upload' | 'mapping'>('upload');
  const [pendingDataset, setPendingDataset] = useState<Dataset | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setWarnings([]);
    setIsProcessing(true);

    try {
      const { dataset, warnings: parseWarnings } = await processUploadedFile(file);
      setWarnings(parseWarnings);
      // Route through Column Mapping Studio
      setPendingDataset(dataset);
      setStage('mapping');
    } catch (err: any) {
      setError(err?.message || 'Failed to process file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (type: 'saas' | 'ecommerce' | 'marketing', launchMapping = false) => {
    setIsProcessing(true);
    setTimeout(() => {
      const ds = getSampleDataset(type);
      if (launchMapping) {
        setPendingDataset(ds);
        setStage('mapping');
      } else {
        onDatasetLoaded(ds);
      }
      setIsProcessing(false);
    }, 200);
  };

  // If in mapping stage, render ColumnMappingStudio
  if (stage === 'mapping' && pendingDataset) {
    return (
      <ColumnMappingStudio
        rawDataset={pendingDataset}
        onConfirmMapping={(mappedDataset) => {
          onDatasetLoaded(mappedDataset);
        }}
        onCancel={() => {
          setStage('upload');
          setPendingDataset(null);
        }}
        onSkipMapping={() => {
          onDatasetLoaded(pendingDataset);
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Page Header & Template Gallery Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Dataset</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ingest raw CSV or Excel spreadsheets into your private in-browser analysis workspace.
          </p>
        </div>

        {onNavigateTemplates && (
          <button
            onClick={onNavigateTemplates}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Browse Project Templates Gallery →</span>
          </button>
        )}
      </div>

      {/* Main Drag-Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/70 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
            {isProcessing ? (
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isProcessing ? 'Parsing Dataset Locally...' : 'Drop your spreadsheet here, or browse files'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports <span className="font-semibold text-slate-700">.CSV</span> and{' '}
              <span className="font-semibold text-slate-700">.XLSX</span> workbooks up to 50MB (100k rows).
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-sky-500 text-white font-bold text-xs shadow-xs hover:bg-sky-600 transition-colors inline-flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Select Spreadsheet File
          </button>
        </div>
      </div>

      {/* Warnings & Errors */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">File Import Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Import Notices:
          </p>
          <ul className="list-disc list-inside text-[11px] space-y-0.5">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Feature Highlight: Column Mapping Notice */}
      <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sky-900">Custom Schema Column Mapping: </span>
            <span className="text-sky-800">
              Uploaded files automatically open in our Column Mapping Studio, allowing you to match custom headers, cast types, or exclude unneeded columns before entering the workspace.
            </span>
          </div>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold">100% In-Browser Confidentiality: </span>
            <span className="text-slate-300">
              Your spreadsheet is parsed directly in browser memory. Raw customer rows are never transmitted to any
              external server.
            </span>
          </div>
        </div>
        <div className="shrink-0 hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Local First</span>
        </div>
      </div>

      {/* Instant Demo Sample Datasets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Or Test Drive Immediately With Curated Datasets
          </h4>
          <span className="text-[11px] text-slate-400">Try with or without custom column mapping</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all text-left space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                SaaS B2B
              </span>
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900">SaaS MRR & Churn Metrics</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                20 enterprise accounts with Monthly Recurring Revenue, NPS scores, and churn flags.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleSelectSample('saas', true)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Test Mapping</span>
              </button>
              <button
                onClick={() => handleSelectSample('saas', false)}
                className="py-1.5 px-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Quick Load
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-left space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                Ecommerce Retail
              </span>
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900">Sales & Margins Deepdive</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                Omnichannel order logs with sales volume, discounts, shipping regions, and profit margins.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleSelectSample('ecommerce', true)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Test Mapping</span>
              </button>
              <button
                onClick={() => handleSelectSample('ecommerce', false)}
                className="py-1.5 px-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Quick Load
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-left space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                Marketing Ads
              </span>
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-900">Campaign ROI & Attribution</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                Ad spend, clicks, conversions, and ROAS across Google, Meta, LinkedIn, and TikTok channels.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                onClick={() => handleSelectSample('marketing', true)}
                className="flex-1 py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Test Mapping</span>
              </button>
              <button
                onClick={() => handleSelectSample('marketing', false)}
                className="py-1.5 px-2 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Quick Load
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
