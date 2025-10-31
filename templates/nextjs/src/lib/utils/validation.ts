/**
 * Validation utilities
 */

import { FHEType } from '../fhe/types';

/**
 * Validate FHE type
 */
export function isValidFHEType(type: string): type is FHEType {
  const validTypes: FHEType[] = [
    'bool',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'uint128',
    'uint256',
  ];
  return validTypes.includes(type as FHEType);
}

/**
 * Validate encrypted data format
 */
export function isValidEncryptedData(data: any): boolean {
  if (!data) return false;
  if (!(data instanceof Uint8Array)) return false;
  if (data.length === 0) return false;
  return true;
}

/**
 * Validate contract address
 */
export function isValidContractAddress(address: string): boolean {
  if (!address) return false;
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return false;
  return true;
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validate numeric value
 */
export function isValidNumericValue(value: any): boolean {
  if (typeof value === 'number') return !isNaN(value) && isFinite(value);
  if (typeof value === 'string') {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

/**
 * Validate operation type
 */
export function isValidOperation(operation: string): boolean {
  const validOps = ['add', 'sub', 'mul', 'div', 'eq', 'ne', 'lt', 'lte', 'gt', 'gte'];
  return validOps.includes(operation);
}
