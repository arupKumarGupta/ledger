import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { ExpenseData } from '../types';
import { getCognitoCredentials, isCognitoConfigured } from './cognito';

/**
 * ✅ SECURE Cloud Sync with AWS Cognito
 * 
 * This module uses AWS Cognito Identity Pools to get temporary credentials.
 * NO long-term credentials are embedded in the code.
 * 
 * How it works:
 * 1. Cognito Identity Pool provides temporary AWS credentials
 * 2. Credentials are scoped by IAM policies (only access to specific DynamoDB table)
 * 3. Credentials automatically expire and refresh
 * 4. Safe to deploy to GitHub Pages or any static host
 */

let dynamoClient: DynamoDBDocumentClient | null = null;

// Initialize DynamoDB client with Cognito credentials
const initClient = () => {
  if (!isCognitoConfigured()) {
    console.warn('AWS Cognito not configured. Using localStorage only.');
    console.info('To enable cloud sync, set VITE_AWS_REGION and VITE_COGNITO_IDENTITY_POOL_ID');
    return null;
  }

  if (dynamoClient) {
    return dynamoClient;
  }

  try {
    const cognitoCredentials = getCognitoCredentials();
    
    if (!cognitoCredentials) {
      console.error('Failed to get Cognito credentials');
      return null;
    }

    const { credentials, region } = cognitoCredentials;

    const client = new DynamoDBClient({
      region,
      credentials, // Temporary credentials from Cognito
    });

    dynamoClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true, // Remove undefined values (required for optional fields)
      },
    });
    console.info('✅ DynamoDB client initialized with Cognito credentials');
    return dynamoClient;
  } catch (error) {
    console.error('Failed to initialize DynamoDB client:', error);
    return null;
  }
};

const TABLE_NAME = import.meta.env.VITE_DYNAMODB_TABLE_NAME || 'expense-manager';
// Updated to match the actual DynamoDB table partition key
const PARTITION_KEY = import.meta.env.VITE_DYNAMODB_PARTITION_KEY || 'expense-manager-partition-key-1209';

export interface SyncResult {
  success: boolean;
  error?: string;
  timestamp?: string;
}

/**
 * Save data to DynamoDB
 */
export const saveToCloud = async (data: ExpenseData): Promise<SyncResult> => {
  const client = initClient();
  
  if (!client) {
    return { success: false, error: 'DynamoDB not configured' };
  }

  try {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        [PARTITION_KEY]: 'expense-data', // Use the actual partition key name
        data: data,
        lastModified: new Date().toISOString(),
      },
    });

    await client.send(command);
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error saving to DynamoDB:', error);
    return {
      success: false,
      error: error.message || 'Failed to save to cloud',
    };
  }
};

/**
 * Load data from DynamoDB
 */
export const loadFromCloud = async (): Promise<{ data: ExpenseData | null; error?: string }> => {
  const client = initClient();
  
  if (!client) {
    return { data: null, error: 'DynamoDB not configured' };
  }

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        [PARTITION_KEY]: 'expense-data', // Use the actual partition key name
      },
    });

    const response = await client.send(command);
    
    if (response.Item && response.Item.data) {
      return { data: response.Item.data as ExpenseData };
    }
    
    return { data: null };
  } catch (error: any) {
    console.error('Error loading from DynamoDB:', error);
    return {
      data: null,
      error: error.message || 'Failed to load from cloud',
    };
  }
};

/**
 * Check if DynamoDB is available and configured
 */
export const isCloudEnabled = (): boolean => {
  return isCognitoConfigured();
};

/**
 * Get last sync timestamp from DynamoDB
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  const client = initClient();
  
  if (!client) {
    return null;
  }

  try {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        [PARTITION_KEY]: 'expense-data', // Use the actual partition key name
      },
      ProjectionExpression: 'lastModified',
    });

    const response = await client.send(command);
    return response.Item?.lastModified || null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

/**
 * Clear all data from DynamoDB (DESTRUCTIVE!)
 * This deletes the entire expense-data item from the table
 */
export const clearAllCloudData = async (): Promise<SyncResult> => {
  const client = initClient();
  
  if (!client) {
    return { success: false, error: 'DynamoDB not configured' };
  }

  try {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        [PARTITION_KEY]: 'expense-data',
      },
    });

    await client.send(command);
    
    console.warn('⚠️ All cloud data has been deleted from DynamoDB');
    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error clearing cloud data:', error);
    return {
      success: false,
      error: error.message || 'Failed to clear cloud data',
    };
  }
};


