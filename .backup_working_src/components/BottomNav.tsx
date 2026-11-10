import React from 'react';
import { Clock, Sparkles, BookOpen, Compass, CheckCircle2, BookmarkCheck } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Salah', icon: Clock },
    { id: 'hadith', label: 'Sunnah', icon: BookmarkCheck },
    { id: 'adhkar', label: 'Adhkar', icon: Sparkles },
    { id: 'quran', label: 'Quran', icon: BookOpen },
    { id: 'qibla', label: 'Qibla', icon: Compass },
    { id: 'tracker', label: 'Tracker', icon: CheckCircle2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 pb-safe">
      <div className="grid grid-cols-6 h-16 items-center px-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
