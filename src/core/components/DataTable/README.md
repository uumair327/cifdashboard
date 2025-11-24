# DataTable Component

A feature-rich, accessible data table component with sorting, pagination, and selection capabilities.

## Features

- ✅ **Column Configuration**: Flexible column definitions with custom renderers
- ✅ **Sorting**: Click column headers to sort (ascending/descending/unsorted)
- ✅ **Pagination**: Configurable page sizes with navigation controls
- ✅ **Row Selection**: Single or multi-select with checkboxes
- ✅ **Responsive Design**: Mobile and desktop layouts
- ✅ **Loading States**: Built-in loading spinner
- ✅ **Empty States**: Customizable empty message
- ✅ **Dark Mode**: Full dark mode support
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## Usage

```typescript
import { DataTable, ColumnDef } from '@/core/components/DataTable';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    sortable: true,
  },
  {
    id: 'role',
    header: 'Role',
    accessorKey: 'role',
    cell: ({ value }) => (
      <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
        {value}
      </span>
    ),
  },
];

function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  return (
    <DataTable
      data={users}
      columns={columns}
      loading={false}
      pagination={{
        enabled: true,
        pageSize: 10,
        pageSizeOptions: [10, 25, 50, 100],
      }}
      selection={{
        enabled: true,
        multiple: true,
        onSelectionChange: setSelectedUsers,
      }}
      onRowClick={(user) => console.log('Clicked:', user)}
      getRowId={(user) => user.id}
    />
  );
}
```

## Props

### DataTableProps<T>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | required | Array of data to display |
| `columns` | `ColumnDef<T>[]` | required | Column definitions |
| `loading` | `boolean` | `false` | Show loading spinner |
| `pagination` | `PaginationConfig` | `undefined` | Pagination configuration |
| `selection` | `SelectionConfig` | `undefined` | Selection configuration |
| `onRowClick` | `(row: T) => void` | `undefined` | Row click handler |
| `className` | `string` | `undefined` | Additional CSS classes |
| `emptyMessage` | `string` | `'No data available'` | Message when data is empty |
| `getRowId` | `(row: T) => string` | `row => row.id` | Function to get unique row ID |

### ColumnDef<T>

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique column identifier |
| `header` | `string \| () => ReactNode` | Column header content |
| `accessorKey` | `keyof T` | Key to access data from row |
| `accessorFn` | `(row: T) => any` | Function to compute cell value |
| `cell` | `(info) => ReactNode` | Custom cell renderer |
| `sortable` | `boolean` | Enable sorting for this column |
| `width` | `string \| number` | Column width |
| `minWidth` | `string \| number` | Minimum column width |
| `maxWidth` | `string \| number` | Maximum column width |

### PaginationConfig

| Prop | Type | Description |
|------|------|-------------|
| `enabled` | `boolean` | Enable pagination |
| `pageSize` | `number` | Initial page size |
| `pageSizeOptions` | `number[]` | Available page size options |
| `onPageChange` | `(pageIndex: number) => void` | Page change callback |
| `onPageSizeChange` | `(pageSize: number) => void` | Page size change callback |

### SelectionConfig

| Prop | Type | Description |
|------|------|-------------|
| `enabled` | `boolean` | Enable row selection |
| `multiple` | `boolean` | Allow multiple selection |
| `onSelectionChange` | `(rows: T[]) => void` | Selection change callback |

## Virtual Scrolling

For very large datasets (>1000 rows), consider implementing virtual scrolling using `@tanstack/react-virtual`:

```bash
npm install @tanstack/react-virtual
```

Then wrap the table body with the virtual scroller. See the TanStack Virtual documentation for implementation details.

## Testing

The DataTable component has comprehensive property-based tests:

- **Property 9**: Pagination boundary correctness
- **Property 10**: Sort order correctness
- **Property 11**: Bulk selection state consistency

Run tests with:
```bash
npm test -- DataTable.properties.test.ts
```

## Accessibility

- Semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>`)
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader announcements for state changes
- Focus management for modals and dropdowns
- High contrast mode support

## Performance

- Memoized sorting and pagination
- Efficient re-renders with React.memo
- Debounced search (when integrated with SearchBar)
- Lazy loading support (via pagination)
- Virtual scrolling ready (for large datasets)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
