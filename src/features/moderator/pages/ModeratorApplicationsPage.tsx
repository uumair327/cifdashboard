/**
 * Admin view: Moderator Applications Management Page
 *
 * Lists all moderator applications with approve/reject actions.
 * Approved moderators can have their access toggled on/off (suspended ↔ approved).
 * Only accessible to users with role 'admin'.
 */

import { type FC, useState } from 'react';
import {
    LuCheckCircle,
    LuXCircle,
    LuClock,
    LuLoader2,
    LuUsers,
    LuSearch,
    LuShieldAlert,
    LuShieldOff,
    LuShieldCheck,
    LuToggleLeft,
    LuToggleRight,
} from 'react-icons/lu';
import type {
    ModeratorApplication,
    ReviewApplicationPayload,
    ToggleModeratorPayload,
} from '../domain/entities/ModeratorApplication';
import { useToast } from '../../../core/components/Toast/ToastProvider';

interface Props {
    applications: ModeratorApplication[];
    loading: boolean;
    error: string | null;
    currentUid: string;
    onReview: (id: string, review: ReviewApplicationPayload) => Promise<void>;
    onToggle: (id: string, payload: ToggleModeratorPayload) => Promise<void>;
}

// ── Status helpers ─────────────────────────────────────────────────────────

type FilterKey = 'all' | 'pending' | 'approved' | 'rejected' | 'suspended';

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { label: string; icon: JSX.Element; cls: string }> = {
        pending: { label: 'Pending', icon: <LuClock className="w-3 h-3" />, cls: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400' },
        approved: { label: 'Approved', icon: <LuShieldCheck className="w-3 h-3" />, cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
        rejected: { label: 'Rejected', icon: <LuXCircle className="w-3 h-3" />, cls: 'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400' },
        suspended: { label: 'Suspended', icon: <LuShieldOff className="w-3 h-3" />, cls: 'bg-slate-100  text-slate-700  dark:bg-slate-700      dark:text-slate-300' },
    };
    const { label, icon, cls } = cfg[status] ?? cfg.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cls}`}>
            {icon} {label}
        </span>
    );
}

// ── Component ──────────────────────────────────────────────────────────────

const ModeratorApplicationsPage: FC<Props> = ({
    applications,
    loading,
    error,
    currentUid,
    onReview,
    onToggle,
}) => {
    const { addToast } = useToast();
    const [filter, setFilter] = useState<FilterKey>('all');
    const [actionId, setActionId] = useState<string | null>(null); // tracks which card is in-progress
    const [reviewNote, setReviewNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = applications.filter((app) => {
        const matchesFilter = filter === 'all' || app.status === filter;
        const matchesSearch =
            !searchQuery ||
            app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const counts: Record<FilterKey, number> = {
        all: applications.length,
        pending: applications.filter((a) => a.status === 'pending').length,
        approved: applications.filter((a) => a.status === 'approved').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
        suspended: applications.filter((a) => a.status === 'suspended').length,
    };

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        try {
            setActionId(id);
            await onReview(id, {
                status,
                reviewedBy: currentUid,
                reviewNote: reviewNote.trim() || undefined,
            });
            setReviewNote('');
            addToast('success', `Application ${status}.`);
        } catch {
            addToast('error', 'Failed to process review. Please try again.');
        } finally {
            setActionId(null);
        }
    };

    const handleToggle = async (app: ModeratorApplication) => {
        const willSuspend = app.status === 'approved';
        try {
            setActionId(app.id);
            await onToggle(app.id, { adminUid: currentUid });
            addToast(
                'success',
                willSuspend
                    ? `${app.applicantName}'s moderator access has been suspended.`
                    : `${app.applicantName}'s moderator access has been restored.`,
            );
        } catch {
            addToast('error', 'Failed to update access. Please try again.');
        } finally {
            setActionId(null);
        }
    };

    // ── Loading / Error states ───────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center">
                <LuShieldAlert className="w-10 h-10 mx-auto text-red-500 mb-3" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Failed to load applications</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <LuUsers className="w-6 h-6" />
                    Moderator Applications
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Review applications and manage active moderator access rights
                </p>
            </div>

            {/* Stats / Filter tabs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {(['all', 'pending', 'approved', 'suspended', 'rejected'] as FilterKey[]).map((key) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`p-3 rounded-xl border transition-all text-left ${filter === key
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{key}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{counts[key]}</p>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
            </div>

            {/* Application List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <LuShieldCheck className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No applications found</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                        {filter !== 'all' ? `No ${filter} applications.` : 'No moderator applications yet.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((app) => (
                        <div
                            key={app.id}
                            className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-4 transition-all hover:shadow-md"
                        >
                            {/* Applicant info row */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    {app.applicantPhotoURL ? (
                                        <img src={app.applicantPhotoURL} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                            {app.applicantName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-white truncate">{app.applicantName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{app.applicantEmail}</p>
                                    </div>
                                </div>
                                <StatusBadge status={app.status} />
                            </div>

                            {/* Application content */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Reason</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{app.reason}</p>
                                </div>
                                {app.experience && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Experience</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{app.experience}</p>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps & admin note */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span>Applied: {app.createdAt.toLocaleDateString()}</span>
                                {app.reviewedAt && <span>Reviewed: {app.reviewedAt.toLocaleDateString()}</span>}
                            </div>
                            {app.reviewNote && (
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Admin Note</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{app.reviewNote}</p>
                                </div>
                            )}

                            {/* ── Actions ─────────────────────────────────────────────── */}

                            {/* Pending: Approve / Reject */}
                            {app.status === 'pending' && (
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                    <textarea
                                        value={actionId === app.id ? reviewNote : ''}
                                        onChange={(e) => { setActionId(app.id); setReviewNote(e.target.value); }}
                                        placeholder="Optional admin note..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReview(app.id, 'approved')}
                                            disabled={actionId !== null}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {actionId === app.id ? <LuLoader2 className="w-4 h-4 animate-spin" /> : <LuCheckCircle className="w-4 h-4" />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(app.id, 'rejected')}
                                            disabled={actionId !== null}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <LuXCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Approved: Suspend (disable) */}
                            {app.status === 'approved' && (
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => handleToggle(app)}
                                        disabled={actionId !== null}
                                        className="flex items-center gap-2 py-2 px-4 rounded-lg border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        {actionId === app.id
                                            ? <LuLoader2 className="w-4 h-4 animate-spin" />
                                            : <LuToggleRight className="w-5 h-5" />
                                        }
                                        Suspend Access
                                    </button>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Temporarily revokes dashboard access. Can be restored at any time.
                                    </p>
                                </div>
                            )}

                            {/* Suspended: Restore access */}
                            {app.status === 'suspended' && (
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => handleToggle(app)}
                                        disabled={actionId !== null}
                                        className="flex items-center gap-2 py-2 px-4 rounded-lg border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {actionId === app.id
                                            ? <LuLoader2 className="w-4 h-4 animate-spin" />
                                            : <LuToggleLeft className="w-5 h-5" />
                                        }
                                        Restore Access
                                    </button>
                                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                        Re-enables dashboard access for this moderator.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModeratorApplicationsPage;
