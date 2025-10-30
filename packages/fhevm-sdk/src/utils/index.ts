/**
 * Utility exports
 */

export {
  formatEncryptedValue,
  uint8ArrayToHex,
  hexToUint8Array,
  serializeProof,
  formatBigInt,
} from './format';

export {
  FHEVMError,
  InitializationError,
  EncryptionError,
  DecryptionError,
  SignatureError,
  ValidationError,
  ERROR_MESSAGES,
  parseError,
  isEncryptionError,
  isDecryptionError,
  isInitializationError,
  retryOperation,
} from './errors';

export {
  debugger,
  enableDebug,
  disableDebug,
  logDebug,
  logInfo,
  logWarn,
  logError,
} from './debug';

export {
  encrypt,
  encryptBatch,
  prepareEncryptedInput,
  validateEncryptionInput,
  encryptedToHex,
  hexToEncrypted,
} from './encryption';

export {
  decrypt,
  decryptWithRetry,
  decryptBatch,
  userDecrypt,
  publicDecrypt,
  createDecryptSignature,
  validateDecryptionRequest,
  formatDecryptedValue,
} from './decryption';

export type { LogLevel } from './debug';
export type { EncryptedValue } from './encryption';
export type { DecryptionRequest, DecryptionResult } from './decryption';
