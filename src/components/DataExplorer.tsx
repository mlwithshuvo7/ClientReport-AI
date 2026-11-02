import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Filter,
  Download,
  Calendar,
  Hash,
  Type,
  ToggleLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
} from 'lucide-react';
import { Dataset, DataType } from '../types';
import { exportToSafeCsv } from '../lib/fileProcessor';

interface DataExplorerProps {
  dataset: Dataset;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ dataset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedColDetail, setSelectedColDetail] = useState<string | null>(null);

  // Type badge helper
  const renderTypeIcon = (type: DataType) => {
    switch (type) {
      case 'number':
        return <Hash className="w-3 h-3 text-sky-500" />;
      case 'date':
        return <Calendar className="w-3 h-3 text-emerald-500" />;
      case 'boolean':
        return <ToggleLeft className="w-3 h-3 text-amber-500" />;
      default:
        return <Type className="w-3 h-3 text-slate-400" />;
    }
  };

  // Filter and sort rows
  const filteredRows = useMemo(() => {
    let rows = dataset.rows;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((val) => String(val ?? '').toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      rows = [...rows].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA);
        const strB = String(valB);
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return rows;
  }, [dataset.rows, searchTerm, sortColumn, sortDirection]);

  // Pagination slice
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const handleExportCsv = () => {
    const csvContent = exportToSafeCsv(dataset.rows, dataset.columns);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_cleaned.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Header Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">{dataset.name}</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {dataset.fileName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Displaying <span className="font-bold text-slate-700">{dataset.rowCount.toLocaleString()}</span> rows and{' '}
            <span className="font-bold text-slate-700">{dataset.columnCount}</span> detected columns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Safe CSV
          </button>
        </div>
      </div>

      {/* Column Schema Badges Strip */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="uppercase text-[10px] tracking-wider text-slate-400">Detected Schema & Inferred Types</span>
          <span className="text-[11px] text-slate-400 font-normal">Click a column badge to inspect distribution</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {dataset.columns.map((col) => (
            <button
              key={col.name}
              onClick={() => setSelectedColDetail(selectedColDetail === col.name ? null : col.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedColDetail === col.name
                  ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {renderTypeIcon(col.type)}
              <span className="font-semibold">{col.name}</span>
              <span className="text-[10px] text-slate-400 ml-1 font-mono">({col.uniqueCount} uniq)</span>
              {col.missingCount > 0 && (
                <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded font-mono font-bold">
                  {col.missingCount} null
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Selected Column Inspection Detail */}
        {selectedColDetail && (
          <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 animate-in fade-in duration-100">
            {(() => {
              const col = dataset.columns.find((c) => c.name === selectedColDetail);
              if (!col) return null;
              return (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span>
                      <strong>Type:</strong> <span className="uppercase text-[10px] font-bold">{col.type}</span>
                    </span>
                    <span>
                      <strong>Missing:</strong> {col.missingCount} cells (
                      {((col.missingCount / dataset.rowCount) * 100).toFixed(1)}%)
                    </span>
                    <span>
                      <strong>Distinct Values:</strong> {col.uniqueCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Sample:</span>
                    <span className="font-mono text-slate-700">
                      {col.sampleValues.slice(0, 3).map((v) => String(v)).join(', ')}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Table & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search across all records..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500">
              Showing {filteredRows.length.toLocaleString()} matching rows
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none"
            >
              <option value={15}>15 rows</option>
              <option value={30}>30 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3 w-12 text-slate-400 font-mono">#</th>
                {dataset.columns.map((col) => (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200/60 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      {sortColumn === col.name && (
                        <span className="text-sky-600 font-mono text-[9px]">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-800">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={dataset.columns.length + 1} className="py-8 text-center text-slate-400 italic">
                    No matching records found for "{searchTerm}"
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 select-none font-sans text-[10px]">
                        {globalIdx}
                      </td>
                      {dataset.columns.map((col) => {
                        const cellVal = row[col.name];
                        const isNull = cellVal === null || cellVal === undefined || String(cellVal).trim() === '';
                        return (
                          <td key={col.name} className="px-4 py-2.5 whitespace-nowrap">
                            {isNull ? (
                              <span className="text-slate-300 italic font-sans text-[10px]">null</span>
                            ) : (
                              String(cellVal)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
