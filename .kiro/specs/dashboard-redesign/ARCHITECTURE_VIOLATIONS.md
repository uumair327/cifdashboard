# Clean Architecture Violations Report

## Summary
The project has **4 major violations** of Clean Architecture principles that need to be fixed.

## Violations

### 1. ❌ Pages Importing Data Layer Directly
**Severity**: HIGH  
**Files Affected**:
- `src/pages/CarouselItemsPage.tsx`
- `src/pages/HomeImagesPage.tsx`
- `src/pages/ForumPage.tsx`
- `src/pages/LearnPage.tsx`
- `src/pages/QuizesPage.tsx`
- `src/pages/VideosPage.tsx`

**Problem**:
```typescript
import { FirebaseCollectionRepository } from '../features/collections/data/repositories/FirebaseCollectionRepository';
```

**Why It's Wrong**:
- Presentation layer (pages) should NOT know about data layer implementation
- Pages should only depend on domain interfaces (ICollectionRepository)
- This creates tight coupling and makes testing difficult

**Fix Required**:
- Move repository instantiation to a factory or dependency injection container
- Pages should receive repository through props or context
- Use dependency inversion principle

---

### 2. ❌ Pages Importing Firebase Infrastructure
**Severity**: HIGH  
**Files Affected**:
- `src/pages/App.tsx`
- `src/pages/Login.tsx`

**Problem**:
```typescript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { loginWithGoogle } from "../firebaseAuth";
```

**Why It's Wrong**:
- Presentation layer should NOT import Firebase directly
- Infrastructure concerns should be abstracted behind interfaces
- Makes it impossible to swap Firebase for another backend

**Fix Required**:
- Create an `IAuthService` interface in domain layer
- Implement `FirebaseAuthService` in data layer
- Pages use the interface, not Firebase directly

---

### 3. ❌ Wrong Directory Structure
**Severity**: MEDIUM  
**Files Affected**:
- All files in `src/pages/` that are collection-specific

**Problem**:
- Collection pages are in `src/pages/` instead of `src/features/collections/pages/`
- Breaks feature-based organization
- `src/pages/` should only contain app-level pages (App.tsx, Login.tsx, Register.tsx)

**Current Structure** (WRONG):
```
src/
  pages/
    CarouselItemsPage.tsx  ❌
    HomeImagesPage.tsx     ❌
    ForumPage.tsx          ❌
    ...
  features/
    collections/
      pages/
        CollectionPage.tsx ✅
```

**Correct Structure**:
```
src/
  pages/
    App.tsx              ✅ (app-level)
    Login.tsx            ✅ (app-level)
    Register.tsx         ✅ (app-level)
  features/
    collections/
      pages/
        CollectionPage.tsx           ✅
        CarouselItemsPage.tsx        ✅
        HomeImagesPage.tsx           ✅
        ...
```

---

### 4. ❌ Duplicate Context Files
**Severity**: LOW  
**Files Affected**:
- `src/context/ToastContext.tsx` (old)
- `src/core/components/Toast/ToastProvider.tsx` (new)

**Problem**:
- Two implementations of the same functionality
- Old context still exists but is not used
- Causes confusion

**Fix Required**:
- Delete `src/context/ToastContext.tsx`
- Ensure all imports use `src/core/components/Toast/ToastProvider`

---

## What's Correct ✅

1. **Domain Layer Purity**: Domain layer has NO imports from data or presentation layers
2. **Repository Pattern**: Firebase is only imported in FirebaseCollectionRepository
3. **Interface Segregation**: ICollectionRepository interface properly defined
4. **Hooks Layer**: Hooks properly use repository interfaces
5. **Feature Organization**: Collections feature is well-organized internally

---

## Recommended Fixes Priority

### Priority 1 (Critical):
1. Create dependency injection for repositories
2. Abstract Firebase auth behind IAuthService interface

### Priority 2 (Important):
3. Move collection pages to correct feature directory
4. Remove duplicate ToastContext

### Priority 3 (Nice to have):
5. Add barrel exports (index.ts) for cleaner imports
6. Create a services factory pattern

---

## Clean Architecture Layers (Current State)

```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│   - Components ✅                   │
│   - Pages ❌ (violates dependency)  │
│   - Hooks ✅                        │
└──────────────┬──────────────────────┘
               │ depends on
               ↓
┌─────────────────────────────────────┐
│   Domain Layer                      │
│   - Entities ✅                     │
│   - Repository Interfaces ✅        │
│   - Services ✅                     │
└──────────────┬──────────────────────┘
               │ implemented by
               ↓
┌─────────────────────────────────────┐
│   Data Layer                        │
│   - Repository Implementations ✅   │
│   - Firebase Integration ✅         │
└─────────────────────────────────────┘
```

**Legend**:
- ✅ = Follows Clean Architecture
- ❌ = Violates Clean Architecture
