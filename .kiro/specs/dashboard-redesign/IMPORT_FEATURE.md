# CSV/JSON Import Feature

## Overview

Added comprehensive import functionality to all collection pages with validation, preview, and confirmation before submission.

## Features Implemented

### 1. Import Service
**Location**: `src/features/collections/domain/services/ImportService.ts`

**Capabilities**:
- ✅ Parse CSV files (handles quoted values, commas in text)
- ✅ Parse JSON files (arrays or single objects)
- ✅ Validate required fields
- ✅ Detect optional fields
- ✅ Identify unknown fields (warnings)
- ✅ Row-by-row error tracking
- ✅ File reading with error handling

**Methods**:
- `parseCSV()` - Parse CSV content to array of objects
- `parseJSON()` - Parse JSON content to array of objects
- `validate()` - Validate data against field requirements
- `processImport()` - Complete import workflow

### 2. Import Modal Component
**Location**: `src/features/collections/components/ImportModal.tsx`

**Features**:
- ✅ File upload (CSV/JSON)
- ✅ Two-step process (Upload → Preview)
- ✅ Validation summary (Valid/Errors/Warnings)
- ✅ Error list with row numbers
- ✅ Warning list for unknown fields
- ✅ Data preview (first 5 rows)
- ✅ Confirmation before import
- ✅ Progress indication
- ✅ Dark mode support

**UI Flow**:
1. **Upload Step**: Drag/drop or select file
2. **Preview Step**: Review validation results and data
3. **Confirmation**: Import button with count
4. **Completion**: Success/error toasts

### 3. Updated CollectionPage
**Location**: `src/features/collections/pages/CollectionPage.tsx`

**Changes**:
- Added Import button in header
- Added ImportModal component
- Added handleImport function
- Extracts required/optional fields from formFields
- Batch import with error handling
- Success/error notifications

## Usage

### For Users

#### Importing Data
1. Click "Import" button on any collection page
2. Select CSV or JSON file
3. Review validation results:
   - ✅ Green: Valid rows that will be imported
   - ❌ Red: Errors that prevent import
   - ⚠️ Yellow: Warnings (non-critical)
4. Check data preview (first 5 rows)
5. Click "Import X Items" to confirm
6. Wait for completion notification

#### CSV Format Example
```csv
title,category,thumbnailUrl,videoUrl
"Video 1","Education","https://example.com/thumb1.jpg","https://example.com/video1.mp4"
"Video 2","Entertainment","https://example.com/thumb2.jpg","https://example.com/video2.mp4"
```

#### JSON Format Example
```json
[
  {
    "title": "Video 1",
    "category": "Education",
    "thumbnailUrl": "https://example.com/thumb1.jpg",
    "videoUrl": "https://example.com/video1.mp4"
  },
  {
    "title": "Video 2",
    "category": "Entertainment",
    "thumbnailUrl": "https://example.com/thumb2.jpg",
    "videoUrl": "https://example.com/video2.mp4"
  }
]
```

### Validation Rules

**Required Fields**:
- Must be present in every row
- Cannot be empty
- Errors prevent import of that row

**Optional Fields**:
- Can be omitted
- Can be empty
- No errors if missing

**Unknown Fields**:
- Fields not in schema
- Generate warnings
- Are ignored during import

## Error Handling

### File Errors
- Invalid file type → Alert message
- Empty file → Error in preview
- Malformed CSV/JSON → Parse error

### Validation Errors
- Missing required field → Row-specific error
- Empty required field → Row-specific error
- Unknown field → Warning (non-blocking)

### Import Errors
- Individual row failures → Counted separately
- Partial success → Shows both success and error counts
- Complete failure → Error toast

## Benefits

1. **Bulk Operations**: Import hundreds of items at once
2. **Data Migration**: Easy migration from other systems
3. **Validation**: Catch errors before import
4. **Preview**: See exactly what will be imported
5. **Safety**: Confirmation step prevents accidents
6. **Flexibility**: Supports both CSV and JSON
7. **User-Friendly**: Clear error messages and guidance

## Technical Details

### CSV Parsing
- Handles quoted values with commas
- Trims whitespace
- Supports empty lines
- Header row detection

### JSON Parsing
- Accepts arrays
- Accepts single objects (auto-wrapped)
- Validates JSON syntax
- Type checking

### Validation
- Field-by-field checking
- Row number tracking
- Error accumulation
- Warning collection

### Import Process
```
1. User selects file
2. File is read
3. Content is parsed (CSV/JSON)
4. Data is validated
5. Results shown in preview
6. User confirms
7. Items imported one by one
8. Success/error counts displayed
```

## Testing

### Manual Testing Checklist
- [ ] Import valid CSV file
- [ ] Import valid JSON file
- [ ] Import file with missing required fields
- [ ] Import file with unknown fields
- [ ] Import empty file
- [ ] Import malformed CSV
- [ ] Import malformed JSON
- [ ] Cancel import at preview
- [ ] Import with partial errors
- [ ] Check error messages are clear
- [ ] Verify data preview is accurate
- [ ] Test with large files (100+ rows)

### Test Files

**Valid CSV**:
```csv
title,category
"Test Video 1","Education"
"Test Video 2","Entertainment"
```

**Invalid CSV** (missing required field):
```csv
title,category
"Test Video 1","Education"
"Test Video 2",
```

**Valid JSON**:
```json
[
  {"title": "Test 1", "category": "Education"},
  {"title": "Test 2", "category": "Entertainment"}
]
```

## Future Enhancements

1. **Drag & Drop**: Drag files directly onto modal
2. **Template Download**: Download CSV/JSON template
3. **Field Mapping**: Map CSV columns to fields
4. **Duplicate Detection**: Check for existing items
5. **Update Mode**: Update existing items instead of create
6. **Batch Size**: Import in batches for large files
7. **Progress Bar**: Show import progress
8. **Undo**: Ability to undo import
9. **Import History**: Track past imports
10. **Scheduled Imports**: Automatic imports

## Files Created
- `src/features/collections/domain/services/ImportService.ts`
- `src/features/collections/components/ImportModal.tsx`

## Files Modified
- `src/features/collections/pages/CollectionPage.tsx`

## Availability

The import feature is now available on ALL collection pages:
- ✅ Videos
- ✅ Carousel Items
- ✅ Home Images
- ✅ Forum
- ✅ Learn
- ✅ Quizzes

Each page automatically gets the import functionality with validation based on its specific field requirements.
