# GitHub Secrets Setup for DynamoDB Cloud Sync

This guide shows you how to configure AWS credentials for GitHub Pages deployment with cloud sync enabled.

## Why GitHub Secrets?

GitHub Pages serves **static files only**. Environment variables must be embedded during the **build process** using GitHub Secrets. When you push to GitHub, the workflow:

1. Reads secrets from your repository
2. Builds the app with those variables embedded
3. Deploys the static files to GitHub Pages

⚠️ **Important**: Your local `.env` file is NOT used for GitHub Pages builds!

## Step-by-Step Setup

### Step 1: Get Your AWS Credentials

Follow the [DYNAMODB_CONFIG.md](DYNAMODB_CONFIG.md) guide to:
1. Create IAM user in AWS
2. Attach DynamoDB permissions
3. Generate Access Keys

You'll need:
- AWS Access Key ID
- AWS Secret Access Key

### Step 2: Add Secrets to GitHub

1. **Go to your repository on GitHub**
   - Navigate to: https://github.com/arupKumarGupta/ledger

2. **Open Settings**
   - Click **Settings** tab (top menu)

3. **Navigate to Secrets**
   - Click **Secrets and variables** (left sidebar)
   - Click **Actions**

4. **Add each secret**
   
   Click **"New repository secret"** button and add these **5 secrets**:

   #### Secret 1: AWS Region
   - **Name**: `VITE_AWS_REGION`
   - **Value**: `ap-south-1`
   - Click **"Add secret"**

   #### Secret 2: AWS Access Key ID
   - **Name**: `VITE_AWS_ACCESS_KEY_ID`
   - **Value**: Your AWS Access Key (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - Click **"Add secret"**

   #### Secret 3: AWS Secret Access Key
   - **Name**: `VITE_AWS_SECRET_ACCESS_KEY`
   - **Value**: Your AWS Secret Key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - Click **"Add secret"**

   #### Secret 4: DynamoDB Table Name
   - **Name**: `VITE_DYNAMODB_TABLE_NAME`
   - **Value**: `expense-manager`
   - Click **"Add secret"**

   #### Secret 5: DynamoDB Partition Key
   - **Name**: `VITE_DYNAMODB_PARTITION_KEY`
   - **Value**: `expense-manager-partition-key-1209`
   - Click **"Add secret"**

### Step 3: Verify Secrets

After adding all secrets, you should see:

```
✓ VITE_AWS_REGION
✓ VITE_AWS_ACCESS_KEY_ID
✓ VITE_AWS_SECRET_ACCESS_KEY
✓ VITE_DYNAMODB_TABLE_NAME
✓ VITE_DYNAMODB_PARTITION_KEY
```

**Note**: GitHub masks secret values. Once added, you can't view them (only update/delete).

### Step 4: Trigger Deployment

Push any change to trigger a new build:

```bash
git add .
git commit -m "Configure AWS secrets"
git push origin main
```

Or manually trigger:
1. Go to **Actions** tab
2. Click **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

### Step 5: Verify Cloud Sync

1. Wait for deployment to complete (green checkmark in Actions)
2. Visit your GitHub Pages URL: https://arupkumargupta.github.io/ledger/
3. Open browser console (F12)
4. Add a test expense entry
5. Check for any AWS errors in console
6. Verify in AWS DynamoDB console that data was saved

## How It Works

### Build Time vs Runtime

**Local Development** (uses `.env` file):
```
.env file → Vite dev server → Browser
```

**GitHub Pages** (uses GitHub Secrets):
```
GitHub Secrets → GitHub Actions → Vite build → Static files → Browser
```

### The Workflow

Here's what happens in `.github/workflows/deploy.yml`:

```yaml
- name: Build
  run: yarn build
  env:
    VITE_AWS_REGION: ${{ secrets.VITE_AWS_REGION }}
    VITE_AWS_ACCESS_KEY_ID: ${{ secrets.VITE_AWS_ACCESS_KEY_ID }}
    VITE_AWS_SECRET_ACCESS_KEY: ${{ secrets.VITE_AWS_SECRET_ACCESS_KEY }}
    VITE_DYNAMODB_TABLE_NAME: ${{ secrets.VITE_DYNAMODB_TABLE_NAME }}
    VITE_DYNAMODB_PARTITION_KEY: ${{ secrets.VITE_DYNAMODB_PARTITION_KEY }}
```

During build, Vite:
1. Reads these environment variables
2. Replaces `import.meta.env.VITE_*` with actual values
3. Bundles everything into static JavaScript files
4. The credentials are embedded in the code

## Security Considerations

### ⚠️ Important Security Notes

1. **Credentials are embedded in JavaScript**
   - Anyone can extract them from your deployed app
   - They are visible in the browser's JavaScript files
   - This is unavoidable with static hosting

2. **Use IAM Permissions to Limit Access**
   - Create a dedicated IAM user for this app
   - Grant ONLY DynamoDB access to your specific table
   - Don't use AWS account root credentials

3. **Recommended IAM Policy** (least privilege):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:PutItem",
           "dynamodb:GetItem"
         ],
         "Resource": "arn:aws:dynamodb:ap-south-1:328256422687:table/expense-manager"
       }
     ]
   }
   ```

4. **Better Architecture** (for production apps):
   - Use AWS Cognito for authentication
   - Use AWS Amplify for managed backend
   - Use API Gateway + Lambda instead of direct DynamoDB access
   - Never expose credentials in frontend code

### For This Personal App

Since this is a personal expense tracker:
- ✅ Using limited IAM permissions is acceptable
- ✅ Only your data is stored (single-user app)
- ✅ The convenience outweighs the risk
- ⚠️ Don't use these credentials for anything else

## Troubleshooting

### Secrets not working after adding them

**Solution**: Re-run the workflow
- Go to **Actions** tab
- Select the latest workflow run
- Click **"Re-run all jobs"**

### Can't see secret values

**Expected**: GitHub hides secret values for security. You can only:
- Update the secret (replace with new value)
- Delete the secret
- See the secret name (not the value)

### Cloud sync works locally but not on GitHub Pages

**Check**:
1. Are all 5 secrets added? (Settings → Secrets → Actions)
2. Are the secret names spelled correctly? (case-sensitive)
3. Did you re-run the workflow after adding secrets?
4. Check Actions logs for build errors

### Build succeeds but cloud sync still doesn't work

**Debug**:
1. Visit your deployed app
2. Open browser console (F12)
3. Look for errors mentioning:
   - "DynamoDB not configured"
   - "Access Denied"
   - "ResourceNotFoundException"
4. Check IAM permissions in AWS

### Want to test with real secrets locally

**Don't use GitHub Secrets locally**. Instead:
1. Keep your `.env` file (local only)
2. Make sure `.env` is in `.gitignore`
3. Use same values as your GitHub Secrets

## Quick Reference

### Required Secrets (All 5)

| Secret Name | Example Value |
|------------|---------------|
| `VITE_AWS_REGION` | `ap-south-1` |
| `VITE_AWS_ACCESS_KEY_ID` | `AKIAIOSFODNN7EXAMPLE` |
| `VITE_AWS_SECRET_ACCESS_KEY` | `wJalrXUtnFEMI/K7MDENG...` |
| `VITE_DYNAMODB_TABLE_NAME` | `expense-manager` |
| `VITE_DYNAMODB_PARTITION_KEY` | `expense-manager-partition-key-1209` |

### GitHub Pages URLs

- **Settings**: https://github.com/arupKumarGupta/ledger/settings
- **Secrets**: https://github.com/arupKumarGupta/ledger/settings/secrets/actions
- **Actions**: https://github.com/arupKumarGupta/ledger/actions
- **Live App**: https://arupkumargupta.github.io/ledger/

## Next Steps

After setup:
1. ✅ Secrets are configured
2. ✅ Workflow will use them automatically
3. ✅ Every push to main will rebuild with secrets
4. ✅ Cloud sync will work on GitHub Pages

**All done! 🎉**

