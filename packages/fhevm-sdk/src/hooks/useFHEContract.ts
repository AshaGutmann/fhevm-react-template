/**
 * Hook for interacting with FHE-enabled smart contracts
 */

import { useState, useCallback, useMemo } from 'react';
import { Contract, ContractInterface, Signer } from 'ethers';
import { useFHEVM } from './useFHEVM';
import { useEncrypt } from './useEncrypt';
import { useDecrypt } from './useDecrypt';

interface UseFHEContractReturn {
  contract: Contract | null;
  encrypt: ReturnType<typeof useEncrypt>['encrypt'];
  decrypt: ReturnType<typeof useDecrypt>['decrypt'];
  isInitialized: boolean;
}

/**
 * Hook for interacting with FHE-enabled smart contracts
 * Combines contract instance with encryption/decryption capabilities
 */
export function useFHEContract(
  address: string,
  abi: ContractInterface,
  signer?: Signer
): UseFHEContractReturn {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();

  const contract = useMemo(() => {
    if (!address || !abi) {
      return null;
    }

    try {
      return new Contract(address, abi, signer);
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      return null;
    }
  }, [address, abi, signer]);

  return {
    contract,
    encrypt,
    decrypt,
    isInitialized,
  };
}
