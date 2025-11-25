# DataTable Component

A powerful, flexible table component with smart content handling and responsive design.

## Features

### Smart Cell Rendering
- **Automatic URL Detection** - URLs become clickable links with copy buttons
- **Email Detection** - Email addresses become mailto links
- **Text Truncation** - Long text shows expand/collapse controls
- **Type-Aware Rendering** - Booleans, arrays, objects rendered appropriately
- **No Horizontal Scrolling** - Content wraps intelligently

### Core Features
- Sorting (ascending/descending)
- Pagination with customizable page sizes
- Row selection (single or multiple)
- Custom cell renderers
- Loading states
- Empty states
- Dark mode support
- Responsive design

## Usage

### Basic Example
```tsx
import { DataTable } from '@/core/components/DataTable';

const columns = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
  },
  {
    id: 'url',
    header: 'Website',
    accessorKey: 'url',
    sortable: true,
    maxWidth: '400px', // URLs get more space
  },
];

<DataTable
  data={items}
  columns={columns}
  loading={false}
  pagination={{ enabled: true, pageSize: 10 }}
/>
```

### With Selection
```tsx
<DataTable
  data={items}
  columns={columns}
  selection={{
    enabled: true,
    multiple: true,
    onSelectionChange: (selected) => console.log(selected),
  }}
/>
```

### Custom Cell Renderer
```tsx
const columns = [
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    cell: ({ value }) => (
      <span className={value === 'active' ? 'text-green-600' : 'text-red-600'}>
        {value}
      </span>
    ),
  },
];
```

### Column Width Control
```tsx
const columns = [
  {
    id: 'id',
    header: 'ID',
    accessorKey: 'id',
    width: '80px',        // Fixed width
    minWidth: '60px',     // Minimum width
    maxWidth: '100px',    // Maximum width
  },
];
```

## Smart Content Handling

### URLs
```tsx
// Input: { url: "https://example.com/very/long/path" }
// Output: Clickable link with copy button, wrapped to 2 lines
```

### Long Text
```tsx
// Input: { description: "Very long description..." }
// Output: Truncated with "Show more" button
```

### Booleans
```tsx
// Input: { active: true }
// Output: ✓ Yes (green)

// Input: { active: false }
// Output: ✗ No (gray)
```

### Arrays
```tsx
// Input: { tags: ["react", "typescript", "tailwind"] }
// Output: "react, typescript, tailwind"
```

### Objects
```tsx
// Input: { metadata: { key: "value" } }
// Output: Formatted JSON with truncation
```

## Props

### DataTableProps<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | T[] | required | Array of data objects |
| columns | ColumnDef<T>[] | required | Column definitions |
| loading | boolean | false | Show loading spinner |
| pagination | PaginationConfig | undefined | Pagination settings |
| selection | SelectionConfig | undefined | Row selection settings |
| onRowClick | (row: T) => void | undefined | Row click handler |
| className | string | undefined | Additional CSS classes |
| emptyMessage | string | "No data available" | Empty state message |
| getRowId | (row: T) => string | row.id | Get unique row ID |

### ColumnDef<T>

| Prop | Type | Description |
|------|------|-------------|
| id | string | Unique column identifier |
| header | string \| () => ReactNode | Column header |
| accessorKey | keyof T | Data property key |
| accessorFn | (row: T) => any | Custom accessor function |
| cell | (info) => ReactNode | Custom cell renderer |
| sortable | boolean | Enable sorting |
| width | string | Fixed column width |
| minWidth | string | Minimum column width |
| maxWidth | string | Maximum column width |

## Best Practices

### Column Widths
- **ID columns**: 80-100px
- **Name columns**: 150-250px
- **URL columns**: 200-400px
- **Description columns**: 300-500px
- **Action columns**: auto

### Performance
- Use `memo` for custom cell renderers
- Provide `getRowId` for stable row keys
- Keep data transformations in `useMemo`

### Accessibility
- Provide meaningful column headers
- Use semantic HTML
- Support keyboard navigation
- Include ARIA labels

## Styling

The component uses Tailwind CSS and supports dark mode out of the box.

### Custom Styling
```tsx
<DataTable
  className="custom-table"
  // ... other props
/>
```

### Theme Customization
The component respects your Tailwind theme configuration for colors, spacing, and typography.

## Examples

See the following pages for real-world usage:
- `src/features/collections/pages/VideosPage.tsx`
- `src/features/collections/pages/QuizesPage.tsx`
- `src/features/collections/pages/LearnPage.tsx`
