# Update Record Changes & View Old Records Feature

## Overview

Implemented restricted editing permissions for "Update Record" mode and added a "View Old Records" button to display historical patient records.

## Changes Implemented

### 1. Restricted Edit Mode (Update Record)

When staff clicks "Update Record" in the Records page, only specific fields are now editable:

#### ✅ Editable Fields:

- **Vital Status** (Heart Rate, Weight, Temperature, O₂ Saturation)
- **Lab Results** (Can ADD new entries only, cannot edit existing ones)

#### ❌ Read-Only Fields:

- **Immunizations** - Cannot be edited
- **Medications** - Cannot be edited
- **Visit History** - Cannot be edited

### 2. Lab Results Special Behavior

**File:** `frontend/src/components/records/LabResultsCard.jsx`

Added `addOnly` prop that allows:

- ✅ Adding new lab results
- ❌ Editing existing lab results
- ❌ Deleting existing lab results

When in `addOnly` mode:

- Existing entries are displayed as read-only pills (like in view mode)
- "+ Add New" button remains active
- New entries can be added to the list

```jsx
<LabResultsCard
  items={labs}
  editable={editMode}
  addOnly={editMode} // Shows existing as read-only, but allows adding new
  onChange={setLabs}
/>
```

### 3. View Old Records Button

**Files Modified:**

- `frontend/src/components/records/ActionPanel.jsx`
- `frontend/src/pages/Records.jsx`

Added a new "View Old Records" button positioned between "Add Report" and "Schedule Follow-up":

```
┌─────────────────────┐
│  Update Record      │
├─────────────────────┤
│  Add Report         │
├─────────────────────┤
│  View Old Records   │  ← NEW
├─────────────────────┤
│  Schedule Follow-up │ (disabled)
└─────────────────────┘
```

### 4. View Old Records Modal

**File:** `frontend/src/components/records/ViewOldRecordsModal.jsx` (NEW)

A comprehensive modal that displays all historical encounter records for the patient:

#### Features:

- **Encounters List**: Shows all past records in chronological order
- **Detailed Information**: Each record displays:
  - Author role and timestamp
  - Encounter notes
  - Vitals (if recorded)
  - Medications (if recorded)
  - Lab Results (if recorded)
  - Visit History (if recorded)
  - Immunizations (if recorded)

#### UI Components:

- Loading skeleton while fetching data
- Error banner for failed requests
- Empty state when no records exist
- Scrollable content area
- Card-based layout for each record
- Color-coded sections matching the app theme

#### Data Flow:

```javascript
// Fetches encounters from backend
GET /api/records/:patientId
// With demo headers for authentication
headers: getDemoHeaders()
```

## Technical Details

### Props Added/Modified

#### LabResultsCard

```javascript
{
  items: Array,
  editable: Boolean,
  addOnly: Boolean,  // NEW - allows adding but not editing
  onChange: Function
}
```

#### ActionPanel

```javascript
{
  canEdit: Boolean,
  editMode: Boolean,
  onEdit: Function,
  onSave: Function,
  onCancel: Function,
  onAdd: Function,
  onViewOldRecords: Function  // NEW - handler for view old records
}
```

### Edit Mode Behavior Matrix

| Component     | View Mode | Edit Mode (Update Record) | Add Report Mode |
| ------------- | --------- | ------------------------- | --------------- |
| Vital Status  | Read-only | ✅ Editable               | ✅ Editable     |
| Lab Results   | Read-only | ➕ Add Only               | ✅ Editable     |
| Medications   | Read-only | ❌ Read-only              | ✅ Editable     |
| Visit History | Read-only | ❌ Read-only              | ✅ Editable     |
| Immunizations | Read-only | ❌ Read-only              | ✅ Editable     |

### Color Scheme

Maintained existing healthcare theme:

- **View Old Records Button**: `#9db598` (lighter green)
- **Hover**: `#8da689`
- **Modal Cards**: `#f0f5ef` background with `#b9c8b4` borders
- **Record Details**: White cards with `#f9faf9` for nested details

## User Experience Flow

### Update Record Flow:

1. Staff clicks "Update Record"
2. Edit mode activates
3. Only Vital Status fields become editable inputs
4. Lab Results shows:
   - Existing entries as read-only pills
   - "+ Add New" button to add additional results
5. All other sections remain read-only
6. Click "Save Changes" to persist only vitals and new lab results
7. Click "Cancel" to discard changes

### View Old Records Flow:

1. Staff clicks "View Old Records"
2. Modal opens showing loading state
3. Displays list of all historical encounter records
4. Each record shows:
   - When it was created and by whom
   - All associated medical data
5. Staff can scroll through all records
6. Click "Close" to return to main records page

## Benefits

### 1. Data Integrity

- Prevents accidental modification of historical medications and immunizations
- Maintains audit trail of past prescriptions

### 2. Workflow Efficiency

- Quick vital updates without risk of changing other data
- Additive lab results support incremental test additions

### 3. Historical Visibility

- Easy access to complete patient history
- Comprehensive view of all past encounters
- Helps providers make informed decisions

### 4. User Safety

- Clear visual distinction between editable and read-only fields
- Confirmation required before saving
- Cancel option always available

## API Endpoints Used

```javascript
// Load current records
GET /api/records/:patientId
Headers: x-role, x-user-id, x-provider-consent

// Load patient summary
GET /api/patients/:patientId/summary
Headers: x-role, x-user-id, x-provider-consent

// Update patient summary
PATCH /api/patients/:patientId/summary
Body: { vitals, labs, ... }
Headers: x-role, x-user-id, x-provider-consent
```

## Testing Checklist

- [x] Update Record only edits Vital Status
- [x] Lab Results allows adding new entries
- [x] Lab Results prevents editing existing entries
- [x] Medications remain read-only in edit mode
- [x] Visit History remains read-only in edit mode
- [x] Immunizations remain read-only in edit mode
- [x] View Old Records button appears
- [x] View Old Records modal opens correctly
- [x] Historical records display properly
- [x] Modal handles loading states
- [x] Modal handles errors gracefully
- [x] Modal handles empty state
- [x] Close button works
- [x] No linting errors
- [x] Authentication headers sent correctly

## Future Enhancements

Potential improvements:

1. Filter old records by date range
2. Search within old records
3. Export old records as PDF
4. Print individual records
5. Compare records side-by-side
6. Show changes/differences between records
7. Add tags/categories to records
8. Archive very old records
