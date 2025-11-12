# 🔄 JSON Conversion Script

## Overview

The `convert-to-new-schema.js` script converts old expense data format (without events) to the new schema (with events hierarchy).

---

## ✅ What It Does

1. Reads old format JSON (expenseHeads + expenseEntries)
2. Creates a new Event with:
   - Auto-generated ID (or custom ID you provide)
   - Name: "Imported Event" (customizable after conversion)
   - Date range from earliest to latest expense entry
   - Summary description
3. Adds `eventId` to all expense heads
4. Saves as new format JSON ready for import

---

## 📋 Usage

### Basic Usage
```bash
node convert-to-new-schema.js <input-file> <output-file> <event-id>
```

### Example
```bash
node convert-to-new-schema.js \
  /Users/akumargupta/Downloads/expenses-2025-11-12-22-57-58.json \
  ./ported.json \
  event-1762973408850
```

### Using Defaults
```bash
# Uses defaults:
# - Input: ./expenses-2025-11-12-22-57-58.json
# - Output: ./ported.json
# - Event ID: event-1762973408850
node convert-to-new-schema.js
```

---

## 📊 Output Summary

The script shows:
```
🔄 Converting expense data to new schema...

📥 Reading: /path/to/input.json

📊 Data Summary:
   Expense Heads: 9
   Expense Entries: 12
   Total Budget: ₹1,199,800
   Total Spent: ₹269,050
   Date Range: 11/14/2024 - 10/10/2025

💾 Writing: /path/to/output.json
✅ Successfully converted to new schema!

📅 Created Event:
   ID: event-1762973408850
   Name: Imported Event
   Date Range: 11/14/2024 - 10/10/2025
   Expense Heads: 9

✨ Done! You can now import "./ported.json" into the app.
```

---

## 🎯 Conversion Details

### Old Format → New Format

**Before:**
```json
{
  "expenseHeads": [
    {
      "id": "1762966216679",
      "name": "Aula",
      "category": "reception",
      "totalAmount": 540000,
      "createdAt": "2025-11-12T16:50:16.679Z"
    }
  ],
  "expenseEntries": [...]
}
```

**After:**
```json
{
  "events": [
    {
      "id": "event-1762973408850",
      "name": "Imported Event",
      "description": "Converted from old format. Contains 9 expense heads...",
      "startDate": "2024-11-13T18:30:00.000Z",
      "endDate": "2025-10-09T18:30:00.000Z",
      "createdAt": "2025-11-12T18:52:15.712Z"
    }
  ],
  "expenseHeads": [
    {
      "id": "1762966216679",
      "name": "Aula",
      "category": "reception",
      "totalAmount": 540000,
      "createdAt": "2025-11-12T16:50:16.679Z",
      "eventId": "event-1762973408850"  ← ADDED
    }
  ],
  "expenseEntries": [...]
}
```

---

## ✏️ Customizing the Event

After conversion, you can edit `ported.json` to customize the event:

```json
{
  "events": [
    {
      "id": "event-1762973408850",
      "name": "Wedding Reception",  ← Change this
      "description": "Marriage ceremony and reception expenses",  ← Change this
      "startDate": "2024-11-13T18:30:00.000Z",
      "endDate": "2025-10-09T18:30:00.000Z",
      "createdAt": "2025-11-12T18:52:15.712Z"
    }
  ],
  ...
}
```

**Save the file** and then import it into the app!

---

## 📥 Importing to App

### Step 1: Convert
```bash
node convert-to-new-schema.js input.json ported.json event-123
```

### Step 2: Customize (Optional)
Edit `ported.json` to change event name/description

### Step 3: Import
1. Open the expense manager app
2. Click **Import** button (📥)
3. Select `ported.json`
4. Done! Your data with events is imported

---

## 🛠️ Script Features

### Auto-Detection
- ✅ Calculates total budget from expense heads
- ✅ Calculates total spent from expense entries
- ✅ Finds date range from entries (earliest to latest)
- ✅ Counts expense heads and entries

### Error Handling
- ✅ Validates input file exists
- ✅ Checks for required fields
- ✅ Provides clear error messages
- ✅ Exits with proper error codes

### Flexibility
- ✅ Custom input file path
- ✅ Custom output file path
- ✅ Custom event ID
- ✅ All have sensible defaults

---

## 📝 Parameters

| Parameter | Position | Default | Description |
|-----------|----------|---------|-------------|
| Input File | 1st | `./expenses-2025-11-12-22-57-58.json` | Path to old format JSON |
| Output File | 2nd | `./ported.json` | Where to save converted JSON |
| Event ID | 3rd | `event-1762973408850` | ID for the created event |

---

## 🔍 Example: Your Conversion

**Input:** `expenses-2025-11-12-22-57-58.json`
- 9 expense heads (Aula, Royal Greens, Decorator, etc.)
- 12 expense entries
- Total: ₹1,199,800 budget, ₹269,050 spent
- Date range: Nov 14, 2024 - Oct 10, 2025

**Output:** `ported.json`
- 1 event: "Imported Event" (event-1762973408850)
- 9 expense heads (with eventId added)
- 12 expense entries (unchanged)
- Ready to import!

---

## 💡 Tips

### Multiple Exports to Convert
```bash
# Convert multiple files
node convert-to-new-schema.js export1.json wedding.json event-wedding
node convert-to-new-schema.js export2.json birthday.json event-birthday
node convert-to-new-schema.js export3.json office.json event-office
```

### Batch Conversion
Create a shell script:
```bash
#!/bin/bash
for file in exports/*.json; do
  name=$(basename "$file" .json)
  node convert-to-new-schema.js "$file" "converted/${name}-new.json" "event-${name}"
done
```

### Verify Before Import
```bash
# Check the output is valid JSON
node -e "JSON.parse(require('fs').readFileSync('ported.json', 'utf8'))"

# Pretty print to review
cat ported.json | python -m json.tool
```

---

## ⚠️ Important Notes

1. **Backup First**: Always keep original JSON as backup
2. **One Event**: Script creates ONE event for all expenses
3. **IDs Preserved**: Original expense head/entry IDs unchanged
4. **Date Range**: Auto-detected from expense entry dates
5. **Customizable**: Edit output JSON before importing

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
```bash
# Make sure you're in the project directory
cd /Users/akumargupta/Documents/personal/expense-manager
node convert-to-new-schema.js
```

### Error: "Invalid input: missing expenseHeads"
- Input file must have `expenseHeads` and `expenseEntries` arrays
- Check the JSON structure

### Error: "ENOENT: no such file"
- Check input file path is correct
- Use absolute paths if relative paths don't work

### Output has wrong event name
- Edit `ported.json` after conversion
- Change `name` and `description` fields in the event object

---

## ✅ Success Checklist

- [ ] Script ran without errors
- [ ] Output file created (`ported.json`)
- [ ] Verified JSON is valid
- [ ] Customized event name (optional)
- [ ] Ready to import!

---

**Created:** November 12, 2025  
**Purpose:** Convert old expense JSON to new events-based schema

