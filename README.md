# Expense Manager

A modern, responsive expense tracking and ledger application built with React, TypeScript, and Material-UI. The app follows a mobile-first approach and adapts seamlessly to all screen sizes.

## Features

### 1. Expense Head Management
- Create expense heads with name, category, and total amount
- View all expense heads with detailed statistics
- Delete expense heads (with confirmation)
- Track total amount, amount paid, and amount due

### 2. Expense Entry Management
- Add expense entries with amount paid
- Autocomplete/typeahead dropdown for expense head selection
- Warning system when payment exceeds remaining amount (but allows the transaction)
- Optional image upload for receipts (stored as base64)
- Automatic date and time tracking for each entry
- Quick add new expense head from the add entry dialog

### 3. Payment History
- View chronological payment history for each expense head
- Inline editing of payment amounts
- Delete individual payment entries
- View uploaded receipt images

### 4. Data Management
- **Import/Export**: Full data import/export as JSON
- All data stored in localStorage (or mobile storage equivalent)
- Export creates timestamped JSON files (expenses-YYYY-MM-DD-HH-MM-SS.json)
- Import validates data structure before applying

### 5. User Experience
- **System Theme Support**: Automatically adapts to light/dark mode based on system preferences
- **Responsive Design**: Mobile-first approach with adaptive UI elements
- **Mobile Navigation**: Bottom navigation bar on mobile devices
- **Desktop Experience**: Floating action buttons and top toolbar
- **Visual Feedback**: Progress bars, color coding, and status indicators
- **Notifications**: Toast messages for all actions

## Technology Stack

- **React** with TypeScript for type safety
- **Material-UI (MUI)** for UI components
- **Vite** for fast development and building
- **localStorage** for data persistence

## Getting Started

### Prerequisites
- Node.js 18+ (for this version)
- Yarn package manager

### Installation

1. Install dependencies:
```bash
yarn
```

2. Start the development server:
```bash
yarn dev
```

3. Build for production:
```bash
yarn build
```

4. Preview production build:
```bash
yarn preview
```

## Usage Guide

### Desktop Mode
- **Add Expense Head**: Click the blue account icon (bottom-right)
- **Add Expense Entry**: Click the pink plus icon (bottom-right)
- **Import/Export**: Use icons in the top-right toolbar
- **View History**: Click the eye icon on any expense card
- **Delete**: Click the trash icon (with confirmation)

### Mobile Mode
- **Add Expense Head**: Tap the floating account icon
- **Add Expense Entry**: Tap "Add Entry" in bottom navigation
- **Import/Export**: Use bottom navigation buttons
- **View History**: Tap the eye icon on expense cards
- **Delete**: Tap the trash icon (with confirmation)

### Data Export Format
```json
{
  "expenseHeads": [
    {
      "id": "1234567890",
      "name": "Office Supplies",
      "category": "Business",
      "totalAmount": 1000,
      "createdAt": "2025-11-11T10:00:00.000Z"
    }
  ],
  "expenseEntries": [
    {
      "id": "1234567891",
      "expenseHeadId": "1234567890",
      "amountPaid": 250,
      "date": "2025-11-11T10:30:00.000Z",
      "image": "data:image/png;base64,..."
    }
  ]
}
```

## Project Structure

```
src/
├── components/
│   ├── AddExpenseDialog.tsx      # Dialog for adding expense entries
│   ├── ExpenseHeadDialog.tsx     # Dialog for creating expense heads
│   ├── ExpenseHistory.tsx        # Payment history viewer
│   └── ExpensesList.tsx          # Main list view of expense heads
├── utils/
│   └── storage.ts                # localStorage utility functions
├── types.ts                      # TypeScript type definitions
├── App.tsx                       # Main application component
├── App.css                       # Global styles
├── index.css                     # Base styles
└── main.tsx                      # Application entry point
```

## Features in Detail

### Warning System
When adding an expense entry, if the amount exceeds the remaining due amount, the app displays a warning but still allows the transaction. This is useful for situations where expenses might include additional charges or fees.

### Image Upload
Receipt images are converted to base64 and stored directly in localStorage. The app enforces a 5MB file size limit per image to prevent storage issues.

### Inline Editing
In the payment history view, you can click the edit icon to modify payment amounts inline, making corrections quick and easy.

### Data Validation
- All forms include validation for required fields
- Numeric inputs validate for positive numbers
- Import validates JSON structure before applying changes

## Browser Support

Works on all modern browsers that support:
- ES6+
- localStorage API
- FileReader API
- CSS Grid and Flexbox

## License

MIT

