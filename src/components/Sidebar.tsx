import React from 'react';
import { BrandLogo } from './BrandLogo';
import { DemoRole } from '../types';

export type NavTab =
  | 'overview'
  | 'demand-explorer'
  | 'course-alignment'
  | 'employer-review'
  | 'district-training-plan'
  | 'learner-pathway'
  | 'outcomes-and-evidence';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  evidenceCount?: number;
  district?: string;
  currentRole?: DemoRole;
  isOpen?: boolean;
  isOpenMobile?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
  onOpenDemoTools?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  evidenceCount = 124,
  district = 'Pune',
  currentRole = 'district_admin',
  isOpen = true,
  isOpenMobile,
  onClose,
  onCloseMobile,
  onOpenDemoTools,
}) => {
  // Use isOpen if provided, otherwise fallback to isOpenMobile
  const openState = isOpenMobile !== undefined ? isOpenMobile : isOpen;
  const handleClose = onClose || onCloseMobile || (() => {});

  const navItems: Array<{ id: NavTab; label: string; icon: string; countBadge?: number }> = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    { id: 'demand-explorer', label: 'Demand Explorer', icon: 'analytics' },
    { id: 'course-alignment', label: 'Course Alignment', icon: 'auto_stories' },
    { id: 'employer-review', label: 'Employer Review', icon: 'verified_user' },
    { id: 'district-training-plan', label: 'District Training Plan', icon: 'map' },
    { id: 'learner-pathway', label: 'Learner Pathway', icon: 'school' },
    { id: 'outcomes-and-evidence', label: 'Outcomes & Evidence', icon: 'fact_check' },
  ];

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay (only on smaller screens when open) */}
      {openState && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col justify-between bg-[#213145] text-[#eaf1ff] shadow-xl lg:shadow-none border-r border-slate-700/50 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          openState
            ? 'w-[260px] translate-x-0 opacity-100'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Inner container with fixed width to prevent text squishing during width animation */}
        <div className="w-[260px] flex flex-col h-full justify-between">
          <div className="flex flex-col">
            {/* Header Bar with Logo and 3-line Move Aside Toggle */}
            <div className="h-14 px-3 flex items-center justify-between border-b border-white/10 bg-[#1c2a3c]">
              <BrandLogo />
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15 active:scale-95 shadow-xs"
                title="Move sidebar aside (Collapse)"
                aria-label="Move sidebar aside"
              >
                {/* 3 Horizontal Lines Bar */}
                <svg className="w-4 h-4 text-teal-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span className="text-[11px] font-bold text-teal-200 tracking-tight">Move aside</span>
              </button>
            </div>

            {/* Nav List */}
            <nav className="p-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (window.innerWidth < 1024) {
                        handleClose();
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left w-full cursor-pointer ${
                      isActive
                        ? 'bg-[#00685f] text-white font-semibold shadow-sm'
                        : 'text-[#eaf1ff]/85 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.id === 'employer-review' && (
                      <span className="w-2 h-2 rounded-full bg-[#ffb77d] shrink-0" title="Action pending" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer Section (Maharashtra Mission and SIH/Team removed per request) */}
          <div className="p-4 bg-[#192636] border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#89f5e7] animate-pulse"></span>
              <span className="text-xs text-white font-medium">Evidence Sync: Healthy</span>
            </div>
            <p className="text-[11px] font-mono text-white/70">
              ({evidenceCount.toLocaleString()} {district} Postings)
            </p>

            <button
              onClick={onOpenDemoTools}
              className="w-full px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors border border-white/10 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">settings_backup_restore</span>
              <span>Demo Tools & Data Reset</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
