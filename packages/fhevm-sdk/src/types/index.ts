/**
 * TypeScript type definitions for FHEVM SDK
 */

import type { FhevmInstance } from 'fhevmjs';

export type { FhevmInstance };

/**
 * Encrypted input data structure
 */
export interface EncryptedInput {
  data: Uint8Array;
  hash: string;
}

/**
 * Decryption request parameters
 */
export interface DecryptionParams {
  contractAddress: string;
  ciphertext: bigint;
  userAddress: string;
}

/**
 * EIP-712 domain for signing
 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

/**
 * EIP-712 message for reencryption
 */
export interface ReencryptMessage {
  publicKey: string;
  signature: string;
}
