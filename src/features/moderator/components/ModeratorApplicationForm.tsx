/**
 * Moderator Application Form
 *
 * Shown to unapproved users after they sign in.
 * Once submitted, shows a status card indicating their application is pending/rejected.
 */

import { type FC, useState } from 'react';
import { useAuth } from '../../../core/auth';
import { LuSend, LuLoader2, LuClock, LuCheckCircle, LuXCircle, LuShieldOff } from 'react-icons/lu';
import type { ModeratorApplication, SubmitApplicationPayload } from '../domain/entities/ModeratorApplication';

interface Props {
    myApplication: ModeratorApplication | null;
    loading: boolean;
    error: string | null;
    onSubmit: (payload: SubmitApplicationPayload) => Promise<void>;
}

const ModeratorApplicationForm: FC<Props> = ({ myApplication, loading, error, onSubmit }) => {
    const { user } = useAuth();
    const [reason, setReason] = useState('');
    const [experience, setExperience] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!user) return;
        if (!reason.trim()) {
            setLocalError('Please provide a reason for applying.');
            return;
        }

        try {
            setSubmitting(true);
            const payload: SubmitApplicationPayload = {
                applicantUid: user.uid,
                applicantEmail: user.email ?? '',
                applicantName: user.displayName ?? 'Unknown',
                applicantPhotoURL: user.photoURL ?? null,
                reason: reason.trim(),
                experience: experience.trim(),
            };
            await onSubmit(payload);
        } catch {
            setLocalError('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
        );
    }

    // ── Already submitted ────────────────────────────────────────────────────
    if (myApplication) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
                <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
                    <div className="text-center space-y-4">
                        {/* Status icon */}
                        {myApplication.status === 'pending' && (
                            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <LuClock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            </div>
                        )}
                        {myApplication.status === 'approved' && (
                            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <LuCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        )}
                        {myApplication.status === 'rejected' && (
                            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <LuXCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                        )}

                        {myApplication.status === 'suspended' && (
                            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <LuShieldOff className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {myApplication.status === 'pending' && 'Application Under Review'}
                            {myApplication.status === 'approved' && 'Application Approved!'}
                            {myApplication.status === 'rejected' && 'Application Not Approved'}
                            {myApplication.status === 'suspended' && 'Access Suspended'}
                        </h2>

                        <p className="text-slate-600 dark:text-slate-400">
                            {myApplication.status === 'pending' &&
                                'Your moderator application has been submitted and is awaiting admin review. You will get access once approved.'}
                            {myApplication.status === 'approved' &&
                                'Congratulations! You now have moderator access. Please refresh the page to access the dashboard.'}
                            {myApplication.status === 'rejected' &&
                                'Unfortunately, your application was not approved at this time.'}
                            {myApplication.status === 'suspended' &&
                                'Your moderator access has been temporarily suspended by an admin. Please contact an administrator for more information.'}
                        </p>

                        {myApplication.reviewNote && (
                            <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-left">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                                    Admin Note
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{myApplication.reviewNote}</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Submitted</p>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {myApplication.createdAt.toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Status</p>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${myApplication.status === 'pending'
                                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                        : myApplication.status === 'approved'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : myApplication.status === 'suspended'
                                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {myApplication.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Submit Form ──────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
            <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Apply for Moderator Access
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Fill out the form below to request access to the CIF Guardian Care Dashboard.
                        An admin will review your application.
                    </p>
                </div>

                {/* User info display */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                            {user?.displayName?.charAt(0) ?? '?'}
                        </div>
                    )}
                    <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.displayName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Why do you want to be a moderator? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="reason"
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe your motivation for becoming a CIF Dashboard moderator..."
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Relevant Experience
                        </label>
                        <textarea
                            id="experience"
                            rows={3}
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            placeholder="Share any relevant experience (e.g., community management, child safety, social work)..."
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                        />
                    </div>

                    {(error || localError) && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                            {localError || error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {submitting ? (
                            <LuLoader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <LuSend className="w-5 h-5" />
                        )}
                        {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ModeratorApplicationForm;
