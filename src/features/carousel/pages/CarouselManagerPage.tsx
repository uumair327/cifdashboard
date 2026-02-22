/**
 * Carousel Manager Page
 *
 * Full CRUD UI for the `carousel_items` Firestore collection.
 * Changes here propagate instantly to the GuardianCare Flutter app
 * via Firestore real-time listeners.
 *
 * Fields (matching GuardianCare CarouselItemModel):
 *   type        – 'image' | 'video' | 'custom'
 *   imageUrl    – banner image shown in carousel
 *   thumbnailUrl– optional thumbnail (fallback)
 *   link        – URL opened on tap (webview) OR route
 *   content     – JSON payload for 'custom' cards
 *   order       – display order (ascending)
 *   isActive    – if false, item is hidden from the app
 */

import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    query,
    orderBy,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import {
    LuPlus,
    LuPencil,
    LuTrash2,
    LuEye,
    LuEyeOff,
    LuGripVertical,
    LuImage,
    LuVideo,
    LuLayoutTemplate,
    LuLoader2,
    LuX,
    LuCheck,
    LuExternalLink,
    LuAlertTriangle,
} from 'react-icons/lu';
import { logger } from '../../../core/utils/logger';

// ── Types ──────────────────────────────────────────────────────────────────

type CarouselType = 'image' | 'video' | 'custom';

interface CarouselItem {
    id: string;
    type: CarouselType;
    imageUrl: string;
    thumbnailUrl: string;
    link: string;
    content: Record<string, unknown>;
    order: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

type DraftItem = Omit<CarouselItem, 'id' | 'createdAt' | 'updatedAt'>;

const COLLECTION = 'carousel_items';

const emptyDraft = (): DraftItem => ({
    type: 'image',
    imageUrl: '',
    thumbnailUrl: '',
    link: '',
    content: {},
    order: 0,
    isActive: true,
});

// ── Sub-components ─────────────────────────────────────────────────────────

const TypeIcon: FC<{ type: CarouselType; className?: string }> = ({ type, className = 'w-4 h-4' }) => {
    if (type === 'video') return <LuVideo className={className} />;
    if (type === 'custom') return <LuLayoutTemplate className={className} />;
    return <LuImage className={className} />;
};

const TypeBadge: FC<{ type: CarouselType }> = ({ type }) => {
    const cfg: Record<CarouselType, string> = {
        image: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
        video: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        custom: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg[type]}`}>
            <TypeIcon type={type} className="w-3 h-3" />
            {type}
        </span>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────

const CarouselManagerPage: FC = () => {
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null); // id being saved

    // Modal state
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [draft, setDraft] = useState<DraftItem>(emptyDraft());
    const [editId, setEditId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CarouselItem | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Drag-to-reorder
    const dragIndex = useRef<number | null>(null);

    // ── Real-time subscription ─────────────────────────────────────────────

    useEffect(() => {
        const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));

        const unsub = onSnapshot(
            q,
            (snap) => {
                const fetched: CarouselItem[] = snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        type: (data.type ?? 'image') as CarouselType,
                        imageUrl: data.imageUrl ?? '',
                        thumbnailUrl: data.thumbnailUrl ?? '',
                        link: data.link ?? '',
                        content: data.content ?? {},
                        order: data.order ?? 0,
                        isActive: data.isActive ?? true,
                        createdAt: data.createdAt?.toDate(),
                        updatedAt: data.updatedAt?.toDate(),
                    };
                });
                setItems(fetched);
                setLoading(false);
            },
            (err) => {
                logger.error('[CarouselManager] onSnapshot error:', err);
                setError(err.message);
                setLoading(false);
            },
        );

        return unsub;
    }, []);

    // ── Helpers ────────────────────────────────────────────────────────────

    const openAdd = useCallback(() => {
        const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) + 1 : 0;
        setDraft({ ...emptyDraft(), order: nextOrder });
        setFormError(null);
        setModal('add');
    }, [items]);

    const openEdit = useCallback((item: CarouselItem) => {
        setEditId(item.id);
        setDraft({
            type: item.type,
            imageUrl: item.imageUrl,
            thumbnailUrl: item.thumbnailUrl,
            link: item.link,
            content: item.content,
            order: item.order,
            isActive: item.isActive,
        });
        setFormError(null);
        setModal('edit');
    }, []);

    const openDelete = useCallback((item: CarouselItem) => {
        setDeleteTarget(item);
        setModal('delete');
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
        setEditId(null);
        setDeleteTarget(null);
        setFormError(null);
    }, []);

    const validateDraft = (d: DraftItem): string | null => {
        if (!d.imageUrl.trim()) return 'Image URL is required.';
        if (!d.link.trim()) return 'Link / URL is required.';
        try { new URL(d.imageUrl); } catch { return 'Image URL must be a valid URL.'; }
        return null;
    };

    // ── CRUD ───────────────────────────────────────────────────────────────

    const handleSave = useCallback(async () => {
        const err = validateDraft(draft);
        if (err) { setFormError(err); return; }

        setSaving('saving');
        try {
            const payload = {
                type: draft.type,
                imageUrl: draft.imageUrl.trim(),
                thumbnailUrl: draft.thumbnailUrl.trim(),
                link: draft.link.trim(),
                content: draft.content,
                order: draft.order,
                isActive: draft.isActive,
                updatedAt: Timestamp.now(),
            };

            if (modal === 'add') {
                await addDoc(collection(db, COLLECTION), {
                    ...payload,
                    createdAt: Timestamp.now(),
                });
            } else if (modal === 'edit' && editId) {
                await updateDoc(doc(db, COLLECTION, editId), payload);
            }
            closeModal();
        } catch (e) {
            setFormError(e instanceof Error ? e.message : 'Save failed.');
        } finally {
            setSaving(null);
        }
    }, [draft, modal, editId, closeModal]);

    const handleDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setSaving('deleting');
        try {
            await deleteDoc(doc(db, COLLECTION, deleteTarget.id));
            closeModal();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Delete failed.');
        } finally {
            setSaving(null);
        }
    }, [deleteTarget, closeModal]);

    const handleToggleActive = useCallback(async (item: CarouselItem) => {
        setSaving(item.id);
        try {
            await updateDoc(doc(db, COLLECTION, item.id), {
                isActive: !item.isActive,
                updatedAt: Timestamp.now(),
            });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Toggle failed.');
        } finally {
            setSaving(null);
        }
    }, []);

    // ── Drag-to-reorder ────────────────────────────────────────────────────

    const handleDragStart = useCallback((index: number) => {
        dragIndex.current = index;
    }, []);

    const handleDrop = useCallback(async (targetIndex: number) => {
        const from = dragIndex.current;
        if (from === null || from === targetIndex) return;
        dragIndex.current = null;

        const reordered = [...items];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(targetIndex, 0, moved);

        // Optimistic update
        setItems(reordered);

        // Persist new order to Firestore in a batch
        try {
            const batch = writeBatch(db);
            reordered.forEach((item, i) => {
                batch.update(doc(db, COLLECTION, item.id), { order: i, updatedAt: Timestamp.now() });
            });
            await batch.commit();
        } catch (e) {
            setError('Failed to save order. Please refresh.');
        }
    }, [items]);

    // ── Render ─────────────────────────────────────────────────────────────

    const activeItems = items.filter((i) => i.isActive);
    const inactiveItems = items.filter((i) => !i.isActive);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LuImage className="w-6 h-6 text-blue-500" />
                        Carousel Manager
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage the home screen carousel in GuardianCare app · {activeItems.length} active, {inactiveItems.length} hidden
                    </p>
                </div>
                <button
                    id="add-carousel-item-btn"
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <LuPlus className="w-4 h-4" />
                    Add Item
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                    <LuAlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                        <LuX className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
                </div>
            ) : items.length === 0 ? (
                /* Empty state */
                <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <LuImage className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">No carousel items yet</p>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Add your first carousel item to display it in the app.</p>
                    <button
                        onClick={openAdd}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors font-medium"
                    >
                        <LuPlus className="w-4 h-4" /> Add First Item
                    </button>
                </div>
            ) : (
                /* Item list */
                <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                        Drag rows to reorder · changes sync instantly to the GuardianCare app
                    </p>
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(index)}
                            className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-800 hover:shadow-md ${item.isActive
                                ? 'border-slate-200 dark:border-slate-700'
                                : 'border-slate-200/60 dark:border-slate-700/60 opacity-60'
                                }`}
                        >
                            {/* Drag handle */}
                            <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
                                <LuGripVertical className="w-5 h-5" />
                            </div>

                            {/* Order badge */}
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{index + 1}</span>
                            </div>

                            {/* Image preview */}
                            <div className="flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '';
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <LuImage className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <TypeBadge type={item.type} />
                                    {!item.isActive && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                            <LuEyeOff className="w-3 h-3" /> Hidden
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                    {item.imageUrl || <span className="italic text-slate-400">No image URL</span>}
                                </p>
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 transition-colors truncate max-w-[300px]"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <LuExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {item.link || 'No link set'}
                                </a>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {/* Active toggle */}
                                <button
                                    id={`toggle-active-${item.id}`}
                                    onClick={() => handleToggleActive(item)}
                                    disabled={saving === item.id}
                                    title={item.isActive ? 'Hide from app' : 'Show in app'}
                                    className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${item.isActive
                                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 focus:ring-emerald-500'
                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-slate-500'
                                        }`}
                                >
                                    {saving === item.id
                                        ? <LuLoader2 className="w-4 h-4 animate-spin" />
                                        : item.isActive
                                            ? <LuEye className="w-4 h-4" />
                                            : <LuEyeOff className="w-4 h-4" />
                                    }
                                </button>

                                {/* Edit */}
                                <button
                                    id={`edit-carousel-${item.id}`}
                                    onClick={() => openEdit(item)}
                                    title="Edit"
                                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <LuPencil className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                    id={`delete-carousel-${item.id}`}
                                    onClick={() => openDelete(item)}
                                    title="Delete"
                                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <LuTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Add / Edit Modal ───────────────────────────────────────────── */}
            {(modal === 'add' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {modal === 'add' ? 'Add Carousel Item' : 'Edit Carousel Item'}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <LuX className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            {/* Image preview */}
                            {draft.imageUrl && (
                                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <img
                                        src={draft.imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).alt = 'Invalid URL'; }}
                                    />
                                </div>
                            )}

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                <div className="flex gap-2">
                                    {(['image', 'video', 'custom'] as CarouselType[]).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setDraft((d) => ({ ...d, type: t }))}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${draft.type === t
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                                                }`}
                                        >
                                            <TypeIcon type={t} />
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label htmlFor="carousel-imageUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Image URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="carousel-imageUrl"
                                    type="url"
                                    value={draft.imageUrl}
                                    onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                                    placeholder="https://example.com/banner.jpg"
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label htmlFor="carousel-link" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Link / URL <span className="text-red-500">*</span>
                                    <span className="ml-1 text-xs text-slate-400 font-normal">(opened on tap)</span>
                                </label>
                                <input
                                    id="carousel-link"
                                    type="url"
                                    value={draft.link}
                                    onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
                                    placeholder="https://example.com/article"
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                />
                            </div>

                            {/* Thumbnail URL */}
                            <div>
                                <label htmlFor="carousel-thumbnailUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Thumbnail URL
                                    <span className="ml-1 text-xs text-slate-400 font-normal">(optional fallback)</span>
                                </label>
                                <input
                                    id="carousel-thumbnailUrl"
                                    type="url"
                                    value={draft.thumbnailUrl}
                                    onChange={(e) => setDraft((d) => ({ ...d, thumbnailUrl: e.target.value }))}
                                    placeholder="https://example.com/thumb.jpg"
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                />
                            </div>

                            {/* Order */}
                            <div>
                                <label htmlFor="carousel-order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Display Order
                                </label>
                                <input
                                    id="carousel-order"
                                    type="number"
                                    min={0}
                                    value={draft.order}
                                    onChange={(e) => setDraft((d) => ({ ...d, order: Number(e.target.value) }))}
                                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">Show in App</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">When off, hidden from GuardianCare home screen</p>
                                </div>
                                <button
                                    id="carousel-isActive-toggle"
                                    role="switch"
                                    aria-checked={draft.isActive}
                                    onClick={() => setDraft((d) => ({ ...d, isActive: !d.isActive }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${draft.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                >
                                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${draft.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Custom content JSON (only for 'custom' type) */}
                            {draft.type === 'custom' && (
                                <div>
                                    <label htmlFor="carousel-content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Custom Content (JSON)
                                        <span className="ml-1 text-xs text-slate-400 font-normal">(displayed in custom card view)</span>
                                    </label>
                                    <textarea
                                        id="carousel-content"
                                        rows={4}
                                        value={JSON.stringify(draft.content, null, 2)}
                                        onChange={(e) => {
                                            try {
                                                setDraft((d) => ({ ...d, content: JSON.parse(e.target.value) }));
                                                setFormError(null);
                                            } catch {
                                                setFormError('Content must be valid JSON.');
                                            }
                                        }}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono resize-none transition-colors"
                                        spellCheck={false}
                                    />
                                </div>
                            )}

                            {/* Form error */}
                            {formError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                                    <LuAlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    {formError}
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                id="carousel-save-btn"
                                onClick={handleSave}
                                disabled={!!saving}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
                            >
                                {saving ? <LuLoader2 className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                                {modal === 'add' ? 'Add to App' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
            {modal === 'delete' && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                <LuTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Carousel Item</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">This will immediately remove it from the GuardianCare app.</p>
                            </div>
                        </div>

                        {/* Preview */}
                        {deleteTarget.imageUrl && (
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={deleteTarget.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400 break-all">{deleteTarget.imageUrl}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                id="carousel-confirm-delete-btn"
                                onClick={handleDelete}
                                disabled={!!saving}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors font-medium text-sm"
                            >
                                {saving ? <LuLoader2 className="w-4 h-4 animate-spin" /> : <LuTrash2 className="w-4 h-4" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarouselManagerPage;
