import React, { useState } from 'react';
import { AppState } from '../types';
import { exportFullBackupJson, parseAndValidateBackup } from '../utils/storage';

interface DemoToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onResetToSeed: () => void;
  onRestoreState: (state: AppState) => void;
  onSimulateLearnerAssessment: () => void;
  onClearUploadedDocuments: () => void;
}

export const DemoToolsModal: React.FC<DemoToolsModalProps> = ({
  isOpen,
  onClose,
  appState,
  onResetToSeed,
  onRestoreState,
  onSimulateLearnerAssessment,
  onClearUploadedDocuments,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tools' | 'audit' | 'backup'>('tools');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const validated = parseAndValidateBackup(text);
        onRestoreState(validated);
        setImportSuccess(`Successfully imported backup generated for ${validated.currentDistrict} cohort!`);
      } catch (err: any) {
        setImportError(err.message || 'Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-[#213145] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[22px] text-teal-300">build_circle</span>
            <div>
              <h3 className="font-bold text-base">Kaushal Setu Demo Control & Storage Tools</h3>
              <p className="text-xs text-white/70">Browser-local IndexedDB prototype controls & audit provenance</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-6 pt-3 border-b border-slate-200 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tools')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'tools'
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Scenario Tools</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">backup</span>
            <span>Backup & Restore</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'audit'
                ? 'border-[#00685f] text-[#00685f]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history_edu</span>
            <span>Audit Trail ({appState.auditTrail.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'tools' && (
            <div className="space-y-4">
              {/* Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200/70 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">info</span>
                <div>
                  <span className="font-semibold block">Browser-Local Prototype Disclosure:</span>
                  All changes are persisted securely in your browser's IndexedDB storage. No simulated student data or employer records are sent to external databases or government APIs.
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Simulate Learner Pass */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#00685f] text-[18px]">verified</span>
                      <span className="text-xs font-bold text-slate-900">Simulate Assessment Result</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Simulate Rohan passing the 45-min live SQL sandbox test co-designed with Hinjawadi Taskforce, unlocking his Level 3 certification.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onSimulateLearnerAssessment();
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 bg-[#00685f] hover:bg-[#005049] text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    <span>Simulate Assessment Pass</span>
                  </button>
                </div>

                {/* Clear Uploaded Documents */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-slate-700 text-[18px]">delete_sweep</span>
                      <span className="text-xs font-bold text-slate-900">Clear Uploaded Documents</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Remove any custom uploaded syllabus texts, assessment outlines, or imported CSV records and retain canonical demo items.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClearUploadedDocuments();
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Clear Custom Files</span>
                  </button>
                </div>
              </div>

              {/* Reset to Seed Scenario */}
              <div className="pt-3 border-t border-slate-200">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Demo to Initial Seed Scenario (Pune IT-ITeS)</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-900">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      <span>Confirm Reset to Initial Scenario?</span>
                    </div>
                    <p className="text-[11px] text-red-800">
                      This will restore all curriculum mappings, recommendations, employer reviews, and training plans to their initial state.
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onResetToSeed();
                          setShowResetConfirm(false);
                          onClose();
                        }}
                        className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold"
                      >
                        Yes, Reset Demo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                You can save a complete snapshot of your current demonstration state (including reviewed mappings, employer decisions, and plan changes) as a JSON file, or restore from a previous backup.
              </p>

              {/* Export Full Backup */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Download Full State Backup</h4>
                  <p className="text-[11px] text-slate-500">Includes all districts, evidence, mappings, reviews & audit events.</p>
                </div>
                <button
                  onClick={() => exportFullBackupJson(appState)}
                  className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Export Backup</span>
                </button>
              </div>

              {/* Import Backup */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Restore from Backup File</h4>
                  <p className="text-[11px] text-slate-500">Select a validated Kaushal Setu demo JSON file to load.</p>
                </div>

                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#00685f] hover:file:bg-teal-100"
                />

                {importError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{importError}</p>
                )}
                {importSuccess && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">{importSuccess}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Demo activity history & audit trail</span>
                <span className="font-mono text-[11px]">Audit Reference: DEMO-AUD-ROOT</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {appState.auditTrail.map((ev) => (
                  <div key={ev.id} className="p-3 text-xs hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{ev.actor}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {ev.role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{ev.timestamp}</span>
                    </div>
                    <p className="text-slate-700 font-medium">{ev.actionType} — <span className="text-slate-500">{ev.entity}</span></p>
                    <p className="text-[11px] text-slate-500 mt-1 italic">{ev.notes}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Hash: {ev.hash}</span>
                      <span className="text-[#00685f] font-semibold">✓ {ev.verificationStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
