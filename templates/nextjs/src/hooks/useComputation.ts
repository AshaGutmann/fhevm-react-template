'use client';

import { useState, useCallback } from 'react';
import { useFHEVM, useEncrypt } from '@fhevm/sdk';

/**
 * Hook for homomorphic computations
 */
export function useComputation() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();
  const [isComputing, setIsComputing] = useState(false);
  const [computationHistory, setComputationHistory] = useState<
    Array<{
      operation: string;
      operands: number[];
      result: string;
      timestamp: number;
    }>
  >([]);

  const compute = useCallback(
    async (
      operation: 'add' | 'sub' | 'mul',
      operand1: number,
      operand2: number,
      type: 'uint8' | 'uint16' | 'uint32' | 'uint64' = 'uint32'
    ) => {
      if (!isInitialized) {
        throw new Error('FHEVM not initialized');
      }

      setIsComputing(true);
      try {
        // Encrypt both operands
        const encrypted1 = await encrypt(operand1, type);
        const encrypted2 = await encrypt(operand2, type);

        // In production, perform actual homomorphic computation
        // For demo, simulate the computation
        let result: string;
        switch (operation) {
          case 'add':
            result = `encrypted(${operand1} + ${operand2})`;
            break;
          case 'sub':
            result = `encrypted(${operand1} - ${operand2})`;
            break;
          case 'mul':
            result = `encrypted(${operand1} × ${operand2})`;
            break;
          default:
            throw new Error('Unsupported operation');
        }

        setComputationHistory(prev => [
          ...prev,
          {
            operation,
            operands: [operand1, operand2],
            result,
            timestamp: Date.now(),
          },
        ]);

        return {
          success: true,
          result,
          encrypted1: encrypted1.hash,
          encrypted2: encrypted2.hash,
        };
      } finally {
        setIsComputing(false);
      }
    },
    [isInitialized, encrypt]
  );

  const clearHistory = useCallback(() => {
    setComputationHistory([]);
  }, []);

  return {
    compute,
    isComputing,
    computationHistory,
    clearHistory,
    isInitialized,
  };
}
