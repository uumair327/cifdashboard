/**
 * Feature Flag Card Component
 * Single flag toggle card for the management dashboard
 */

import { useState } from 'react';
import { LuShield, LuToggleLeft, LuToggleRight, LuLoader2, LuClock, LuUser } from 'react-icons/lu';
import type { FeatureFlag } from '../../../core/feature-flags/domain/entities/FeatureFlag';

interface FeatureFlagCardProps {
    flag: FeatureFlag;
    onToggle: (enabled: boolean) => Promise<void>;
}

const CATEGORY_STYLES = {
    app: {
        badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
        label: 'App',
    },
    dashboard: {
        badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
        label: 'Dashboard',
    },
    experimental: {
        badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
        label: 'Experimental',
    },
};

export function FeatureFlagCard({ flag, onToggle }: FeatureFlagCardProps) {
    const [toggling, setToggling] = useState(false);
    const categoryStyle = CATEGORY_STYLES[flag.category];

    const handleToggle = async () => {
        if (flag.isLocked || toggling) return;
        setToggling(true);
        try {
            await onToggle(!flag.enabled);
        } finally {
            setToggling(false);
        }
    };

    const formattedDate = flag.lastModifiedAt
        ? new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(flag.lastModifiedAt)
        : null;

    return (
        <div
            className={`
        relative group bg-white dark:bg-slate-800 rounded-xl border transition-all duration-200
        ${flag.enabled
                    ? 'border-green-200 dark:border-green-800/50 shadow-sm shadow-green-50 dark:shadow-green-900/10'
                    : 'border-slate-200 dark:border-slate-700 opacity-75'
                }
        hover:shadow-md hover:-translate-y-0.5
      `}
        >
            {/* Status strip */}
            <div
                className={`absolute top-0 left-0 h-full w-1 rounded-l-xl transition-colors duration-300 ${flag.enabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
            />

            <div className="pl-5 pr-4 py-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {flag.name}
                            </h3>
                            {/* Category badge */}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryStyle.badge}`}>
                                {categoryStyle.label}
                            </span>
                            {/* Locked badge */}
                            {flag.isLocked && (
                                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                    <LuShield size={10} />
                                    Locked
                                </span>
                            )}
                        </div>
                        {/* Flag ID */}
                        <code className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                            {flag.id}
                        </code>
                    </div>

                    {/* Toggle button */}
                    <button
                        onClick={handleToggle}
                        disabled={flag.isLocked || toggling}
                        aria-label={`${flag.enabled ? 'Disable' : 'Enable'} ${flag.name}`}
                        aria-checked={flag.enabled}
                        role="switch"
                        className={`
              flex-shrink-0 p-1 rounded-lg transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800
              ${flag.isLocked
                                ? 'cursor-not-allowed opacity-40'
                                : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95'
                            }
            `}
                    >
                        {toggling ? (
                            <LuLoader2 size={32} className="animate-spin text-blue-500" />
                        ) : flag.enabled ? (
                            <LuToggleRight size={32} className="text-green-500" />
                        ) : (
                            <LuToggleLeft size={32} className="text-slate-400 dark:text-slate-500" />
                        )}
                    </button>
                </div>

                {/* Description */}
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {flag.description}
                </p>

                {/* Footer — audit info */}
                {(flag.lastModifiedBy || formattedDate) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-3 text-xs text-slate-400 dark:text-slate-500">
                        {flag.lastModifiedBy && (
                            <span className="flex items-center gap-1">
                                <LuUser size={11} />
                                {flag.lastModifiedBy}
                            </span>
                        )}
                        {formattedDate && (
                            <span className="flex items-center gap-1">
                                <LuClock size={11} />
                                {formattedDate}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
