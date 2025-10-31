'use client';

import { useState } from 'react';
import { useFHEVM, useEncrypt } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Encryption Demo Component
 * Demonstrates FHE encryption capabilities
 */
export function EncryptionDemo() {
  const { isInitialized, isLoading } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();

  const [value, setValue] = useState('');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'uint8' | 'uint16' | 'uint32' | 'uint64'>('uint32');

  const handleEncrypt = async () => {
    if (!value) return;

    try {
      const result = await encrypt(Number(value), selectedType);
      setEncryptedData(result.hash);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Card title="Encryption Demo">
        <div className="flex justify-center items-center py-8">
          <span className="spinner"></span>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Encryption Demo"
      description="Encrypt values using Fully Homomorphic Encryption"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className={`badge ${isInitialized ? 'badge-success' : 'badge-error'}`}>
            {isInitialized ? '✓ FHEVM Ready' : '✗ Not Initialized'}
          </span>
        </div>

        <Input
          type="number"
          label="Value to Encrypt"
          placeholder="Enter a number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="form-group">
          <label className="form-label">Encryption Type</label>
          <select
            className="form-input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
          >
            <option value="uint8">uint8</option>
            <option value="uint16">uint16</option>
            <option value="uint32">uint32</option>
            <option value="uint64">uint64</option>
          </select>
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={!isInitialized || !value}
          isLoading={isEncrypting}
          className="w-full"
        >
          Encrypt Value
        </Button>

        {encryptedData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Encrypted Hash:</p>
            <code className="text-xs break-all text-gray-600">{encryptedData}</code>
          </div>
        )}
      </div>
    </Card>
  );
}
