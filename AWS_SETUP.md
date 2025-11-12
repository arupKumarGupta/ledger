# AWS DynamoDB Setup Guide

This guide explains how to set up AWS DynamoDB for your Expense Manager app to enable cloud sync.

## 📋 Prerequisites

- AWS Account (free tier eligible)
- Basic understanding of AWS Console

## 🚀 Step-by-Step Setup

### Step 1: Create AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the sign-up process (requires credit card, but we'll use free tier)

### Step 2: Create DynamoDB Table

1. **Log in** to [AWS Console](https://console.aws.amazon.com)
2. **Search** for "DynamoDB" in the top search bar
3. Click **"Create table"**
4. Configure the table:
   ```
   Table name: expense-manager
   Partition key: userId (String)
   Sort key: dataType (String)
   Table settings: Use default settings
   ```
5. **Uncheck** "Use default settings" if you want to ensure free tier:
   - Table class: Standard
   - Read/write capacity: On-demand (recommended) OR
   - Provisioned capacity: 1 read + 1 write (free tier limits)
6. Click **"Create table"**
7. Wait for the table to be created (takes ~1 minute)

### Step 3: Create IAM User with DynamoDB Access

1. **Search** for "IAM" in AWS Console
2. Go to **"Users"** → **"Create user"**
3. Enter username: `expense-manager-app`
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search and select: **`AmazonDynamoDBFullAccess`**
   - (For production, use more restrictive policy)
7. Click **"Next"** → **"Create user"**

### Step 4: Create Access Keys

1. Click on the newly created user (`expense-manager-app`)
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. Select use case: **"Local code"**
6. Check the confirmation box
7. Click **"Next"** → **"Create access key"**
8. **⚠️ IMPORTANT**: Copy both:
   - **Access key ID**
   - **Secret access key**
   - (You won't be able to see the secret key again!)

### Step 5: Configure Your App

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your AWS credentials:
   ```env
   VITE_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   VITE_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   VITE_AWS_REGION=us-east-1
   VITE_DYNAMODB_TABLE_NAME=expense-manager
   ```

3. **Important Notes**:
   - Replace the example values with YOUR actual credentials
   - Choose the region where you created your table
   - Never commit `.env` to git (already in `.gitignore`)

### Step 6: Test the Connection

1. Start your development server:
   ```bash
   yarn dev
   ```

2. Open the app in your browser
3. You should see one of these messages:
   - ✅ "Synced with cloud" → Success!
   - ℹ️ "Using offline mode" → Check your .env file
   - ❌ Error message → Check AWS credentials

4. Look for the **cloud icon** (☁️) in the top toolbar:
   - Cloud icon = Sync enabled
   - Cloud-off icon = Offline mode

## 💰 Cost Breakdown (Free Tier)

### DynamoDB Free Tier (Forever)
- **Storage**: 25 GB
- **Read requests**: 25 RCUs (millions of requests)
- **Write requests**: 25 WCUs (millions of requests)

### Your Expense App Usage (Estimated)
- **Storage**: < 1 MB (negligible)
- **Reads**: ~100-1000/month (well within limits)
- **Writes**: ~50-500/month (well within limits)

**Result**: Should remain 100% free! 🎉

## 🔐 Security Best Practices

### For Development
Current setup is fine for personal use.

### For Production
1. **Use IAM roles** instead of access keys
2. **Restrict IAM policy** to specific table:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": [
         "dynamodb:PutItem",
         "dynamodb:GetItem",
         "dynamodb:UpdateItem",
         "dynamodb:Query"
       ],
       "Resource": "arn:aws:dynamodb:REGION:ACCOUNT-ID:table/expense-manager"
     }]
   }
   ```
3. **Use AWS Cognito** for user authentication
4. **Enable encryption** at rest
5. **Use backend API** to proxy AWS calls (don't expose credentials in frontend)

## 🔄 How Sync Works

### Automatic Sync
- **On app load**: Loads data from DynamoDB (or localStorage if offline)
- **On data change**: Automatically saves to both localStorage and DynamoDB
- **Offline mode**: Falls back to localStorage if DynamoDB is unavailable

### Manual Sync
- Click the **cloud icon** (☁️) in the toolbar to force a sync
- Useful after network interruptions

### Data Structure
```json
{
  "userId": "default-user",
  "dataType": "expense-data",
  "data": {
    "expenseHeads": [...],
    "expenseEntries": [...]
  },
  "lastModified": "2025-11-12T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### "Using offline mode" message
**Problem**: App can't connect to AWS
**Solutions**:
1. Check `.env` file exists and has correct values
2. Verify credentials are correct (try creating new access keys)
3. Check table name matches (`expense-manager`)
4. Verify region is correct

### "Access Denied" error
**Problem**: IAM permissions issue
**Solutions**:
1. Ensure IAM user has `AmazonDynamoDBFullAccess` policy
2. Try creating new access keys
3. Check if access keys are still active in IAM console

### Table creation failed
**Problem**: Might already exist or region mismatch
**Solutions**:
1. Check if table already exists in DynamoDB console
2. Delete old table and recreate
3. Use a different table name in `.env`

### Can't see sync icon
**Problem**: `.env` not loaded
**Solutions**:
1. Restart dev server after creating/editing `.env`
2. Check file is named `.env` (not `.env.txt`)
3. Verify `VITE_` prefix on all variables

## 📱 Multi-Device Sync

Once set up, your data syncs across devices:
1. **Desktop computer**: Full sync
2. **Laptop**: Full sync
3. **Mobile browser**: Full sync
4. **All devices**: See the same data in real-time!

Just use the same AWS credentials (same `.env` file) on all devices.

## 🚀 Deployment to GitHub Pages

For GitHub Pages deployment:
1. **Do NOT commit `.env`** to repository
2. Use **GitHub Secrets** for credentials:
   - Go to: Repository → Settings → Secrets → Actions
   - Add secrets:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
3. App will work offline on GitHub Pages (localStorage only)
4. To enable cloud sync on deployed version, users need their own AWS setup

## ℹ️ Additional Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

## 🎉 You're All Set!

Your expense manager now has cloud backup! Data is automatically synced to AWS DynamoDB while maintaining offline capability through localStorage.

Questions? Check the troubleshooting section or create an issue in the repository.


