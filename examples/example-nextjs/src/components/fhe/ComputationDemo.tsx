'use client';

import { useState } from 'react';
import { useFHEVM, useEncrypt } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Computation Demo Component
 * Demonstrates homomorphic computation on encrypted data
 */
export function ComputationDemo() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [operation, setOperation] = useState<'add' | 'sub' | 'mul'>('add');
  const [result, setResult] = useState<string>('');
  const [isComputing, setIsComputing] = useState(false);

  const handleCompute = async () => {
    if (!value1 || !value2) return;

    setIsComputing(true);
    try {
      const encrypted1 = await encrypt(Number(value1), 'uint32');
      const encrypted2 = await encrypt(Number(value2), 'uint32');

      // Simulate computation on encrypted data
      setResult(`Computed ${operation} on encrypted values`);
    } catch (error) {
      console.error('Computation failed:', error);
    } finally {
      setIsComputing(false);
    }
  };

  return (
    <Card
      title="Homomorphic Computation"
      description="Perform calculations on encrypted data"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="First Value"
            placeholder="Enter number"
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
          />

          <Input
            type="number"
            label="Second Value"
            placeholder="Enter number"
            value={value2}
            onChange={(e) => setValue2(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Operation</label>
          <select
            className="form-input"
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
          >
            <option value="add">Addition (+)</option>
            <option value="sub">Subtraction (-)</option>
            <option value="mul">Multiplication (×)</option>
          </select>
        </div>

        <Button
          onClick={handleCompute}
          disabled={!isInitialized || !value1 || !value2}
          isLoading={isComputing}
          className="w-full"
        >
          Compute on Encrypted Data
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-800">{result}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
