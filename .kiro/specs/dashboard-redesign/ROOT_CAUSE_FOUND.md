# Root Cause: Data Not Loading in New Clean Architecture

**Date**: November 25, 2025  
**Status**: 🎯 **ROOT CAUSE IDENTIFIED**

---

## The Core Issue

### Old Implementation (Working) ✅
```typescript
// src/old_src/hooks/useCollectionData.ts
const unsubscribe = onSnapshot(
  collection(db, collectionName),
  (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setData(items);  // ← Real-time updates!
  }
);
```

**Key Feature**: Uses `onSnapshot` for **real-time synchronization**

### New Implementation (Not Working) ❌
```typescript
// src/features/collections/data/repositories/FirebaseCollectionRepository.ts
async getAll(): Promise<T[]> {
  const collectionRef = collection(db, this.collectionName);
  const snapshot = await getDocs(collectionRef);  // ← One-time fetch only!
  return snapshot.docs.map(doc => this.docToEntity(doc.id, doc.data()));
}
```

**Key Issue**: Uses `getDocs` for **one-time fetch only**

---

## Why This Matters

### Scenario 1: Fresh Page Load
1. User logs in
2. Component mounts
3. `useCollection` hook calls `repository.getAll()`
4. Data fetches successfully
5. **BUT**: If auth completes AFTER component mount, data never fetches

### Scenario 2: Auth Timing
1. Component mounts → starts data fetch
2. Firebase auth still initializing
3. Firestore security rules reject unauthenticated request
4. Data fetch fails silently
5. No retry mechanism

### Scenario 3: Cache Issues
The new implementation has caching:
```typescript
const isCacheValid = useCallback((): boolean => {
  const cached = collectionCache.get(collectionName);
  if (!cached) return false;
  const age = now - cached.timestamp;
  return age < cacheTTL;  // 5 minutes
}, [collectionName, cacheTTL]);
```

If cache is populated with empty data, it stays empty for 5 minutes!

---

## Comparison Table

| Feature | Old Implementation | New Implementation |
|---------|-------------------|-------------------|
| **Fetch Method** | `onSnapshot` | `getDocs` |
| **Real-time Updates** | ✅ Yes | ❌ No |
| **Auth Retry** | ✅ Automatic | ❌ Manual only |
| **Caching** | ✅ Simple (1 sec debounce) | ⚠️ Complex (5 min TTL) |
| **Error Recovery** | ✅ Auto-retry | ❌ No retry |
| **Cleanup** | ✅ Unsubscribe on unmount | ✅ Ref tracking |

---

## The Missing Pieces

### 1. No Real-Time Listener
The repository doesn't support subscriptions, only one-time fetches.

### 2. No Auth-Aware Fetching
The hook doesn't wait for auth to complete before fetching.

### 3. Cache Can Store Empty Data
If first fetch fails, empty array gets cached for 5 minutes.

### 4. No Automatic Retry
If fetch fails due to auth timing, no retry happens.

---

## Solutions

### Solution 1: Add Real-Time Support (Recommended)
Add subscription support to the repository while maintaining Clean Architecture:

```typescript
// Add to ICollectionRepository interface
subscribe(
  onData: (items: T[]) => void,
  onError: (error: Error) => void
): () => void;

// Implement in FirebaseCollectionRepository
subscribe(onData, onError) {
  const unsubscribe = onSnapshot(
    collection(db, this.collectionName),
    (snapshot) => {
      const items = snapshot.docs.map(doc => this.docToEntity(doc.id, doc.data()));
      onData(items);
    },
    onError
  );
  return unsubscribe;
}
```

### Solution 2: Add Auth-Aware Hook
Wait for auth before fetching:

```typescript
const { user, loading: authLoading } = useAuth();

useEffect(() => {
  if (!authLoading && user) {
    fetchData();
  }
}, [authLoading, user, fetchData]);
```

### Solution 3: Fix Cache Behavior
Don't cache empty results:

```typescript
if (result.length > 0) {
  setCachedData(result);
}
```

### Solution 4: Add Retry Logic
Retry failed fetches:

```typescript
const fetchWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await repository.getAll();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
};
```

---

## Recommended Fix

**Implement Solution 1 + Solution 2**:

1. Add `subscribe()` method to repository interface
2. Implement real-time listener in Firebase repository
3. Update `useCollection` hook to use subscription when available
4. Add auth-aware fetching to prevent timing issues

This maintains Clean Architecture while restoring the real-time functionality that made the old implementation work reliably.

---

## Files to Modify

1. **src/features/collections/domain/repositories/ICollectionRepository.ts**
   - Add `subscribe()` method to interface

2. **src/features/collections/data/repositories/FirebaseCollectionRepository.ts**
   - Implement `subscribe()` with `onSnapshot`

3. **src/features/collections/hooks/useCollection.ts**
   - Use `subscribe()` instead of `getAll()`
   - Add auth-aware fetching
   - Fix cache to not store empty results

---

**Diagnosis by**: Kiro AI Agent  
**Date**: November 25, 2025  
**Confidence**: 🎯 **HIGH** - This is the root cause

**Next Step**: Implement the recommended fix to restore data loading functionality.
