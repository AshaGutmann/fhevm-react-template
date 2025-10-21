/**
 * Core FHEVM exports
 */

export {
  createFHEVMInstance,
  getFHEVMInstance,
  isInitialized,
  resetInstance,
  encryptValue,
  decryptValue,
  createEIP712Signature,
  validateFHEType,
  formatEncryptedInput,
} from './fhevm';

export type { FHEVMConfig, FHEType } from './fhevm';
