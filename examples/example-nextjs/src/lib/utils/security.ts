/**
 * Security utilities for FHE operations
 */

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate signature
 */
export function isValidSignature(signature: string): boolean {
  return /^0x[a-fA-F0-9]{130}$/.test(signature);
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate number range for FHE types
 */
export function validateRange(value: number, type: string): boolean {
  const ranges: Record<string, [bigint, bigint]> = {
    uint8: [0n, 255n],
    uint16: [0n, 65535n],
    uint32: [0n, 4294967295n],
    uint64: [0n, 18446744073709551615n],
  };

  const range = ranges[type];
  if (!range) return false;

  const bigValue = BigInt(value);
  return bigValue >= range[0] && bigValue <= range[1];
}

/**
 * Generate random nonce
 */
export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Hash data using simple hashing (for demo purposes)
 */
export function hashData(data: Uint8Array): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}
