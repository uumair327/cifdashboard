/**
 * Feature Flags Management Page
 *
 * Lets admins toggle any feature flag live — changes propagate instantly
 * to all open sessions via Firestore real-time subscription.
 */

import { useMemo, useState } from 'react';
import {
    LuFlag,
    LuRefreshCw,
    LuSearch,
    LuCheckCircle2,
    LuXCircle,
    LuLayoutGrid,
    LuList,
} from 'react-icons/lu';
import { useFeatureFlags } from '../../../core/feature-flags/providers/FeatureFlagProvider';
import { FeatureFlagService } from '../../../core/feature-flags/domain/services/FeatureFlagService';
import { useAuth } from '../../../core/auth';
import { FeatureFlagCard } from '../components/FeatureFlagCard';
import type { FeatureFlagCategory } from '../../../core/feature-flags/domain/entities/FeatureFlag';

const CATEGORY_LABELS: Record<FeatureFlagCategory, string> = {
    app: '📱 App Features',
    dashboard: '🖥️ Dashboard Features',
    experimental: '🧪 Experimental',
};

export default function FeatureFlagsPage() {
    const { flags, loading, error, toggle } = useFeatureFlags();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterCategory, setFilterCategory] = useState<FeatureFlagCategory | 'all'>('all');

    // ── Stats ────────────────────────────────────────────────────────────────
    const enabledCount = flags.filter(f => f.enabled).length;
    const disabledCount = flags.filter(f => !f.enabled).length;

    // ── Filtered + grouped ───────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return flags.filter(f => {
            const matchesSearch =
                !q ||
                f.name.toLowerCase().includes(q) ||
                f.id.toLowerCase().includes(q) ||
                f.description.toLowerCase().includes(q);
            const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [flags, search, filterCategory]);

    const grouped = useMemo(
        () => FeatureFlagService.groupByCategory(filtered),
        [filtered]
    );

    const activeCategories = (Object.keys(grouped) as FeatureFlagCategory[]).filter(
        cat => grouped[cat].length > 0
    );

    // ── Toggle handler ────────────────────────────────────────────────────────
    const handleToggle = async (
        key: import('../../../core/feature-flags/domain/entities/FeatureFlag').FeatureFlagKey,
        enabled: boolean
    ) => {
        await toggle(key, enabled, user?.email ?? 'unknown');
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LuRefreshCw className="animate-spin text-blue-500 mr-3" size={24} />
                <span className="text-slate-600 dark:text-slate-400">Loading feature flags...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <LuXCircle className="mx-auto mb-3 text-red-500" size={32} />
                <h2 className="font-semibold text-red-800 dark:text-red-200 mb-1">Failed to load feature flags</h2>
                <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Page Header ─────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                    <LuFlag size={28} />
                    <h1 className="text-3xl font-bold">Feature Flags</h1>
                </div>
                <p className="text-indigo-100 max-w-2xl">
                    Toggle features on or off in real time. Changes propagate instantly to all connected
                    GuardianCare sessions — no deployments required.
                </p>

                {/* ── Summary stats ──────────────────────────────────────────────── */}
                <div className="flex gap-6 mt-6">
                    <div className="flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2">
                        <LuCheckCircle2 size={18} className="text-green-300" />
                        <span className="text-sm font-medium">{enabledCount} enabled</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2">
                        <LuXCircle size={18} className="text-red-300" />
                        <span className="text-sm font-medium">{disabledCount} disabled</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2">
                        <LuFlag size={18} />
                        <span className="text-sm font-medium">{flags.length} total</span>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search flags by name, ID or description..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Category filter */}
                <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value as FeatureFlagCategory | 'all')}
                    className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">All categories</option>
                    <option value="app">App</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="experimental">Experimental</option>
                </select>

                {/* View toggle */}
                <div className="flex gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        aria-label="Grid view"
                    >
                        <LuLayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        aria-label="List view"
                    >
                        <LuList size={16} />
                    </button>
                </div>
            </div>

            {/* ── Flag Groups ──────────────────────────────────────────────────── */}
            {activeCategories.length === 0 ? (
                <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                    <LuFlag className="mx-auto mb-3 opacity-40" size={40} />
                    <p className="font-medium">No flags match your search</p>
                </div>
            ) : (
                activeCategories.map(category => (
                    <section key={category} className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            {CATEGORY_LABELS[category]}
                            <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                {grouped[category].length}
                            </span>
                        </h2>

                        <div
                            className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                                    : 'flex flex-col gap-3'
                            }
                        >
                            {grouped[category].map(flag => (
                                <FeatureFlagCard
                                    key={flag.id}
                                    flag={flag}
                                    onToggle={enabled => handleToggle(flag.id, enabled)}
                                />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
