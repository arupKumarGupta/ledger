# Expense Manager

A modern, responsive expense tracking and ledger application built with React, TypeScript, and Material-UI. The app follows a mobile-first approach and adapts seamlessly to all screen sizes.

🚀 **Live Demo:** [https://arupkumargupta.github.io/ledger/](https://arupkumargupta.github.io/ledger/)

📚 **Documentation**: See [DOCS_INDEX.md](DOCS_INDEX.md) for complete setup guides and documentation index

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
- **Cloud Sync**: Optional AWS DynamoDB integration for automatic cloud backup
- **Import/Export**: Full data import/export as JSON
- **Hybrid Storage**: localStorage for offline use + DynamoDB for cloud sync
- **Smart Merge**: Import merges data without duplicates
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
- **localStorage** for offline data persistence
- **AWS Cognito Identity Pools** (optional) for secure, temporary credentials
- **AWS DynamoDB** (optional) for cloud sync and backup
- **AWS SDK v3** for Cognito and DynamoDB integration

## Getting Started

### Prerequisites
- Node.js 18+
- Yarn package manager
- AWS Account (optional, for cloud sync - free tier available)

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

## Cloud Sync Setup (Optional) 🔐

Enable automatic cloud backup with AWS DynamoDB - **securely implemented** with AWS Cognito Identity Pools.

### 🔒 Security First
This app uses **AWS Cognito** for secure cloud sync:
- ✅ **No credentials in code** - Cognito provides temporary credentials
- ✅ **Safe to deploy publicly** - No secrets exposed in your app
- ✅ **Automatic credential rotation** - Temporary credentials expire automatically
- ✅ **Scoped permissions** - Users can only access their own data

### Quick Setup (5 minutes)

1. **Follow the complete setup guide**: [AWS_COGNITO_SETUP.md](AWS_COGNITO_SETUP.md)

2. **Create Cognito Identity Pool** (via AWS Console):
   - Enable unauthenticated access
   - Configure IAM role permissions for DynamoDB

3. **Create `.env.local` file** in the project root:
   ```bash
   cp env.template .env.local
   ```

4. **Add Cognito configuration** to `.env.local`:
   ```env
   # AWS Region - Your DynamoDB table region
   VITE_AWS_REGION=ap-south-1
   
   # Cognito Identity Pool ID (SAFE - no credentials!)
   VITE_COGNITO_IDENTITY_POOL_ID=ap-south-1:12345678-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   
   # DynamoDB Configuration
   VITE_DYNAMODB_TABLE_NAME=expense-manager
   VITE_DYNAMODB_PARTITION_KEY=expense-manager-partition-key-1209
   ```

5. **Restart the app** and you'll see a cloud icon (☁️) in the toolbar!

### Benefits:
- ✅ **Automatic backup** to AWS DynamoDB
- ✅ **Multi-device sync** - access your data anywhere
- ✅ **Forever free** with AWS free tier (25 GB storage, 50K MAU)
- ✅ **Offline-first** - works without internet, syncs when available
- ✅ **Production-ready** - Secure architecture, safe for public deployment
- ✅ **No maintenance** - No credential rotation needed

**Note**: The app works perfectly without AWS setup (using localStorage only).

## Deployment

This app is configured for automatic deployment to GitHub Pages.

### Quick Deploy:
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

The app will be automatically deployed via GitHub Actions to: https://arupkumargupta.github.io/ledger/

### GitHub Pages with Cloud Sync

To enable secure DynamoDB cloud sync on GitHub Pages:
1. **Set up AWS Cognito**: Follow [AWS_COGNITO_SETUP.md](AWS_COGNITO_SETUP.md)
2. **Add GitHub Secrets** (Settings → Secrets → Actions):
   - `VITE_AWS_REGION` 
   - `VITE_COGNITO_IDENTITY_POOL_ID`
   - `VITE_DYNAMODB_TABLE_NAME`
   - `VITE_DYNAMODB_PARTITION_KEY`
3. Push to main branch
4. GitHub Actions will build with Cognito configuration (no credentials!)

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

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
├── services/
│   ├── cognito.ts                # AWS Cognito authentication service
│   └── dynamodb.ts               # AWS DynamoDB cloud sync service
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

