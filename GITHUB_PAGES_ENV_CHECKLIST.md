# GitHub Pages Environment Variables - Simple Checklist

## What You Need

Your GitHub repository already has the workflow configured. You just need to add 5 secrets!

---

## Step-by-Step Checklist

### ☐ Step 1: Go to GitHub Secrets Page

**Direct Link**: https://github.com/arupKumarGupta/ledger/settings/secrets/actions

Or navigate: **Repository** → **Settings** → **Secrets and variables** → **Actions**

---

### ☐ Step 2: Add Secret #1 - Region

1. Click **"New repository secret"**
2. **Name**: `VITE_AWS_REGION`
3. **Value**: `ap-south-1`
4. Click **"Add secret"**

---

### ☐ Step 3: Add Secret #2 - Access Key ID

1. Click **"New repository secret"**
2. **Name**: `VITE_AWS_ACCESS_KEY_ID`
3. **Value**: `[Your AWS Access Key from IAM]`
4. Click **"Add secret"**

---

### ☐ Step 4: Add Secret #3 - Secret Access Key

1. Click **"New repository secret"**
2. **Name**: `VITE_AWS_SECRET_ACCESS_KEY`
3. **Value**: `[Your AWS Secret Key from IAM]`
4. Click **"Add secret"**

---

### ☐ Step 5: Add Secret #4 - Table Name

1. Click **"New repository secret"**
2. **Name**: `VITE_DYNAMODB_TABLE_NAME`
3. **Value**: `expense-manager`
4. Click **"Add secret"**

---

### ☐ Step 6: Add Secret #5 - Partition Key

1. Click **"New repository secret"**
2. **Name**: `VITE_DYNAMODB_PARTITION_KEY`
3. **Value**: `expense-manager-partition-key-1209`
4. Click **"Add secret"**

---

### ☐ Step 7: Verify All Secrets Added

You should see all 5 secrets listed:
- ✓ VITE_AWS_REGION
- ✓ VITE_AWS_ACCESS_KEY_ID
- ✓ VITE_AWS_SECRET_ACCESS_KEY
- ✓ VITE_DYNAMODB_TABLE_NAME
- ✓ VITE_DYNAMODB_PARTITION_KEY

---

### ☐ Step 8: Deploy

Push any change or manually trigger workflow:

```bash
git commit --allow-empty -m "Trigger deployment with secrets"
git push origin main
```

Or go to: https://github.com/arupKumarGupta/ledger/actions
- Click **"Deploy to GitHub Pages"**
- Click **"Run workflow"** → **"Run workflow"**

---

### ☐ Step 9: Wait for Deployment

Go to: https://github.com/arupKumarGupta/ledger/actions

Wait for green checkmark ✅ (usually 1-2 minutes)

---

### ☐ Step 10: Test

1. Visit: https://arupkumargupta.github.io/ledger/
2. Open browser console (F12)
3. Add a test expense entry
4. Check for errors in console
5. Verify data in AWS DynamoDB console

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│  GITHUB SECRETS (5 Required)                        │
├─────────────────────────────────────────────────────┤
│  1. VITE_AWS_REGION                                 │
│     Value: ap-south-1                               │
│                                                     │
│  2. VITE_AWS_ACCESS_KEY_ID                          │
│     Value: [From AWS IAM]                           │
│                                                     │
│  3. VITE_AWS_SECRET_ACCESS_KEY                      │
│     Value: [From AWS IAM]                           │
│                                                     │
│  4. VITE_DYNAMODB_TABLE_NAME                        │
│     Value: expense-manager                          │
│                                                     │
│  5. VITE_DYNAMODB_PARTITION_KEY                     │
│     Value: expense-manager-partition-key-1209       │
└─────────────────────────────────────────────────────┘
```

---

## Don't Have AWS Credentials Yet?

### Get AWS Access Keys:

1. **Go to**: https://console.aws.amazon.com/iam/
2. **Click**: Users → Create user (or select existing)
3. **Attach**: AmazonDynamoDBFullAccess policy
4. **Go to**: Security credentials tab
5. **Click**: Create access key
6. **Select**: "Application running outside AWS"
7. **Copy**: Both Access Key ID and Secret Access Key
8. **Use**: These values in GitHub Secrets #2 and #3

---

## Done! 🎉

After adding all 5 secrets and deploying:
- ✅ GitHub Actions will build with your credentials
- ✅ Cloud sync will work on GitHub Pages
- ✅ Auto-deploys on every push to main
- ✅ Free hosting + free DynamoDB

**Your Live App**: https://arupkumargupta.github.io/ledger/

---

## Troubleshooting

**Cloud sync not working?**
- Verify all 5 secrets are added
- Re-run the workflow (Actions tab)
- Check browser console for errors

**Need help?**
See [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) for detailed guide.

