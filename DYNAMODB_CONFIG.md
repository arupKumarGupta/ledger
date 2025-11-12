# DynamoDB Configuration Guide

## Current Setup

Your DynamoDB table is already created with the following configuration:

- **Table Name**: `expense-manager`
- **Region**: `ap-south-1` (Asia Pacific - Mumbai)
- **Partition Key**: `expense-manager-partition-key-1209` (String)
- **Sort Key**: None
- **Capacity Mode**: On-demand
- **ARN**: `arn:aws:dynamodb:ap-south-1:328256422687:table/expense-manager`

## Configuration Steps

### 1. Create Environment File

Create a `.env` file in your project root:

```bash
touch .env
```

### 2. Add Configuration to `.env`

Copy and paste the following into your `.env` file:

```env
# AWS Region (Mumbai)
VITE_AWS_REGION=ap-south-1

# AWS Credentials (Get from AWS IAM Console)
VITE_AWS_ACCESS_KEY_ID=your-access-key-id-here
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key-here

# DynamoDB Table Configuration
VITE_DYNAMODB_TABLE_NAME=expense-manager
VITE_DYNAMODB_PARTITION_KEY=expense-manager-partition-key-1209
```

### 3. Get AWS Credentials

1. Log in to **AWS Console**
2. Go to **IAM** service
3. Click **Users** → **Create user** (or use existing user)
4. Attach permissions:
   - Either attach: `AmazonDynamoDBFullAccess` policy
   - Or create custom policy with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:ap-south-1:328256422687:table/expense-manager"
    }
  ]
}
```

5. Go to **Security credentials** tab
6. Click **Create access key**
7. Select **Application running outside AWS**
8. Copy the **Access Key ID** and **Secret Access Key**
9. Paste them into your `.env` file

### 4. Test the Connection

1. Restart your development server:
   ```bash
   yarn dev
   ```

2. Check the browser console for any connection errors
3. Try adding an expense entry to test cloud sync

## Data Structure

The app stores data in DynamoDB with this structure:

```json
{
  "expense-manager-partition-key-1209": "expense-data",
  "data": {
    "expenseHeads": [...],
    "expenseEntries": [...]
  },
  "lastModified": "2025-11-12T10:19:00.000Z"
}
```

## Code Changes Made

The following files were updated to match your DynamoDB table structure:

1. **`src/services/dynamodb.ts`**:
   - Updated partition key to use `expense-manager-partition-key-1209`
   - Removed sort key requirement (your table doesn't have one)
   - Added `VITE_DYNAMODB_PARTITION_KEY` environment variable support

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit `.env` file** to git (already in `.gitignore`)
2. **Use IAM permissions** with least privilege
3. **Rotate access keys** regularly
4. **For production**: Use AWS Cognito or IAM roles instead of hardcoded credentials
5. **Consider AWS Amplify** for better authentication flow

## Troubleshooting

### Connection fails with "ResourceNotFoundException"
- Verify table name is exactly: `expense-manager`
- Verify region is: `ap-south-1`

### Connection fails with "AccessDeniedException"
- Verify IAM user has DynamoDB permissions
- Check if access keys are correct

### Console shows "DynamoDB not configured"
- Verify `.env` file exists in project root
- Verify all environment variables are set
- Restart the dev server (`yarn dev`)

### Data not syncing
- Open browser console and check for errors
- Verify internet connection
- Check AWS CloudWatch logs for DynamoDB errors

## AWS Free Tier Limits

Your DynamoDB table is covered under AWS Free Tier:

- ✅ **25 GB** of storage
- ✅ **25 Read Capacity Units** per second
- ✅ **25 Write Capacity Units** per second
- ✅ **On-demand pricing**: First 2.5 million reads/writes per month are free

For a personal expense tracker, you'll likely never exceed the free tier limits.

## Need Help?

- AWS DynamoDB Documentation: https://docs.aws.amazon.com/dynamodb/
- AWS SDK for JavaScript v3: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/

