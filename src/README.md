# Source Code Structure

This directory contains the source code for the CIF Guardian Care Dashboard, organized using Clean Architecture principles with a feature-based structure.

## Quick Start

### Running the Application
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Running Tests
```bash
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

## Directory Overview

### `/core` - Shared Infrastructure
Reusable components, hooks, utilities, and types used across features.

**Key Files**:
- `core/types/index.ts` - Common TypeScript types
- `core/utils/index.ts` - Utility functions (debounce, throttle, classNames)
- `core/components/` - Reusable UI components (DataTable, SearchBar, Modal, Toast)

### `/features` - Feature Modules
Self-contained feature modules organized by business capability.

#### `/features/collections` - Collection Management
Manages CRUD operations for all collection types (carousel_items, videos, etc.)

**Structure**:
- `domain/` - Business logic (entities, services, interfaces)
- `data/` - Data access (repositories, mappers)
- `components/` - UI components
- `hooks/` - React hooks
- `pages/` - Page components

#### `/features/auth` - Authentication
User authentication and authorization.

#### `/features/dashboard` - Dashboard Layout
Main dashboard layout and navigation.

### `/test` - Test Configuration
Global test setup and utilities.

## Import Paths

Use path aliases for clean imports:

```typescript
// Core imports
import { DataTable } from '@/core/components/DataTable';
import { debounce } from '@/core/utils';
import { BaseEntity } from '@/core/types';

// Feature imports
import { CollectionService } from '@/features/collections/domain/services/CollectionService';
import { useCollection } from '@/features/collections/hooks/useCollection';
```

## Architecture Principles

1. **Dependency Rule**: Dependencies point inward (Presentation → Domain → Data)
2. **Domain Independence**: Business logic has no framework dependencies
3. **Feature Isolation**: Features are self-contained and independent
4. **Type Safety**: Everything is strongly typed with TypeScript
5. **Testability**: Each layer can be tested in isolation

## Adding New Code

### Adding a Component
```typescript
// src/core/components/MyComponent/MyComponent.tsx
export function MyComponent() {
  return <div>My Component</div>;
}

// src/core/components/MyComponent/index.ts
export { MyComponent } from './MyComponent';
```

### Adding a Hook
```typescript
// src/features/collections/hooks/useMyHook.ts
export function useMyHook() {
  // Hook logic
  return { /* hook return value */ };
}
```

### Adding a Service
```typescript
// src/features/collections/domain/services/MyService.ts
export class MyService {
  constructor(private repository: IMyRepository) {}
  
  async doSomething(): Promise<void> {
    // Business logic
  }
}
```

## Testing

### Unit Test Example
```typescript
// MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
});
```

### Property-Based Test Example
```typescript
// MyService.properties.test.ts
import { describe, it } from 'vitest';
import fc from 'fast-check';
import { MyService } from './MyService';

describe('MyService Properties', () => {
  it('Property 1: Description', () => {
    /**
     * Feature: dashboard-redesign, Property 1: Description
     */
    fc.assert(
      fc.property(
        fc.array(fc.string()),
        (items) => {
          // Property test logic
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Code Style

- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript interfaces for props
- Export components as named exports
- Keep files focused and small (< 300 lines)
- Use descriptive variable names
- Add JSDoc comments for public APIs

## Performance Tips

- Use `React.memo` for expensive components
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Lazy load routes and heavy components
- Implement virtual scrolling for large lists

## Need Help?

- See `ARCHITECTURE.md` for detailed architecture documentation
- See `.kiro/specs/dashboard-redesign/` for requirements and design
- Check existing code for examples and patterns
