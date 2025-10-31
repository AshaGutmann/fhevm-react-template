/**
 * FHE-related TypeScript type definitions
 */

export type FHEType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256';

export interface FHEInstance {
  encrypt: (value: number, type: FHEType) => Promise<Uint8Array>;
  decrypt: (ciphertext: Uint8Array, type: FHEType) => Promise<bigint>;
  createEncryptedInput: (contractAddress: string) => any;
  getPublicKey: () => Uint8Array;
}

export interface EncryptionResult {
  ciphertext: Uint8Array;
  proof: Uint8Array;
  hash: string;
  type: FHEType;
}

export interface DecryptionResult {
  value: bigint;
  type: FHEType;
  verified: boolean;
}

export interface FHEProviderConfig {
  chainId: number;
  contractAddress?: string;
  autoInit?: boolean;
  publicKey?: string;
}

export interface FHEContextValue {
  instance: FHEInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  encrypt: (value: number, type: FHEType) => Promise<EncryptionResult>;
  decrypt: (ciphertext: Uint8Array, type: FHEType) => Promise<DecryptionResult>;
}
