# Quick Setup Guide - From Zero to Deployed with Cloud Sync

## 🎯 Goal
Deploy your expense manager to GitHub Pages with DynamoDB cloud sync enabled.

## 📋 Prerequisites
- [ ] GitHub account with repository: `arupKumarGupta/ledger`
- [ ] AWS account (free tier is enough)
- [ ] DynamoDB table created (you already have this!)

---

## 🚀 Part 1: Local Development Setup (5 minutes)

### 1. Clone & Install
```bash
cd /Users/akumargupta/Documents/personal/expense-manager
yarn install
```

### 2. Create `.env` file
```bash
cp env.template .env
```

### 3. Get AWS Credentials
1. Open [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. **Users** → **Create user** (or select existing)
3. **Permissions** → Attach `AmazonDynamoDBFullAccess`
4. **Security credentials** → **Create access key**
5. Copy the credentials

### 4. Edit `.env` with your credentials
```env
VITE_AWS_REGION=ap-south-1
VITE_AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
VITE_AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
VITE_DYNAMODB_TABLE_NAME=expense-manager
VITE_DYNAMODB_PARTITION_KEY=expense-manager-partition-key-1209
```

### 5. Test locally
```bash
yarn dev
```
Visit http://localhost:5173/ledger/ and test cloud sync!

---

## 🌐 Part 2: GitHub Pages Setup (5 minutes)

### 1. Enable GitHub Pages
1. Go to: https://github.com/arupKumarGupta/ledger/settings/pages
2. **Source**: Select **"GitHub Actions"**
3. Save

### 2. Add GitHub Secrets
1. Go to: https://github.com/arupKumarGupta/ledger/settings/secrets/actions
2. Click **"New repository secret"** for each:

```
Secret 1:
  Name: VITE_AWS_REGION
  Value: ap-south-1

Secret 2:
  Name: VITE_AWS_ACCESS_KEY_ID
  Value: [Your AWS Access Key]

Secret 3:
  Name: VITE_AWS_SECRET_ACCESS_KEY
  Value: [Your AWS Secret Key]

Secret 4:
  Name: VITE_DYNAMODB_TABLE_NAME
  Value: expense-manager

Secret 5:
  Name: VITE_DYNAMODB_PARTITION_KEY
  Value: expense-manager-partition-key-1209
```

### 3. Deploy
```bash
git add .
git commit -m "Configure GitHub Pages with cloud sync"
git push origin main
```

### 4. Wait & Verify
1. Go to: https://github.com/arupKumarGupta/ledger/actions
2. Wait for green checkmark ✅
3. Visit: https://arupkumargupta.github.io/ledger/
4. Test cloud sync!

---

## ✅ Verification Checklist

### Local Development
- [ ] `yarn dev` starts without errors
- [ ] Can add expense entries
- [ ] No AWS errors in browser console
- [ ] Data appears in DynamoDB table

### GitHub Pages Deployment
- [ ] All 5 GitHub Secrets added
- [ ] Workflow completed successfully (green checkmark)
- [ ] App loads at GitHub Pages URL
- [ ] Can add expense entries on deployed app
- [ ] Data syncs to DynamoDB

---

## 📚 Detailed Guides

Need more help? Check these guides:

| Guide | Purpose |
|-------|---------|
| [DYNAMODB_CONFIG.md](DYNAMODB_CONFIG.md) | DynamoDB setup & IAM configuration |
| [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) | Step-by-step GitHub Secrets setup |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Complete deployment guide |
| [README.md](README.md) | Full project documentation |

---

## 🐛 Common Issues

### ❌ "DynamoDB not configured" in browser console

**Cause**: Environment variables not set  
**Fix**:
- Local: Check `.env` file exists and has all variables
- GitHub Pages: Verify all 5 secrets are added

### ❌ "Access Denied" errors

**Cause**: IAM permissions issue  
**Fix**: Verify IAM user has DynamoDB permissions

### ❌ Cloud sync works locally but not on GitHub Pages

**Cause**: GitHub Secrets not configured  
**Fix**: 
1. Add all 5 secrets to GitHub
2. Re-run the workflow

### ❌ Workflow fails during build

**Cause**: Various  
**Fix**: Check Actions logs for specific error

---

## 🎨 Architecture Overview

### Local Development
```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌──────────┐
│  .env   │ --> │   Vite   │ --> │ Browser │ --> │ DynamoDB │
└─────────┘     └──────────┘     └─────────┘     └──────────┘
```

### GitHub Pages
```
┌────────────────┐     ┌─────────────┐     ┌──────────────┐
│ GitHub Secrets │ --> │   Build     │ --> │ Static Files │
└────────────────┘     │  (Actions)  │     └──────────────┘
                       └─────────────┘            │
                                                  v
                       ┌─────────┐     ┌──────────────────┐
                       │ Browser │ --> │     DynamoDB     │
                       └─────────┘     └──────────────────┘
```

---

## 🔒 Security Notes

⚠️ **Important**: 
- AWS credentials are embedded in JavaScript on GitHub Pages
- Use dedicated IAM user with minimal permissions
- Only grant access to this specific DynamoDB table
- This is acceptable for personal use, not for production apps

✅ **Safer for production**:
- Use AWS Cognito for authentication
- Use API Gateway + Lambda
- Never expose AWS credentials in frontend

---

## 🎉 You're Done!

Once setup is complete:
- ✅ Local development works with cloud sync
- ✅ GitHub Pages auto-deploys on every push
- ✅ Data syncs across all devices
- ✅ Free hosting + free DynamoDB (within free tier)

**Live App**: https://arupkumargupta.github.io/ledger/

---

## 💡 Pro Tips

1. **Offline-first**: App works without internet, syncs when available
2. **Import/Export**: Use JSON export as backup (Settings icon)
3. **Multi-device**: Same data across all devices with cloud sync
4. **Free forever**: Stays within AWS free tier for personal use
5. **Privacy**: Your data, your AWS account, fully under your control

---

## 📞 Need Help?

Check the detailed guides above or AWS/GitHub documentation:
- [AWS DynamoDB Docs](https://docs.aws.amazon.com/dynamodb/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

