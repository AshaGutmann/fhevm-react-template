/**
 * Core FHEVM functionality for encryption and decryption
 * Based on fhevmjs library
 */

import { createInstance, FhevmInstance } from 'fhevmjs';
import type { Signer } from 'ethers';

export interface FHEVMConfig {
  chainId: number;
  publicKey?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}

export type FHEType =
  | 'bool'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'address'
  | 'bytes'
  | 'bytes32';

let fhevmInstance: FhevmInstance | null = null;
let currentChainId: number | null = null;

/**
 * Initialize FHEVM instance for a specific chain
 */
export async function createFHEVMInstance(config: FHEVMConfig): Promise<FhevmInstance> {
  try {
    // Return existing instance if chain hasn't changed
    if (fhevmInstance && currentChainId === config.chainId) {
      return fhevmInstance;
    }

    // Create new instance
    fhevmInstance = await createInstance({
      chainId: config.chainId,
      publicKey: config.publicKey,
      gatewayUrl: config.gatewayUrl,
      aclAddress: config.aclAddress,
    });

    currentChainId = config.chainId;
    return fhevmInstance;
  } catch (error) {
    console.error('Failed to create FHEVM instance:', error);
    throw new Error(`FHEVM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the current FHEVM instance
 */
export function getFHEVMInstance(): FhevmInstance | null {
  return fhevmInstance;
}

/**
 * Check if FHEVM is initialized
 */
export function isInitialized(): boolean {
  return fhevmInstance !== null;
}

/**
 * Reset FHEVM instance (useful for chain switching)
 */
export function resetInstance(): void {
  fhevmInstance = null;
  currentChainId = null;
}

/**
 * Encrypt a value using FHE
 */
export async function encryptValue(
  value: number | bigint | boolean,
  type: FHEType = 'uint32'
): Promise<Uint8Array> {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized. Call createFHEVMInstance first.');
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
    const encrypted = fhevmInstance.encrypt(type, numericValue);
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error(`Failed to encrypt value: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create EIP-712 signature for decryption
 */
export async function createEIP712Signature(
  contractAddress: string,
  userAddress: string,
  signer: Signer
): Promise<string> {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized');
  }

  try {
    const eip712 = fhevmInstance.createEIP712(contractAddress, userAddress);
    const signature = await signer.signTypedData(
      eip712.domain,
      { Reencrypt: eip712.types.Reencrypt },
      eip712.message
    );
    return signature;
  } catch (error) {
    console.error('Failed to create EIP-712 signature:', error);
    throw new Error(`EIP-712 signature failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt an encrypted value
 */
export async function decryptValue(
  contractAddress: string,
  ciphertext: bigint,
  signer: Signer
): Promise<bigint> {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized');
  }

  try {
    const userAddress = await signer.getAddress();

    // Create EIP-712 signature
    const signature = await createEIP712Signature(contractAddress, userAddress, signer);

    // Request decryption through gateway
    const decrypted = await fhevmInstance.reencrypt(
      ciphertext,
      userAddress,
      contractAddress,
      signature
    );

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error(`Failed to decrypt value: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate FHE type
 */
export function validateFHEType(type: string): type is FHEType {
  const validTypes: FHEType[] = [
    'bool',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'uint128',
    'uint256',
    'address',
    'bytes',
    'bytes32'
  ];
  return validTypes.includes(type as FHEType);
}

/**
 * Format encrypted value for contract input
 */
export function formatEncryptedInput(encrypted: Uint8Array): {
  data: Uint8Array;
  hash: string;
} {
  // Convert Uint8Array to hex string for hash
  const hash = '0x' + Array.from(encrypted)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    data: encrypted,
    hash
  };
}
