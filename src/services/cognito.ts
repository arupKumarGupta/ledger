/**
 * AWS Cognito Authentication Service
 * 
 * This service provides secure, temporary AWS credentials using AWS Cognito Identity Pools.
 * NO credentials are embedded in the code - Cognito provides them at runtime.
 * 
 * How it works:
 * 1. Cognito Identity Pool provides temporary AWS credentials
 * 2. These credentials are scoped with IAM policies (read/write to specific DynamoDB table only)
 * 3. Credentials expire automatically and are refreshed as needed
 * 4. No long-term credentials are ever exposed to the client
 */

import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';

export interface CognitoConfig {
  region: string;
  identityPoolId: string;
}

let cognitoConfig: CognitoConfig | null = null;

/**
 * Initialize Cognito configuration from environment variables
 */
export const initCognitoConfig = (): CognitoConfig | null => {
  const region = import.meta.env.VITE_AWS_REGION;
  const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID;

  if (!region || !identityPoolId) {
    console.warn('Cognito not configured. Cloud sync will be disabled.');
    console.warn('Required: VITE_AWS_REGION, VITE_COGNITO_IDENTITY_POOL_ID');
    return null;
  }

  cognitoConfig = { region, identityPoolId };
  return cognitoConfig;
};

/**
 * Get AWS credentials from Cognito Identity Pool
 * These are temporary credentials that automatically expire and refresh
 */
export const getCognitoCredentials = () => {
  if (!cognitoConfig) {
    cognitoConfig = initCognitoConfig();
  }

  if (!cognitoConfig) {
    return null;
  }

  const { region, identityPoolId } = cognitoConfig;

  // Create credentials provider that gets temporary credentials from Cognito
  const credentials = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region }),
    identityPoolId,
    // For unauthenticated access (no login required)
    // If you add user authentication later, you can provide logins here
  });

  return { credentials, region };
};

/**
 * Check if Cognito is properly configured
 */
export const isCognitoConfigured = (): boolean => {
  if (!cognitoConfig) {
    cognitoConfig = initCognitoConfig();
  }
  return cognitoConfig !== null;
};

/**
 * Get current configuration (for debugging)
 */
export const getCognitoConfig = (): CognitoConfig | null => {
  return cognitoConfig;
};

