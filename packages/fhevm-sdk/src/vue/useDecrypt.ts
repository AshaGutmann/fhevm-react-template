/**
 * Vue composable for decrypting FHE values
 */

import { ref } from 'vue';
import type { Ref } from 'vue';
import { decryptValue, getFHEVMInstance } from '../core/fhevm';
import type { Signer } from 'ethers';

interface UseDecryptReturn {
  decrypt: (contractAddress: string, ciphertext: bigint, signer: Signer) => Promise<bigint>;
  isDecrypting: Ref<boolean>;
  error: Ref<Error | null>;
}

/**
 * Vue composable for decrypting FHE encrypted values
 */
export function useDecrypt(): UseDecryptReturn {
  const isDecrypting = ref(false);
  const error = ref<Error | null>(null);

  const decrypt = async (
    contractAddress: string,
    ciphertext: bigint,
    signer: Signer
  ): Promise<bigint> => {
    const instance = getFHEVMInstance();
    if (!instance) {
      throw new Error('FHEVM not initialized. Please initialize FHEVM first.');
    }

    isDecrypting.value = true;
    error.value = null;

    try {
      const decrypted = await decryptValue(contractAddress, ciphertext, signer);
      return decrypted;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Decryption failed');
      error.value = errorObj;
      throw errorObj;
    } finally {
      isDecrypting.value = false;
    }
  };

  return {
    decrypt,
    isDecrypting,
    error,
  };
}
