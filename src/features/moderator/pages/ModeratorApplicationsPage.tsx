/**
 * Admin view: Moderator Applications Management Page
 *
 * Lists all moderator applications with approve/reject actions.
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
    LuShieldCheck,
    LuShieldAlert,
} from 'react-icons/lu';
import type { ModeratorApplication, ReviewApplicationPayload } from '../domain/entities/ModeratorApplication';
import { useToast } from '../../../core/components/Toast/ToastProvider';

interface Props {
    applications: ModeratorApplication[];
    loading: boolean;
    error: string | null;
    currentUid: string;
    onReview: (id: string, review: ReviewApplicationPayload) => Promise<void>;
}

const ModeratorApplicationsPage: FC<Props> = ({
    applications,
    loading,
    error,
    currentUid,
    onReview,
}) => {
    const { addToast } = useToast();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [reviewingId, setReviewingId] = useState<string | null>(null);
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

    const counts = {
        all: applications.length,
        pending: applications.filter((a) => a.status === 'pending').length,
        approved: applications.filter((a) => a.status === 'approved').length,
        rejected: applications.filter((a) => a.status === 'rejected').length,
    };

    const handleReview = async (id: string, status: 'approved' | 'rejected') => {
        try {
            setReviewingId(id);
            await onReview(id, {
                status,
                reviewedBy: currentUid,
                reviewNote: reviewNote.trim() || undefined,
            });
            setReviewNote('');
            setReviewingId(null);
            addToast('success', `Application ${status} successfully.`);
        } catch {
            addToast('error', 'Failed to process review.');
            setReviewingId(null);
        }
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LuUsers className="w-6 h-6" />
                        Moderator Applications
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Review and manage moderator access requests
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`p-4 rounded-xl border transition-all text-left ${filter === key
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                    >
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                            {key}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{counts[key]}</p>
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
                            {/* Applicant info */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {app.applicantPhotoURL ? (
                                        <img src={app.applicantPhotoURL} alt="" className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                            {app.applicantName.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{app.applicantName}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{app.applicantEmail}</p>
                                    </div>
                                </div>

                                <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${app.status === 'pending'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                            : app.status === 'approved'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {app.status === 'pending' && <LuClock className="w-3 h-3" />}
                                    {app.status === 'approved' && <LuCheckCircle className="w-3 h-3" />}
                                    {app.status === 'rejected' && <LuXCircle className="w-3 h-3" />}
                                    {app.status}
                                </span>
                            </div>

                            {/* Application content */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                        Reason
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{app.reason}</p>
                                </div>
                                {app.experience && (
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                            Experience
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">{app.experience}</p>
                                    </div>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                <span>Applied: {app.createdAt.toLocaleDateString()}</span>
                                {app.reviewedAt && <span>Reviewed: {app.reviewedAt.toLocaleDateString()}</span>}
                            </div>

                            {/* Admin actions for pending applications */}
                            {app.status === 'pending' && (
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                    <textarea
                                        value={reviewingId === app.id ? reviewNote : ''}
                                        onChange={(e) => {
                                            setReviewingId(app.id);
                                            setReviewNote(e.target.value);
                                        }}
                                        placeholder="Optional admin note..."
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReview(app.id, 'approved')}
                                            disabled={reviewingId === app.id && !reviewNote && reviewingId !== null}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            {reviewingId === app.id ? (
                                                <LuLoader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <LuCheckCircle className="w-4 h-4" />
                                            )}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(app.id, 'rejected')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <LuXCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
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
