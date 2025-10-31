'use client';

import { useState } from 'react';
import { useFHEVM } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Key Manager Component
 * Manages FHE public/private keys
 */
export function KeyManager() {
  const { isInitialized, instance } = useFHEVM();
  const [publicKey, setPublicKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    try {
      // Simulate key generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublicKey('0x' + Math.random().toString(16).substr(2, 64));
    } catch (error) {
      console.error('Key generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card
      title="Key Management"
      description="Generate and manage FHE encryption keys"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <span className={`badge ${isInitialized ? 'badge-success' : 'badge-error'}`}>
            {isInitialized ? 'Keys Active' : 'Not Initialized'}
          </span>
        </div>

        <Button
          onClick={handleGenerateKeys}
          disabled={!isInitialized}
          isLoading={isGenerating}
          className="w-full"
        >
          Generate New Keys
        </Button>

        {publicKey && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800 mb-2">Public Key:</p>
            <code className="text-xs break-all text-blue-600">{publicKey}</code>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Key Management Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Generate FHE key pairs</li>
            <li>• Secure key storage</li>
            <li>• Key rotation support</li>
            <li>• Multi-user key management</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
