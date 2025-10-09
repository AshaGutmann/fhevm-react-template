/**
 * Utility functions for formatting FHE data
 */

/**
 * Format encrypted value for display
 */
export function formatEncryptedValue(encrypted: Uint8Array, maxLength = 20): string {
  const hex = Array.from(encrypted)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  if (hex.length <= maxLength) {
    return `0x${hex}`;
  }

  const start = hex.slice(0, maxLength / 2);
  const end = hex.slice(-maxLength / 2);
  return `0x${start}...${end}`;
}

/**
 * Convert Uint8Array to hex string
 */
export function uint8ArrayToHex(data: Uint8Array): string {
  return '0x' + Array.from(data)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function hexToUint8Array(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }

  return bytes;
}

/**
 * Serialize proof data for contract input
 */
export function serializeProof(proof: Uint8Array): string {
  return uint8ArrayToHex(proof);
}

/**
 * Format bigint for display
 */
export function formatBigInt(value: bigint, decimals = 0): string {
  if (decimals === 0) {
    return value.toString();
  }

  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  return `${integerPart}.${fractionalStr}`;
}
