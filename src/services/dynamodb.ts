import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { ExpenseData } from '../types';

// Check if AWS credentials are configured
const isConfigured = () => {
  return !!(
    import.meta.env.VITE_AWS_ACCESS_KEY_ID &&
    import.meta.env.VITE_AWS_SECRET_ACCESS_KEY &&
    import.meta.env.VITE_AWS_REGION
  );
};

let dynamoClient: DynamoDBDocumentClient | null = null;

// Initialize DynamoDB client
const initClient = () => {
  if (!isConfigured()) {
    console.warn('AWS DynamoDB not configured. Using localStorage only.');
    return null;
  }

  if (dynamoClient) {
    return dynamoClient;
  }

  try {
    const client = new DynamoDBClient({
      region: import.meta.env.VITE_AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
      },
    });

    dynamoClient = DynamoDBDocumentClient.from(client);
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
  return isConfigured();
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


