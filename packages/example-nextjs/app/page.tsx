'use client';

import { useFHEVM, useEncrypt, useDecrypt } from '@fhevm/sdk';
import { useState } from 'react';

export default function Home() {
  const { isInitialized, isLoading } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const [value, setValue] = useState('100');
  const [encryptedHash, setEncryptedHash] = useState<string>('');
  const [decryptedValue, setDecryptedValue] = useState<string>('');

  const handleEncrypt = async () => {
    try {
      const result = await encrypt(Number(value), 'uint32');
      setEncryptedHash(result.hash);
      console.log('Encrypted:', result);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-lg">Initializing FHEVM SDK...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          FHEVM SDK Next.js Example
        </h1>

        <div className="card p-8 max-w-2xl mx-auto">
          <div className="mb-6">
            <div className={`badge ${isInitialized ? 'badge-success' : 'badge-error'}`}>
              {isInitialized ? '✓ SDK Initialized' : '✗ SDK Not Ready'}
            </div>
          </div>

          <div className="space-y-6">
            {/* Encryption Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Encrypt Value</h2>

              <div className="form-group">
                <label htmlFor="value" className="form-label">
                  Value to Encrypt
                </label>
                <input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="form-input"
                  placeholder="Enter a number"
                />
              </div>

              <button
                onClick={handleEncrypt}
                disabled={!isInitialized || isEncrypting}
                className="btn btn-primary w-full"
              >
                {isEncrypting ? (
                  <>
                    <span className="spinner spinner-sm mr-2"></span>
                    Encrypting...
                  </>
                ) : (
                  'Encrypt Value'
                )}
              </button>

              {encryptedHash && (
                <div className="mt-4 p-4 bg-bg-panel rounded-lg">
                  <p className="text-sm text-text-muted mb-2">Encrypted Hash:</p>
                  <code className="text-xs break-all">{encryptedHash}</code>
                </div>
              )}
            </div>

            {/* Features Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">SDK Features</h3>
              <ul className="space-y-2 text-text-muted">
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span>FHE encryption for privacy-preserving computations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span>EIP-712 signatures for secure decryption</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span>React hooks for easy integration</span>
                </li>
                <li className="flex items-start">
                  <span className="text-success mr-2">✓</span>
                  <span>TypeScript support with full type safety</span>
                </li>
              </ul>
            </div>

            {/* Code Example */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Usage Example</h3>
              <pre className="bg-bg-alt p-4 rounded-lg overflow-x-auto text-xs">
{`import { useFHEVM, useEncrypt } from '@fhevm/sdk';

function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

  const handleEncrypt = async () => {
    const result = await encrypt(100, 'uint32');
    console.log('Encrypted:', result.hash);
  };

  return (
    <button
      onClick={handleEncrypt}
      disabled={!isInitialized}
    >
      Encrypt Value
    </button>
  );
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="mt-8 text-center">
          <a
            href="https://github.com/your-username/fhevm-react-template"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-light"
          >
            View Documentation →
          </a>
        </div>
      </div>
    </main>
  );
}
