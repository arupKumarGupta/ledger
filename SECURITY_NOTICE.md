# 🚨 SECURITY NOTICE

## AWS Credentials Exposure - ACTION REQUIRED

### What Happened
AWS credentials were accidentally embedded in the client-side JavaScript bundle and pushed to the `gh-pages` branch. GitHub's secret scanning detected and blocked the push.

### Actions Taken
1. ✅ Removed AWS credentials from the GitHub Actions workflow
2. ✅ Deleted the `gh-pages` branch to remove exposed secrets from git history
3. ✅ Added security warnings to the codebase
4. ✅ Disabled cloud sync feature in production builds

### ⚠️ CRITICAL: You Must Rotate Your AWS Credentials

**Your AWS credentials were exposed and must be rotated immediately:**

1. **Go to AWS IAM Console**
   - https://console.aws.amazon.com/iam/

2. **Delete the compromised credentials:**
   - Find the user/access key that was exposed
   - Delete the Access Key ID and Secret Access Key

3. **Create new credentials:**
   - Generate a new Access Key ID and Secret Access Key
   - Store them securely (use AWS Secrets Manager or local .env files only)

4. **Review CloudTrail logs:**
   - Check for any unauthorized access using the compromised credentials
   - Look for unusual API calls or resource creation

### Why This Happened

The issue occurred because:
- Vite embeds all `VITE_*` environment variables into the client-side bundle
- AWS credentials were passed as environment variables during the build
- The built files were committed to the `gh-pages` branch

### The Proper Solution

**You cannot safely use AWS credentials in a browser application.** 

To implement cloud sync properly, choose one of these approaches:

#### Option 1: AWS Cognito (Recommended for Static Sites)
- Use AWS Cognito Identity Pools to provide temporary credentials
- Users authenticate with Cognito
- Cognito provides temporary AWS credentials scoped to specific DynamoDB operations

#### Option 2: Backend API (Most Secure)
- Create a backend API (AWS Lambda + API Gateway)
- Backend handles all DynamoDB operations
- Frontend only communicates with your API
- No AWS credentials in frontend code

#### Option 3: Remove Cloud Sync
- Keep the app fully client-side with localStorage only
- Implement export/import functionality for backups

### ✅ FIXED: Secure Implementation with AWS Cognito

Cloud sync has been **REIMPLEMENTED SECURELY** using AWS Cognito Identity Pools.

**What changed:**
- ❌ Removed: Direct AWS credentials from code
- ✅ Added: AWS Cognito Identity Pools for temporary credentials
- ✅ Safe: No credentials exposed in client-side code
- ✅ Production Ready: Can be deployed to GitHub Pages

**To enable cloud sync:**
1. Follow the setup guide in `AWS_COGNITO_SETUP.md`
2. Create a Cognito Identity Pool (5 minutes)
3. Configure IAM permissions (scoped to your DynamoDB table only)
4. Add configuration to `.env.local` for local development
5. Add GitHub Secrets for production deployment

**No credentials needed!** Cognito provides temporary credentials automatically.

### Resources
- [AWS Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [Rotating AWS Credentials](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_RotateAccessKey)
- [AWS Cognito Identity Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html)

---

**Date:** November 12, 2025
**Status:** Incident Resolved - Credentials Must Be Rotated

