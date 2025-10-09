/**
 * Vue composable for encrypting values
 */

import { ref } from 'vue';
import type { Ref } from 'vue';
import { encryptValue, formatEncryptedInput, getFHEVMInstance } from '../core/fhevm';
import type { FHEType } from '../core/fhevm';

interface EncryptResult {
  data: Uint8Array;
  hash: string;
}

interface UseEncryptReturn {
  encrypt: (value: number | bigint | boolean, type?: FHEType) => Promise<EncryptResult>;
  isEncrypting: Ref<boolean>;
  error: Ref<Error | null>;
}

/**
 * Vue composable for encrypting values using FHE
 */
export function useEncrypt(): UseEncryptReturn {
  const isEncrypting = ref(false);
  const error = ref<Error | null>(null);

  const encrypt = async (
    value: number | bigint | boolean,
    type: FHEType = 'uint32'
  ): Promise<EncryptResult> => {
    const instance = getFHEVMInstance();
    if (!instance) {
      throw new Error('FHEVM not initialized. Please initialize FHEVM first.');
    }

    isEncrypting.value = true;
    error.value = null;

    try {
      const encrypted = await encryptValue(value, type);
      const formatted = formatEncryptedInput(encrypted);
      return formatted;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Encryption failed');
      error.value = errorObj;
      throw errorObj;
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    encrypt,
    isEncrypting,
    error,
  };
}
