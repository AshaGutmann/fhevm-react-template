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

export type { LogLevel } from './debug';
