/**
 * Encryption utilities for FHEVM
 * Provides helper functions for encrypting values using FHE
 */

import { getFHEVMInstance } from '../core/fhevm';
import type { FHEType } from '../core/fhevm';
import { EncryptionError } from './errors';

export interface EncryptedValue {
  data: Uint8Array;
  hash: string;
  type: FHEType;
}

/**
 * Encrypt a value using FHE
 * @param value - The value to encrypt (number, bigint, or boolean)
 * @param type - The FHE type to use for encryption
 * @returns Encrypted value with data and hash
 */
export async function encrypt(
  value: number | bigint | boolean,
  type: FHEType = 'uint32'
): Promise<EncryptedValue> {
  const instance = getFHEVMInstance();

  if (!instance) {
    throw new EncryptionError('FHEVM instance not initialized. Call createFHEVMInstance first.');
  }

  try {
    // Convert value based on type
    let numericValue: number | bigint | boolean = value;

    if (type === 'bool') {
      numericValue = Boolean(value);
    } else if (typeof value === 'string') {
      numericValue = BigInt(value);
    }

    // Encrypt using fhevmjs
    const encrypted = instance.encrypt(type, numericValue);

    // Format the encrypted data
    const hash = '0x' + Array.from(encrypted)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return {
      data: encrypted,
      hash,
      type
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new EncryptionError(
      `Failed to encrypt ${type} value: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Encrypt multiple values at once
 * @param values - Array of values with their types
 * @returns Array of encrypted values
 */
export async function encryptBatch(
  values: Array<{ value: number | bigint | boolean; type: FHEType }>
): Promise<EncryptedValue[]> {
  const results: EncryptedValue[] = [];

  for (const { value, type } of values) {
    const encrypted = await encrypt(value, type);
    results.push(encrypted);
  }

  return results;
}

/**
 * Prepare encrypted input for contract interaction
 * @param value - The value to encrypt
 * @param type - The FHE type
 * @returns Formatted input for contract calls
 */
export async function prepareEncryptedInput(
  value: number | bigint | boolean,
  type: FHEType = 'uint32'
): Promise<{ data: string; hash: string }> {
  const encrypted = await encrypt(value, type);

  return {
    data: encrypted.hash,
    hash: encrypted.hash
  };
}

/**
 * Validate if a value can be encrypted with the given type
 * @param value - The value to validate
 * @param type - The FHE type
 * @returns True if valid, false otherwise
 */
export function validateEncryptionInput(
  value: number | bigint | boolean,
  type: FHEType
): boolean {
  try {
    if (type === 'bool') {
      return typeof value === 'boolean' || value === 0 || value === 1;
    }

    const numValue = typeof value === 'bigint' ? value : BigInt(value);

    // Check ranges based on type
    switch (type) {
      case 'uint8':
        return numValue >= 0n && numValue <= 255n;
      case 'uint16':
        return numValue >= 0n && numValue <= 65535n;
      case 'uint32':
        return numValue >= 0n && numValue <= 4294967295n;
      case 'uint64':
        return numValue >= 0n && numValue <= 18446744073709551615n;
      case 'uint128':
      case 'uint256':
        return numValue >= 0n;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Convert encrypted data to hex string
 * @param data - Encrypted Uint8Array
 * @returns Hex string representation
 */
export function encryptedToHex(data: Uint8Array): string {
  return '0x' + Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Uint8Array
 */
export function hexToEncrypted(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }

  return bytes;
}
