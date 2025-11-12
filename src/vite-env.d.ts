/// <reference types="vite/client" />

interface ImportMetaEnv {
  // AWS Cognito Identity Pool configuration (secure - no credentials)
  readonly VITE_AWS_REGION: string;
  readonly VITE_COGNITO_IDENTITY_POOL_ID: string;
  
  // DynamoDB configuration
  readonly VITE_DYNAMODB_TABLE_NAME: string;
  readonly VITE_DYNAMODB_PARTITION_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


