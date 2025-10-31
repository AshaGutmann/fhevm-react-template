/**
 * API type definitions
 */

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EncryptAPIRequest {
  value: number;
  type: string;
}

export interface EncryptAPIResponse {
  encrypted: {
    data: string;
    type: string;
    timestamp: number;
  };
}

export interface DecryptAPIRequest {
  encryptedData: string;
  signature: string;
  contractAddress?: string;
}

export interface DecryptAPIResponse {
  decrypted: {
    value: number;
    verified: boolean;
    timestamp: number;
  };
}

export interface ComputeAPIRequest {
  operation: 'add' | 'sub' | 'mul' | 'div';
  operands: Array<string>;
}

export interface ComputeAPIResponse {
  result: {
    operation: string;
    encrypted: boolean;
    timestamp: number;
  };
}

export interface KeyManagementRequest {
  action: 'generate' | 'retrieve' | 'delete';
  keyId?: string;
}

export interface KeyManagementResponse {
  publicKey?: string;
  keys?: {
    publicKey: string;
    timestamp: number;
  };
}
