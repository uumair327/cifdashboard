# Debugging Guide - No Data Showing

## Current Status

All architectural fixes have been applied:
- ✅ Repository factory with dependency injection
- ✅ Auth service abstraction with loading states
- ✅ Repository instances memoized with `useMemo`
- ✅ Toast imports fixed
- ✅ Enhanced console logging added

## How to Debug

### Step 1: Open Browser DevTools

1. Open the application in your browser: http://localhost:5173/cifdashboard/
2. Press `F12` or right-click → "Inspect" to open DevTools
3. Go to the **Console** tab

### Step 2: Check Console Logs

You should see logs in this order when navigating to a collection page:

```
[useCollection] Starting fetch for carousel_items
[useCollection] No cache, fetching from repository for carousel_items
[FirebaseRepo] Fetching all from collection: carousel_items
[FirebaseRepo] Found X documents in carousel_items
[FirebaseRepo] Mapped results: [...]
[useCollection] Fetch successful for carousel_items, got X items: [...]
[useCollection] Setting loading to false for carousel_items
```

### Step 3: Check for Errors

Look for any **red error messages** in the console. Common issues:

#### Error: "Firebase: Error (auth/...)"
**Problem**: Authentication issue  
**Solution**: Make sure you're logged in with Google

#### Error: "Missing or insufficient permissions"
**Problem**: Firestore security rules blocking access  
**Solution**: Check Firebase console → Firestore → Rules

#### Error: "Cannot read properties of null"
**Problem**: Data is null when it shouldn't be  
**Solution**: Check if Firebase collections exist and have data

#### No logs at all
**Problem**: Component not mounting or repository not being called  
**Solution**: Check React DevTools to see if component is rendering

### Step 4: Check Network Tab

1. Go to **Network** tab in DevTools
2. Filter by "Fetch/XHR"
3. Navigate to a collection page
4. Look for requests to `firestore.googleapis.com`

**What to check**:
- ✅ Request should return `200 OK`
- ✅ Response should contain documents
- ❌ If `403 Forbidden` → Permission issue
- ❌ If `401 Unauthorized` → Auth issue

### Step 5: Check React DevTools

1. Install React DevTools extension if not installed
2. Open DevTools → **Components** tab
3. Find `CollectionPage` component
4. Check props and state:
   - `data` should be an array (not null after loading)
   - `loading` should be false after fetch
   - `error` should be null

### Step 6: Check Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: "guardiancare-a210f"
3. Go to **Firestore Database**
4. Check if collections exist:
   - carousel_items
   - home_images
   - forum
   - learn
   - quizes
   - videos

**What to check**:
- ✅ Collections should exist
- ✅ Collections should have documents
- ❌ If empty → No data to display (expected behavior)

## Common Issues and Solutions

### Issue 1: "Loading..." Never Stops

**Symptoms**:
- Page shows loading spinner forever
- No console logs appear

**Possible Causes**:
1. Repository not being created
2. useCollection hook not being called
3. Firebase not initialized

**Debug Steps**:
```javascript
// Add to CarouselItemsPage.tsx temporarily
console.log('Repository:', carouselRepository);
console.log('Repository type:', typeof carouselRepository);
console.log('Repository getAll:', typeof carouselRepository?.getAll);
```

### Issue 2: Empty Table (No Loading, No Error)

**Symptoms**:
- No loading spinner
- No error message
- Just empty table or "No data" message

**Possible Causes**:
1. Data is empty array `[]`
2. Firebase collections are empty
3. Data is being filtered out

**Debug Steps**:
```javascript
// Check in browser console
console.log('Data:', data);
console.log('Data length:', data?.length);
console.log('Loading:', loading);
console.log('Error:', error);
```

### Issue 3: Console Shows Data But Table is Empty

**Symptoms**:
- Console logs show data fetched successfully
- Table shows "No data" or is empty

**Possible Causes**:
1. Data not being passed to table correctly
2. Field visibility filtering out all fields
3. Search/filter hiding all rows

**Debug Steps**:
1. Check `CollectionTableWithSearch` props
2. Check `filteredData` in `useCollectionSearch`
3. Check `visibleFields` in `useFieldVisibility`

### Issue 4: Firebase Permission Denied

**Symptoms**:
- Console error: "Missing or insufficient permissions"
- Network tab shows 403 Forbidden

**Solution**:
Update Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Verification Checklist

Run through this checklist:

- [ ] Dev server is running (`npm run dev`)
- [ ] Browser is at http://localhost:5173/cifdashboard/
- [ ] User is logged in (not on /login page)
- [ ] Console tab is open in DevTools
- [ ] No red errors in console
- [ ] Firebase collections exist and have data
- [ ] Firestore security rules allow authenticated access
- [ ] Network requests to Firestore return 200 OK
- [ ] Console logs show data being fetched
- [ ] React DevTools shows data in component state

## Expected Console Output

### Successful Load

```
[useCollection] Starting fetch for carousel_items
[useCollection] No cache, fetching from repository for carousel_items
[FirebaseRepo] Fetching all from collection: carousel_items
[FirebaseRepo] Found 5 documents in carousel_items
[FirebaseRepo] Mapped results: Array(5)
  0: {id: "abc123", type: "image", imageUrl: "...", createdAt: Date, updatedAt: Date}
  1: {id: "def456", type: "video", imageUrl: "...", createdAt: Date, updatedAt: Date}
  ...
[useCollection] Fetch successful for carousel_items, got 5 items: Array(5)
[useCollection] Setting loading to false for carousel_items
```

### Empty Collection (Normal)

```
[useCollection] Starting fetch for carousel_items
[useCollection] No cache, fetching from repository for carousel_items
[FirebaseRepo] Fetching all from collection: carousel_items
[FirebaseRepo] Found 0 documents in carousel_items
[FirebaseRepo] Mapped results: []
[useCollection] Fetch successful for carousel_items, got 0 items: []
[useCollection] Setting loading to false for carousel_items
```

### Error State

```
[useCollection] Starting fetch for carousel_items
[useCollection] No cache, fetching from repository for carousel_items
[FirebaseRepo] Fetching all from collection: carousel_items
Error fetching all from carousel_items: FirebaseError: Missing or insufficient permissions
[useCollection] Error fetching collection data for carousel_items: DashboardError {...}
[useCollection] Setting loading to false for carousel_items
```

## Next Steps

1. **Follow the debugging steps above**
2. **Check the console output**
3. **Compare with expected output**
4. **Report what you see**:
   - What logs appear?
   - Any errors?
   - What does the Network tab show?
   - What does React DevTools show?

This information will help identify the exact issue.

