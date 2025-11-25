/**
 * Import Modal Component
 * Handles CSV/JSON import with validation and preview
 */

import { useState } from 'react';
import { LuUpload, LuX, LuAlertCircle, LuCheckCircle, LuFileText } from 'react-icons/lu';
import { ImportService, ImportResult } from '../domain/services/ImportService';
import { BaseCollection } from '../domain/entities/Collection';

interface ImportModalProps<T extends BaseCollection> {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Partial<T>[]) => Promise<void>;
  requiredFields: string[];
  optionalFields?: string[];
  collectionName: string;
}

export function ImportModal<T extends BaseCollection>({
  isOpen,
  onClose,
  onImport,
  requiredFields,
  optionalFields = [],
  collectionName,
}: ImportModalProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult<T> | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.toLowerCase();
    if (!fileType.endsWith('.csv') && !fileType.endsWith('.json')) {
      alert('Please select a CSV or JSON file');
      return;
    }

    setFile(selectedFile);
    setImporting(true);

    try {
      const result = await ImportService.processImport<T>(
        selectedFile,
        requiredFields,
        optionalFields
      );
      setImportResult(result);
      setStep('preview');
    } catch (error) {
      alert(`Error processing file: ${(error as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!importResult || importResult.data.length === 0) return;

    setImporting(true);
    try {
      await onImport(importResult.data);
      handleClose();
    } catch (error) {
      alert(`Error importing data: ${(error as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setStep('upload');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Import {collectionName}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Upload CSV or JSON file to import multiple items
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
                <LuUpload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Choose a file to import
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Supports CSV and JSON formats
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={importing}
                  />
                  <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block">
                    {importing ? 'Processing...' : 'Select File'}
                  </span>
                </label>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Required Fields
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {requiredFields.map(field => (
                    <li key={field}>• {field}</li>
                  ))}
                </ul>
                {optionalFields.length > 0 && (
                  <>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mt-3 mb-2">
                      Optional Fields
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {optionalFields.map(field => (
                        <li key={field}>• {field}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 'preview' && importResult && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                    <LuCheckCircle size={20} />
                    <span className="font-semibold">Valid Rows</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {importResult.data.length}
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-1">
                    <LuAlertCircle size={20} />
                    <span className="font-semibold">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {importResult.errors.length}
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-1">
                    <LuFileText size={20} />
                    <span className="font-semibold">Warnings</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {importResult.warnings.length}
                  </p>
                </div>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Errors Found
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {importResult.warnings.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Warnings
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index}>
                        Row {warning.row}: {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {importResult.data.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Preview (First 5 rows)
                  </h4>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                          {Object.keys(importResult.data[0]).map(key => (
                            <th
                              key={key}
                              className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {importResult.data.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td
                                key={i}
                                className="px-4 py-2 text-sm text-slate-900 dark:text-white whitespace-nowrap"
                              >
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          {step === 'preview' && (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setImportResult(null);
                }}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Choose Different File
              </button>
              <button
                onClick={handleImport}
                disabled={importing || !importResult || importResult.data.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {importing ? 'Importing...' : `Import ${importResult?.data.length || 0} Items`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
