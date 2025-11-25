# Quick Test Guide - Data Loading Fix

**Date**: November 25, 2025

---

## How to Test

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Open Browser Console
Press `F12` or right-click → Inspect → Console tab

### Step 3: Login
Navigate to the app and login with Google

### Step 4: Navigate to Any Collection
Click on any collection in the sidebar:
- Videos
- Quizzes
- Learn
- Forum
- Carousel Items
- Home Images

### Step 5: Check Console Logs
You should see:
```
[useCollection] Waiting for auth to complete for videos
[useCollection] Auth ready, setting up data fetch for videos
[useCollection] Setting up real-time subscription for videos
[FirebaseRepo] Setting up real-time listener for: videos
[FirebaseRepo] Real-time update for videos: X documents
[useCollection] Real-time update for videos, got X items
```

### Step 6: Verify Data Shows
- Table should show your data
- Header should show correct item count
- No "No Items Found" message (unless collection is actually empty)

### Step 7: Test Real-Time Updates
1. Keep the app open
2. Open Firebase Console in another tab
3. Add/edit/delete an item
4. Watch the app update automatically (no refresh needed!)

---

## Expected Results

✅ **Data loads automatically**  
✅ **No authentication errors**  
✅ **Real-time updates work**  
✅ **Console shows proper logs**  
✅ **No errors in console**

---

## If Something's Wrong

### Data Not Loading?
Check console for:
- Authentication errors
- Firebase permission errors
- Network errors

### Still Shows "No Items Found"?
1. Check if collection actually has data in Firebase Console
2. Check Firestore security rules
3. Check if user is authenticated

### Console Errors?
Share the error message - it will help diagnose the issue.

---

## Clean Up (Optional)

Once everything works, you can remove the debug `console.log` statements from:
- `src/features/collections/hooks/useCollection.ts`
- `src/features/collections/data/repositories/FirebaseCollectionRepository.ts`

But keep them for now to help with debugging!
