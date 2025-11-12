# Settings Feature

## Overview
Added a dedicated Settings screen accessible via a cog icon (⚙️) in the top-right corner of the app bar, providing a centralized location for app configuration and dangerous operations like clearing all data.

## What Changed

### Before
- "Clear All Data" button was directly in toolbar (desktop) and bottom navigation (mobile)
- No centralized settings location
- Important actions mixed with regular navigation

### After
- Settings icon (⚙️) in top-right corner (both mobile & desktop)
- Clean Settings dialog with organized sections
- "Clear All Data" moved to a "Danger Zone" section
- Additional app information and sync status

## Access Points

### Desktop
```
AppBar: [Logo] Expense Manager [Sync] [Import] [Export] [⚙️ Settings]
                                                             ↑
                                                    Click to open Settings
```

### Mobile
```
AppBar: [Logo] Expense Manager                    [⚙️]
                                                    ↑
                                            Tap to open Settings
```

## Settings Dialog Structure

### 1. **Cloud Sync Status Section**
Shows current connection status:

**When Connected:**
```
┌─────────────────────────────┐
│ Cloud Sync Status           │
│ ☁️ Connected to DynamoDB   │
└─────────────────────────────┘
```

**When Not Connected:**
```
┌─────────────────────────────┐
│ Cloud Sync Status           │
│ ☁️ Cloud sync not configured│
└─────────────────────────────┘
```

### 2. **Danger Zone Section** (only if cloud sync enabled)
```
┌─────────────────────────────┐
│ ⚠️ Danger Zone               │
│                             │
│ Permanently delete all data │
│ from DynamoDB. This action  │
│ cannot be undone.           │
│                             │
│ [Clear All Data from        │
│  DynamoDB]                  │
└─────────────────────────────┘
```

**Visual Design:**
- Red background (error.main)
- White text
- Warning icon (⚠️)
- Full-width red button
- Clear, strong warning message

### 3. **About Section**
```
┌─────────────────────────────┐
│ About                       │
│                             │
│ Expense Manager - Track     │
│ your event expenses and     │
│ payments                    │
│                             │
│ Version 1.0.0               │
└─────────────────────────────┘
```

## User Flow

### Opening Settings
1. Click/tap ⚙️ icon in AppBar
2. Settings dialog opens
3. View sync status, app info, and danger zone

### Clearing All Data (from Settings)
1. Open Settings (⚙️ icon)
2. Scroll to "Danger Zone" section (red background)
3. Click "Clear All Data from DynamoDB" button
4. Settings dialog closes
5. Confirmation dialog opens (type "DELETE ALL")
6. Confirm or Cancel

## Features

### Settings Icon Button
✅ **Always Visible** - In top-right on both mobile & desktop  
✅ **Consistent Position** - Same location across all devices  
✅ **Clear Icon** - Universal settings cog icon (⚙️)  
✅ **Tooltip** - "Settings" on hover (desktop)  

### Settings Dialog
✅ **Organized Sections** - Clear visual hierarchy  
✅ **Cloud Sync Status** - See connection state at a glance  
✅ **Danger Zone** - Clearly marked destructive actions  
✅ **App Info** - Version and description  
✅ **Responsive** - Adapts to mobile screens  
✅ **Safe** - "Clear All" still requires confirmation  

### Visual Design

**Layout:**
- Maximum width: sm (600px)
- Full width on mobile
- Responsive margins and padding
- Sections separated with background colors

**Colors:**
- **Status Section**: background.default (subtle gray)
- **Danger Zone**: error.main (red) with white text
- **About Section**: background.default (subtle gray)

**Typography:**
- Subtitle2 for section headers
- Body2 for content
- Caption for version info

## Code Changes

### App.tsx

1. **New Import:**
   - `SettingsIcon` from '@mui/icons-material'

2. **New State:**
   - `const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);`

3. **AppBar Changes:**
   - **Desktop**: Added Settings icon button (replaced direct Clear All button)
   - **Mobile**: Added Settings icon button in top-right

4. **Removed:**
   - "Clear All Data" icon button from desktop toolbar
   - "Clear All" from mobile bottom navigation

5. **Added:**
   - Complete Settings Dialog component with three sections
   - Cloud Sync Status display
   - Danger Zone with Clear All Data button
   - About section with app info

## Benefits

✅ **Better Organization** - Settings in one place  
✅ **Cleaner UI** - Less clutter in toolbar/navigation  
✅ **Safer UX** - Destructive actions in dedicated area  
✅ **Scalable** - Easy to add more settings in future  
✅ **Professional** - Standard settings pattern  
✅ **Discoverable** - Settings icon is universally recognized  
✅ **Mobile Friendly** - Accessible on all devices  

## Safety Features

### Multi-Layer Protection
1. **Hidden by default** - Behind Settings dialog
2. **Visual warning** - Red danger zone section
3. **Clear messaging** - Explicit warning about irreversibility
4. **Secondary confirmation** - Must type "DELETE ALL"
5. **Conditional display** - Only shows if cloud sync enabled

### User Journey to Delete Data
```
Click Settings Icon
    ↓
Settings Dialog Opens
    ↓
See Danger Zone (red section)
    ↓
Read Warning Message
    ↓
Click "Clear All Data" Button
    ↓
Settings Dialog Closes
    ↓
Confirmation Dialog Opens
    ↓
Type "DELETE ALL"
    ↓
Click Confirm
    ↓
Data Deleted
```

## Accessibility

✅ **Keyboard Navigation** - Can be opened with keyboard  
✅ **Screen Readers** - Proper ARIA labels  
✅ **Focus Management** - Maintains focus correctly  
✅ **Clear Labels** - Descriptive button text  
✅ **Color Contrast** - Red text on red background uses white  

## Mobile Responsiveness

**Settings Icon:**
- Same size on mobile and desktop
- Positioned in top-right corner
- Touch-friendly tap target

**Settings Dialog:**
- Responsive margins: `m: { xs: 1, sm: 2 }`
- Max height constrained for small screens
- Full-width button for easier tapping
- Readable text sizes on mobile

## Future Enhancements (Optional)

1. **More Settings:**
   - Theme toggle (light/dark mode)
   - Language selection
   - Currency selection
   - Date format preferences
   - Export format options

2. **Account Settings:**
   - AWS Cognito configuration
   - DynamoDB table selection
   - Region settings

3. **Data Management:**
   - Import data option
   - Backup scheduling
   - Auto-sync toggle
   - Data export history

4. **Display Settings:**
   - Default view (events/list)
   - Cards vs. list view
   - Compact mode
   - Font size adjustment

5. **Notifications:**
   - Due date reminders
   - Budget threshold alerts
   - Sync status notifications

## Testing Checklist

✅ Build compiles without errors  
✅ No TypeScript/linting errors  
✅ Settings icon appears in top-right (both mobile & desktop)  
✅ Click opens Settings dialog  
✅ Cloud Sync Status shows correct state  
✅ Danger Zone visible when cloud sync enabled  
✅ Danger Zone hidden when cloud sync disabled  
✅ "Clear All Data" button works  
✅ Opens confirmation dialog correctly  
✅ About section displays version  
✅ Close button works  
✅ Dialog is mobile responsive  
✅ Settings removed from bottom navigation  
✅ Desktop toolbar "Clear All" removed  

## Summary

The Settings feature provides a professional, organized way to access app configuration and dangerous operations. The universal cog icon (⚙️) is easily recognizable, and the dialog structure makes it simple to add more settings in the future. The "Danger Zone" concept clearly separates destructive actions from regular settings, improving safety and user experience.

