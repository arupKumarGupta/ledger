# AWS Cognito Setup Guide

## 🔐 Secure Cloud Sync with AWS Cognito Identity Pools

This guide will help you set up AWS Cognito Identity Pools to enable secure cloud sync for your Expense Manager app **without exposing any credentials** in your client-side code.

---

## Why Cognito?

### ❌ The Old (Insecure) Way
- AWS Access Keys hardcoded in environment variables
- Credentials exposed in client-side JavaScript bundle
- Anyone can extract and misuse your credentials
- **NEVER do this!**

### ✅ The New (Secure) Way with Cognito
- No credentials in client code
- Cognito provides temporary credentials at runtime
- Credentials automatically expire and refresh
- IAM policies limit what users can access
- **Safe for public deployment!**

---

## Prerequisites

- AWS Account
- Existing DynamoDB table (you should already have this)
- AWS CLI (optional, but helpful)

---

## Step 1: Create Cognito Identity Pool

### 1.1 Go to Amazon Cognito Console

1. Sign in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **Amazon Cognito** service
3. Click **Identity pools** in the left sidebar
4. Click **Create identity pool**

### 1.2 Configure Identity Pool

**Identity pool name:** `expense-manager-identity-pool`

**Select authentication providers:**
- Check **Enable access for unauthenticated identities**
  - This allows users to access the app without logging in
  - If you want to add user authentication later, you can configure that separately

**Click "Next"**

### 1.3 Configure Permissions (IAM Roles)

Cognito will create two IAM roles:
- **Authenticated role** (for logged-in users)
- **Unauthenticated role** (for guests - this is what we'll use)

**For now, accept the default role names and click "Next"**

### 1.4 Review and Create

- Review your configuration
- Click **Create identity pool**
- **Copy the Identity Pool ID** - it looks like: `ap-south-1:12345678-1234-1234-1234-123456789abc`

---

## Step 2: Configure IAM Permissions

Now we need to give the Cognito unauthenticated role permission to access your DynamoDB table.

### 2.1 Open IAM Console

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Roles** in the left sidebar
3. Find the role created by Cognito (e.g., `Cognito_expense-manager-identity-poolUnauth_Role`)
4. Click on the role name

### 2.2 Create Custom Policy for DynamoDB Access

Click **Add permissions** → **Create inline policy**

**Switch to JSON editor** and paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:YOUR_ACCOUNT_ID:table/expense-manager",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["expense-data"]
        }
      }
    }
  ]
}
```

**Replace:**
- `YOUR_ACCOUNT_ID` with your 12-digit AWS account ID
- `ap-south-1` with your AWS region if different
- `expense-manager` with your DynamoDB table name if different

**Name the policy:** `ExpenseManagerDynamoDBAccess`

**Click "Create policy"**

### 2.3 What This Policy Does

- ✅ Allows reading data (`GetItem`)
- ✅ Allows writing data (`PutItem`)
- ✅ Allows updating data (`UpdateItem`)
- ✅ **Only** for the `expense-manager` table
- ✅ **Only** for items with partition key `expense-data`
- ❌ Cannot access other tables
- ❌ Cannot delete the table
- ❌ Cannot scan entire table

This is **principle of least privilege** - users can only do what they need to do.

---

## Step 3: Configure Your Application

### 3.1 For Local Development

Create `.env.local` file in your project root:

```bash
cp env.template .env.local
```

Edit `.env.local` and add your configuration:

```env
VITE_AWS_REGION=ap-south-1
VITE_COGNITO_IDENTITY_POOL_ID=ap-south-1:12345678-1234-1234-1234-123456789abc
VITE_DYNAMODB_TABLE_NAME=expense-manager
VITE_DYNAMODB_PARTITION_KEY=expense-manager-partition-key-1209
```

**Replace the `VITE_COGNITO_IDENTITY_POOL_ID` with your actual Identity Pool ID from Step 1.4**

### 3.2 Test Locally

```bash
yarn dev
```

Open the app and try the cloud sync feature. Check the browser console for any errors.

### 3.3 For GitHub Pages Deployment

Add these as **GitHub Secrets**:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VITE_AWS_REGION` | Your AWS region | `ap-south-1` |
| `VITE_COGNITO_IDENTITY_POOL_ID` | Your Identity Pool ID | `ap-south-1:12345678-...` |
| `VITE_DYNAMODB_TABLE_NAME` | Your table name | `expense-manager` |
| `VITE_DYNAMODB_PARTITION_KEY` | Your partition key | `expense-manager-partition-key-1209` |

---

## Step 4: Deploy and Test

### 4.1 Commit and Push

```bash
git add .
git commit -m "feat: implement secure cloud sync with Cognito"
git push origin main
```

### 4.2 GitHub Actions will automatically:
- Build your app with Cognito configuration
- Deploy to GitHub Pages
- No credentials are exposed in the build

### 4.3 Test Production

1. Visit your GitHub Pages URL
2. Open browser DevTools → Console
3. Try syncing data
4. You should see: `✅ DynamoDB client initialized with Cognito credentials`

---

## Troubleshooting

### "Cognito not configured"
- Check that environment variables are set correctly
- Verify Identity Pool ID format: `region:uuid`

### "Access Denied" or "UnauthorizedException"
- Check IAM role permissions in Step 2.2
- Verify the DynamoDB table ARN is correct
- Make sure unauthenticated access is enabled on the Identity Pool

### "ResourceNotFoundException"
- Verify your DynamoDB table name is correct
- Check that the table exists in the same region as your Identity Pool

### Checking Credentials in Browser Console

```javascript
// This should show your Cognito Identity Pool ID (safe to expose)
console.log(import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID);

// This should NOT show any access keys or secrets
console.log(import.meta.env.VITE_AWS_ACCESS_KEY_ID); // undefined ✅
```

---

## Security Best Practices

### ✅ Safe to Include in Client Code:
- Cognito Identity Pool ID
- AWS Region
- DynamoDB Table Name
- DynamoDB Partition Key

### ❌ NEVER Include in Client Code:
- AWS Access Key ID
- AWS Secret Access Key
- IAM User Credentials
- Root Account Credentials

### Additional Security Recommendations

1. **Monitor CloudTrail Logs**
   - Enable CloudTrail to log all API calls
   - Set up CloudWatch alarms for suspicious activity

2. **Use DynamoDB Conditions**
   - The IAM policy includes a condition to limit access to specific partition keys
   - This prevents users from accessing other data in your table

3. **Consider Adding User Authentication**
   - Currently using unauthenticated access
   - For production, consider adding Cognito User Pools
   - This would let you track individual users and their data

4. **Set Up Cost Alerts**
   - Create AWS Budget alerts
   - Monitor DynamoDB usage
   - Set spending limits

5. **Regular Security Audits**
   - Review IAM policies quarterly
   - Check CloudTrail logs for anomalies
   - Rotate and review access patterns

---

## Advanced: Adding User Authentication (Optional)

If you want users to log in before syncing data:

1. **Create Cognito User Pool**
   - Set up email/password authentication
   - Configure hosted UI for login

2. **Link User Pool to Identity Pool**
   - Edit your Identity Pool
   - Add User Pool as authentication provider

3. **Update Application Code**
   - Use AWS Amplify or Cognito SDK
   - Add login/signup UI
   - Pass authentication tokens to Cognito

4. **Update IAM Policies**
   - Use authenticated role instead
   - Add conditions based on Cognito user ID
   - Each user only accesses their own data

---

## Cost Estimation

### Free Tier (First 12 months)
- Cognito Identity: 50,000 monthly active users (MAUs) free
- DynamoDB: 25 GB storage, 25 read/write capacity units

### After Free Tier
- Cognito Identity: First 50K MAUs free, then $0.0055/MAU
- DynamoDB: Pay per read/write, typically < $1/month for personal use

For a personal expense manager with one user, costs will be **minimal to zero**.

---

## Resources

- [AWS Cognito Identity Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html)
- [IAM Policy Examples for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/security_iam_id-based-policy-examples.html)
- [AWS Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## Summary

✅ **Secure**: No credentials in client code
✅ **Scalable**: Cognito handles authentication automatically  
✅ **Cost-effective**: Free tier covers personal use
✅ **Maintainable**: No credential rotation needed
✅ **Production-ready**: Safe to deploy publicly

You now have a secure, professional cloud sync implementation! 🎉

