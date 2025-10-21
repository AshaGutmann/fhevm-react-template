/**
 * Error handling utilities for FHEVM SDK
 */

export class FHEVMError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'FHEVMError';
  }
}

export class InitializationError extends FHEVMError {
  constructor(message: string, details?: unknown) {
    super(message, 'INITIALIZATION_ERROR', details);
    this.name = 'InitializationError';
  }
}

export class EncryptionError extends FHEVMError {
  constructor(message: string, details?: unknown) {
    super(message, 'ENCRYPTION_ERROR', details);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends FHEVMError {
  constructor(message: string, details?: unknown) {
    super(message, 'DECRYPTION_ERROR', details);
    this.name = 'DecryptionError';
  }
}

export class SignatureError extends FHEVMError {
  constructor(message: string, details?: unknown) {
    super(message, 'SIGNATURE_ERROR', details);
    this.name = 'SignatureError';
  }
}

export class ValidationError extends FHEVMError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'FHEVM instance not initialized. Call createFHEVMInstance first.',
  INVALID_TYPE: 'Invalid FHE type. Must be one of: bool, uint8, uint16, uint32, uint64, uint128, uint256, address, bytes, bytes32',
  INVALID_VALUE: 'Invalid value for encryption',
  SIGNATURE_FAILED: 'Failed to create EIP-712 signature',
  DECRYPTION_FAILED: 'Failed to decrypt value',
  PROVIDER_MISSING: 'FHEVMProvider is required. Wrap your app with <FHEVMProvider>',
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  WRONG_NETWORK: 'Wrong network. Please switch to the correct network',
} as const;

/**
 * Parse error and return user-friendly message
 */
export function parseError(error: unknown): string {
  if (error instanceof FHEVMError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Parse common Web3 errors
    if (error.message.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection';
    }
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Check if error is specific type
 */
export function isEncryptionError(error: unknown): error is EncryptionError {
  return error instanceof EncryptionError;
}

export function isDecryptionError(error: unknown): error is DecryptionError {
  return error instanceof DecryptionError;
}

export function isInitializationError(error: unknown): error is InitializationError {
  return error instanceof InitializationError;
}

/**
 * Retry helper for transient errors
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on user rejection or validation errors
      if (
        lastError.message.includes('user rejected') ||
        error instanceof ValidationError
      ) {
        throw lastError;
      }

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }

  throw lastError!;
}
