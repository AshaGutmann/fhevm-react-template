/**
 * Decryption utilities for FHEVM
 * Provides helper functions for decrypting FHE-encrypted values
 */

import { getFHEVMInstance } from '../core/fhevm';
import type { Signer } from 'ethers';
import { DecryptionError, SignatureError } from './errors';

export interface DecryptionRequest {
  contractAddress: string;
  ciphertext: bigint;
  userAddress?: string;
}

export interface DecryptionResult {
  value: bigint;
  timestamp: number;
}

/**
 * Create EIP-712 signature for decryption
 * @param contractAddress - Address of the contract
 * @param userAddress - Address of the user
 * @param signer - Ethers signer instance
 * @returns EIP-712 signature
 */
export async function createDecryptSignature(
  contractAddress: string,
  userAddress: string,
  signer: Signer
): Promise<string> {
  const instance = getFHEVMInstance();

  if (!instance) {
    throw new SignatureError('FHEVM instance not initialized');
  }

  try {
    const eip712 = instance.createEIP712(contractAddress, userAddress);
    const signature = await signer.signTypedData(
      eip712.domain,
      { Reencrypt: eip712.types.Reencrypt },
      eip712.message
    );
    return signature;
  } catch (error) {
    console.error('Failed to create EIP-712 signature:', error);
    throw new SignatureError(
      `EIP-712 signature failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypt an encrypted value
 * @param contractAddress - Address of the contract
 * @param ciphertext - Encrypted value to decrypt
 * @param signer - Ethers signer instance
 * @returns Decrypted value
 */
export async function decrypt(
  contractAddress: string,
  ciphertext: bigint,
  signer: Signer
): Promise<bigint> {
  const instance = getFHEVMInstance();

  if (!instance) {
    throw new DecryptionError('FHEVM instance not initialized');
  }

  try {
    const userAddress = await signer.getAddress();

    // Create EIP-712 signature
    const signature = await createDecryptSignature(contractAddress, userAddress, signer);

    // Request decryption through gateway
    const decrypted = await instance.reencrypt(
      ciphertext,
      userAddress,
      contractAddress,
      signature
    );

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new DecryptionError(
      `Failed to decrypt value: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypt with automatic retry on failure
 * @param contractAddress - Address of the contract
 * @param ciphertext - Encrypted value to decrypt
 * @param signer - Ethers signer instance
 * @param maxRetries - Maximum number of retry attempts
 * @returns Decrypted value
 */
export async function decryptWithRetry(
  contractAddress: string,
  ciphertext: bigint,
  signer: Signer,
  maxRetries: number = 3
): Promise<bigint> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await decrypt(contractAddress, ciphertext, signer);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries - 1) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  throw new DecryptionError(
    `Decryption failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Decrypt multiple values in batch
 * @param requests - Array of decryption requests
 * @param signer - Ethers signer instance
 * @returns Array of decrypted values
 */
export async function decryptBatch(
  requests: Array<{ contractAddress: string; ciphertext: bigint }>,
  signer: Signer
): Promise<bigint[]> {
  const results: bigint[] = [];

  for (const request of requests) {
    const decrypted = await decrypt(request.contractAddress, request.ciphertext, signer);
    results.push(decrypted);
  }

  return results;
}

/**
 * User-initiated decryption with EIP-712 signature
 * @param request - Decryption request details
 * @param signer - Ethers signer instance
 * @returns Decryption result with timestamp
 */
export async function userDecrypt(
  request: DecryptionRequest,
  signer: Signer
): Promise<DecryptionResult> {
  const value = await decrypt(request.contractAddress, request.ciphertext, signer);

  return {
    value,
    timestamp: Date.now()
  };
}

/**
 * Public decryption (for publicly accessible encrypted data)
 * Note: This still requires proper gateway setup
 * @param contractAddress - Address of the contract
 * @param ciphertext - Encrypted value to decrypt
 * @returns Decrypted value
 */
export async function publicDecrypt(
  contractAddress: string,
  ciphertext: bigint
): Promise<bigint> {
  const instance = getFHEVMInstance();

  if (!instance) {
    throw new DecryptionError('FHEVM instance not initialized');
  }

  try {
    // For public decryption, we might need a different approach
    // This is a placeholder - actual implementation depends on gateway setup
    throw new DecryptionError('Public decryption not yet implemented');
  } catch (error) {
    throw new DecryptionError(
      `Public decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate decryption request
 * @param request - Decryption request to validate
 * @returns True if valid, false otherwise
 */
export function validateDecryptionRequest(request: DecryptionRequest): boolean {
  try {
    // Check contract address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(request.contractAddress)) {
      return false;
    }

    // Check ciphertext is a valid bigint
    if (typeof request.ciphertext !== 'bigint') {
      return false;
    }

    // Check user address if provided
    if (request.userAddress && !/^0x[a-fA-F0-9]{40}$/.test(request.userAddress)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Format decrypted value based on original type
 * @param value - Decrypted bigint value
 * @param targetType - Target type for formatting
 * @returns Formatted value
 */
export function formatDecryptedValue(
  value: bigint,
  targetType: 'number' | 'string' | 'boolean' | 'bigint' = 'bigint'
): number | string | boolean | bigint {
  switch (targetType) {
    case 'number':
      return Number(value);
    case 'string':
      return value.toString();
    case 'boolean':
      return value !== 0n;
    case 'bigint':
    default:
      return value;
  }
}
