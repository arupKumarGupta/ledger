# 🗑️ Clear All Data Feature

## Overview

Added a "Clear All Data" button that allows users to permanently delete all data from DynamoDB. This feature includes strong safety measures to prevent accidental deletion.

---

## ✅ What Was Added

### 1. New Function in `dynamodb.ts`
```typescript
clearAllCloudData(): Promise<SyncResult>
```
- Deletes the entire `expense-data` item from DynamoDB
- Returns success/failure status
- Logs warning when executed

### 2. UI Button (Desktop Only)
- **Location**: Top toolbar (right side)
- **Icon**: 🗑️ DeleteForever icon
- **Visibility**: Only shown when cloud sync is enabled
- **Tooltip**: "Clear All Data from DynamoDB"

### 3. Confirmation Dialog
Strong safety measures:
- ⚠️ **Red error-themed header**
- **Warning message** explaining consequences
- **List of what will be deleted**:
  - All events
  - All expense heads
  - All expense entries
  - All payment history
- **Required confirmation**: User must type "DELETE ALL"
- **Disabled button** until confirmation text matches exactly
- **Export reminder** to backup data first

---

## 🎨 UI Location

### Desktop
```
┌─────────────────────────────────────────────────────┐
│  Expense Manager  [☁️] [📥] [📤] [🗑️]              │
│                    Sync Import Export Clear         │
└─────────────────────────────────────────────────────┘
```

### Mobile
- Not shown on mobile (for safety - less screen space = easier accidents)
- Users can use desktop view if needed

---

## 🔒 Safety Features

### 1. Confirmation Required
User must type exactly "DELETE ALL" (case-sensitive)

### 2. Multiple Warnings
- Red error theme
- "IRREVERSIBLE" warning
- List of what will be deleted
- Reminder to export first

### 3. Visual Feedback
- Button disabled until correct text entered
- Shows "Clearing..." during operation
- Error validation on text field
- Success/error snackbar after operation

### 4. Guard Clauses
```typescript
// Check confirmation text
if (confirmText !== 'DELETE ALL') {
  showSnackbar('Please type "DELETE ALL" to confirm', 'error');
  return;
}

// Check cloud sync enabled
if (!cloudSyncEnabled) {
  showSnackbar('Cloud sync not enabled', 'error');
  return;
}
```

---

## 💻 Code Changes

### Files Modified
1. **`src/services/dynamodb.ts`** (+40 lines)
   - Added `clearAllCloudData()` function
   - Uses DynamoDB `DeleteCommand`

2. **`src/App.tsx`** (+100 lines)
   - Added state for dialog
   - Added confirmation handler
   - Added toolbar button
   - Added confirmation dialog component
   - Imported missing MUI components

### New Imports
- `DeleteForeverIcon` from MUI icons
- `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
- `Button`, `TextField`

---

## 📋 How to Use

### Step 1: Click Button
- Find the 🗑️ icon in the top toolbar (desktop only)
- Only visible when cloud sync is enabled

### Step 2: Read Warnings
- Dialog opens with red header
- Read all warnings carefully
- Note: **THIS IS IRREVERSIBLE!**

### Step 3: Export Data (Recommended)
- Click "Export Data" first (📤 icon)
- Save JSON file as backup
- Then return to clear data dialog

### Step 4: Confirm
- Type exactly: `DELETE ALL`
- Must match exactly (case-sensitive)
- Button enables when text is correct

### Step 5: Execute
- Click "Clear All Data" button
- Wait for "Clearing..." to complete
- Success message appears
- Local state cleared
- DynamoDB item deleted

---

## 🔄 What Happens

### On Success
1. ✅ DynamoDB item deleted from table
2. ✅ Local React state cleared
3. ✅ UI shows empty state
4. ✅ Success message: "All data cleared from DynamoDB"

### On Failure
1. ❌ Error message with details
2. ❌ Data remains unchanged
3. ❌ User can try again or cancel

### After Clearing
- App shows empty state (no events/expenses)
- Can start fresh or import previous backup
- Next save will create new DynamoDB item

---

## 🛡️ Security Considerations

### Why It's Safe
1. **Confirmation required** - Can't accidentally click
2. **Exact text match** - Must type "DELETE ALL"
3. **Cloud sync check** - Only works if DynamoDB configured
4. **Disabled during sync** - Prevents race conditions
5. **Desktop only** - Reduces accidental mobile taps

### Why It's Needed
1. **Testing** - Clear data between tests
2. **Fresh start** - Start over without old data
3. **Privacy** - Remove all data if needed
4. **Debugging** - Clear corrupted data

### Backup Strategy
**ALWAYS export before clearing:**
```bash
1. Click Export (📤)
2. Save JSON file
3. Then use Clear All Data
4. Can re-import if needed
```

---

## 🧪 Testing

### Test Cases
- [ ] Button only shows when cloud sync enabled
- [ ] Button hidden when cloud sync disabled
- [ ] Dialog opens on button click
- [ ] Confirmation text validation works
- [ ] Button disabled until correct text
- [ ] Clear operation succeeds
- [ ] Local state cleared
- [ ] DynamoDB item deleted
- [ ] Success message shown
- [ ] Can import data after clearing

### Edge Cases
- [ ] Typo in confirmation text (rejected)
- [ ] Cancel dialog (no action)
- [ ] Network error (shows error)
- [ ] DynamoDB not configured (shows error)
- [ ] Syncing in progress (button disabled)

---

## 📝 Code Example

### Calling the Function Directly
```typescript
import { clearAllCloudData } from './services/dynamodb';

const result = await clearAllCloudData();
if (result.success) {
  console.log('Data cleared!');
} else {
  console.error('Failed:', result.error);
}
```

### Dialog Confirmation
```typescript
const [confirmText, setConfirmText] = useState('');

const handleClear = async () => {
  if (confirmText !== 'DELETE ALL') {
    alert('Please type DELETE ALL');
    return;
  }
  
  const result = await clearAllCloudData();
  // Handle result...
};
```

---

## ⚠️ Important Notes

### IRREVERSIBLE Operation
- **Cannot be undone**
- DynamoDB item is permanently deleted
- No recovery possible without backup
- **ALWAYS export before clearing**

### Not Available On Mobile
- Hidden on mobile for safety
- Use desktop view if needed
- Prevents accidental taps

### Cloud Sync Required
- Button only shows if cloud sync enabled
- No effect on localStorage (we don't use it)
- Only affects DynamoDB data

---

## 🚀 Deployment

```bash
# Build succeeded!
yarn build

# Commit and push
git add .
git commit -m "feat: Add clear all data button with confirmation"
git push origin main
```

---

## ✅ Summary

**Added**: Clear All Data button with strong confirmation
**Location**: Desktop toolbar (when cloud sync enabled)  
**Safety**: Requires typing "DELETE ALL" to confirm
**Effect**: Deletes all data from DynamoDB permanently
**Status**: ✅ Built and ready to deploy

**Use with caution!** 🗑️⚠️

---

**Date**: November 12, 2025  
**Feature**: Clear All Data from DynamoDB

