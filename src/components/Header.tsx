import React, { useState } from 'react';
import { District, Sector, DemoRole, Language } from '../types';

interface HeaderProps {
  currentDistrict: District;
  onDistrictChange: (district: District) => void;
  currentSector: Sector;
  onSectorChange: (sector: Sector) => void;
  currentPeriod?: string;
  currentRole: DemoRole;
  onRoleChange: (role: DemoRole) => void;
  language?: Language;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  onToggleMobileMenu?: () => void;
  onStartWalkthrough?: () => void;
  onOpenDemoTools?: () => void;
  onOpenUploadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDistrict,
  onDistrictChange,
  currentSector,
  onSectorChange,
  currentPeriod = 'Last 90 Days (Q4 FY25-26)',
  currentRole,
  onRoleChange,
  language,
  currentLanguage,
  onLanguageChange,
  isSidebarOpen = true,
  onToggleSidebar,
  onToggleMobileSidebar,
  onToggleMobileMenu,
  onStartWalkthrough,
  onOpenDemoTools,
  onOpenUploadModal,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const [showSectorMenu, setShowSectorMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeLang = language || currentLanguage || 'en';
  const handleToggle = onToggleSidebar || onToggleMobileMenu || onToggleMobileSidebar || (() => {});

  const roleLabels: Record<string, { title: string; subtitle: string; icon: string }> = {
    district_admin: {
      title: 'District Admin (Pune)',
      subtitle: 'Approvals & Resource Allocation',
      icon: 'admin_panel_settings',
    },
    'district-admin': {
      title: 'District Admin (Pune)',
      subtitle: 'Approvals & Resource Allocation',
      icon: 'admin_panel_settings',
    },
    institute_coordinator: {
      title: 'Institute Coordinator',
      subtitle: 'Govt Poly Pune / Sahyadri ITI',
      icon: 'account_balance',
    },
    'institute-coordinator': {
      title: 'Institute Coordinator',
      subtitle: 'Govt Poly Pune / Sahyadri ITI',
      icon: 'account_balance',
    },
    employer_reviewer: {
      title: 'Employer Reviewer',
      subtitle: 'Hinjawadi Tech Taskforce',
      icon: 'verified_user',
    },
    'employer-reviewer': {
      title: 'Employer Reviewer',
      subtitle: 'Hinjawadi Tech Taskforce',
      icon: 'verified_user',
    },
    learner: {
      title: 'Learner (Rohan Deshmukh)',
      subtitle: 'Candidate DEMO-PUN-99214',
      icon: 'school',
    },
  };

  const currentRoleInfo = roleLabels[currentRole] || roleLabels.district_admin;

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200/80 shadow-xs px-3 sm:px-4 md:px-6 flex items-center justify-between shrink-0 w-full gap-2">
      {/* Left Zone: 3-line hamburger bar (visible on ALL devices) + Global Filter Selectors */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* 3-line Hamburger Menu Button - VISIBLE ON ALL DEVICES */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
          title={isSidebarOpen ? 'Move sidebar aside (Collapse)' : 'Show navigation sidebar (Expand)'}
          aria-label="Toggle navigation sidebar"
        >
          {/* 3 Line Bar Icon */}
          <svg className="w-5 h-5 text-slate-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="text-[11px] font-semibold hidden sm:inline text-slate-700">
            {isSidebarOpen ? 'Move aside' : 'Menu'}
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-[#00685f] px-2 py-0.5 rounded border border-emerald-200/60 whitespace-nowrap">
            Prototype • Illustrative data
          </span>
        </div>

        {/* Global Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* District Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDistrictMenu(!showDistrictMenu)}
              className="h-8 px-2 sm:px-2.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-md flex items-center gap-1 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-[#00685f]">location_on</span>
              <span className="font-semibold text-slate-500 hidden md:inline">District:</span>
              <span className="font-bold">{currentDistrict}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
            </button>
            {showDistrictMenu && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                {(['Pune', 'Mumbai', 'Nagpur'] as District[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      onDistrictChange(d);
                      setShowDistrictMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      currentDistrict === d ? 'font-bold text-[#00685f] bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{d}</span>
                    {currentDistrict === d && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sector Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSectorMenu(!showSectorMenu)}
              className="h-8 px-2 sm:px-2.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-md flex items-center gap-1 text-slate-800 text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] text-[#00685f]">business_center</span>
              <span className="font-semibold text-slate-500 hidden md:inline">Sector:</span>
              <span className="font-bold">{currentSector}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
            </button>
            {showSectorMenu && (
              <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                {(['IT–ITeS', 'Automotive', 'Healthcare'] as Sector[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onSectorChange(s);
                      setShowSectorMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                      currentSector === s ? 'font-bold text-[#00685f] bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{s}</span>
                    {currentSector === s && <span className="material-symbols-outlined text-[14px]">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Period Chip */}
          <div className="h-8 px-2.5 bg-slate-100/90 rounded-md hidden xl:flex items-center gap-1.5 text-slate-800 text-xs shrink-0">
            <span className="material-symbols-outlined text-[15px] text-[#00685f]">calendar_today</span>
            <span className="font-semibold text-slate-500">Period:</span>
            <span className="font-medium">{currentPeriod}</span>
          </div>
        </div>
      </div>

      {/* Right Zone: Guided Demo + Language + Role Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        {/* Guided Demo Walkthrough Trigger */}
        <button
          onClick={onStartWalkthrough}
          className="h-8 px-2 sm:px-2.5 md:px-3 bg-gradient-to-r from-[#00685f] to-[#008378] hover:from-[#005049] hover:to-[#00685f] text-white text-xs font-semibold rounded-md flex items-center gap-1 shadow-xs transition-all cursor-pointer shrink-0"
          title="Start 10-step presenter guided walkthrough"
        >
          <span className="material-symbols-outlined text-[16px]">play_circle</span>
          <span className="whitespace-nowrap hidden sm:inline">Guided Demo</span>
        </button>

        {/* Language selector */}
        <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-md text-xs shrink-0">
          <button
            onClick={() => onLanguageChange?.('en')}
            className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
              activeLang === 'en'
                ? 'bg-white text-[#00685f] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange?.('mr')}
            className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer ${
              activeLang === 'mr'
                ? 'bg-white text-[#00685f] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            मराठी
          </button>
        </div>

        {/* Notifications Icon with active badge */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer"
            title="Recent alerts"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
          </button>
          {showNotifications && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-xs">
              <div className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2 flex items-center justify-between">
                <span>Recent System Alerts</span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">3 New</span>
              </div>
              <div className="space-y-2">
                <div className="p-1.5 rounded bg-amber-50 border border-amber-200/60 text-amber-900">
                  <div className="font-semibold">Employer Concurrence Due</div>
                  <div className="text-[11px] text-amber-800">
                    Tech Taskforce pending review on Package 4B (Joins & Cleaning).
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700">
                  <div className="font-semibold">Hardware Feasibility Flag</div>
                  <div className="text-[11px] text-slate-600">
                    Dnyaneshwar ITI flagged 8GB RAM deficit for Postgres containers.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="h-8 px-2 sm:px-2.5 bg-slate-100 hover:bg-slate-200/80 rounded-md flex items-center gap-1.5 text-xs text-slate-800 transition-colors cursor-pointer border border-slate-200/70"
            title="Simulated User Role"
          >
            <span className="material-symbols-outlined text-[16px] text-slate-600">
              {currentRoleInfo.icon}
            </span>
            <div className="text-left hidden md:block">
              <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">
                Demo Role:
              </span>
              <span className="font-semibold text-slate-800 text-[11px] leading-tight block truncate max-w-[110px]">
                {currentRoleInfo.title}
              </span>
            </div>
            <span className="md:hidden font-semibold text-slate-800 text-[11px]">
              {currentRoleInfo.title.split(' ')[0]}
            </span>
            <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_drop_down</span>
          </button>

          {showRoleMenu && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Switch Active Role (Demo)
                </span>
              </div>
              {(
                [
                  'district_admin',
                  'institute_coordinator',
                  'employer_reviewer',
                  'learner',
                ] as DemoRole[]
              ).map((roleKey) => {
                const info = roleLabels[roleKey];
                const isSelected = currentRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => {
                      onRoleChange(roleKey);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/70 text-[#00685f]' : 'text-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-slate-500 mt-0.5 shrink-0">
                      {info.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>{info.title}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[15px] text-[#00685f]">
                            check
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">{info.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
