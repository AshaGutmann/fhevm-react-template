/**
 * Type definitions for FHE operations
 */

export type FHEType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256';

export interface EncryptedValue {
  data: Uint8Array;
  type: FHEType;
  hash: string;
}

export interface DecryptedValue {
  value: bigint;
  type: FHEType;
}

export interface FHEConfig {
  chainId: number;
  contractAddress?: string;
  publicKey?: string;
}

export interface EncryptionResult {
  ciphertext: Uint8Array;
  proof: Uint8Array;
  hash: string;
}

export interface DecryptionRequest {
  ciphertext: Uint8Array;
  signature: string;
  contractAddress: string;
  type: FHEType;
}

export interface ComputationRequest {
  operation: 'add' | 'sub' | 'mul' | 'div' | 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte';
  operands: Uint8Array[];
  type: FHEType;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface EIP712Message {
  domain: EIP712Domain;
  types: Record<string, any>;
  message: Record<string, any>;
}
