'use client';

import { useFHEVM } from '@fhevm/sdk';
import { EncryptionDemo } from '../components/fhe/EncryptionDemo';
import { ComputationDemo } from '../components/fhe/ComputationDemo';
import { KeyManager } from '../components/fhe/KeyManager';
import { BankingExample } from '../components/examples/BankingExample';
import { MedicalExample } from '../components/examples/MedicalExample';

export default function Home() {
  const { isInitialized, isLoading } = useFHEVM();

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto"></div>
          <p className="text-lg">Initializing FHEVM SDK...</p>
          <p className="text-sm text-gray-600 mt-2">Setting up encryption environment</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FHEVM SDK Next.js Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Privacy-Preserving Smart Contracts with Fully Homomorphic Encryption
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <div className={`badge ${isInitialized ? 'badge-success' : 'badge-error'} text-base px-4 py-2`}>
              {isInitialized ? '✓ SDK Initialized' : '✗ SDK Not Ready'}
            </div>
            <div className="badge bg-blue-100 text-blue-800 text-base px-4 py-2">
              Next.js 14+
            </div>
            <div className="badge bg-purple-100 text-purple-800 text-base px-4 py-2">
              FHEVM 0.6.2
            </div>
          </div>
        </header>

        {/* SDK Status Warning */}
        {!isInitialized && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">
              ⚠️ FHEVM SDK is not initialized. Some features may not work correctly.
            </p>
          </div>
        )}

        {/* Core Features Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Core FHE Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EncryptionDemo />
            <ComputationDemo />
            <KeyManager />
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Real-World Applications</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BankingExample />
            <MedicalExample />
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">SDK Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: '🔐',
                title: 'Encryption',
                description: 'Encrypt sensitive data with FHE',
              },
              {
                icon: '🔓',
                title: 'Decryption',
                description: 'Secure EIP-712 based decryption',
              },
              {
                icon: '🧮',
                title: 'Computation',
                description: 'Homomorphic operations on encrypted data',
              },
              {
                icon: '🔑',
                title: 'Key Management',
                description: 'Generate and manage encryption keys',
              },
              {
                icon: '⚛️',
                title: 'React Hooks',
                description: 'Easy integration with React apps',
              },
              {
                icon: '📦',
                title: 'TypeScript',
                description: 'Full type safety and IntelliSense',
              },
              {
                icon: '🚀',
                title: 'Next.js Ready',
                description: 'Works with App Router & RSC',
              },
              {
                icon: '🔗',
                title: 'Smart Contracts',
                description: 'Seamless contract integration',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Start Code Example */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
          <div className="card bg-gray-900 text-white">
            <pre className="overflow-x-auto text-sm">
{`import { FHEVMProvider, useFHEVM, useEncrypt } from '@fhevm/sdk';

// Wrap your app
function App() {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }} autoInit>
      <YourApp />
    </FHEVMProvider>
  );
}

// Use in components
function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

  const handleEncrypt = async () => {
    const result = await encrypt(42, 'uint32');
    console.log('Encrypted:', result.hash);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isInitialized}>
      Encrypt Value
    </button>
  );
}`}
            </pre>
          </div>
        </section>

        {/* Resources Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://github.com/AshaGutmann/fhevm-react-template"
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-all hover:scale-105"
            >
              <h3 className="font-bold mb-2 text-blue-600">📚 Documentation</h3>
              <p className="text-sm text-gray-600">
                Complete API reference and guides
              </p>
            </a>
            <a
              href="https://github.com/AshaGutmann/fhevm-react-template/tree/main/packages/fhevm-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-all hover:scale-105"
            >
              <h3 className="font-bold mb-2 text-green-600">💻 Source Code</h3>
              <p className="text-sm text-gray-600">
                View SDK source on GitHub
              </p>
            </a>
            <a
              href="https://ashagutmann.github.io/BuildingMaterialProcurement/"
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:shadow-lg transition-all hover:scale-105"
            >
              <h3 className="font-bold mb-2 text-purple-600">🎮 Live Demo</h3>
              <p className="text-sm text-gray-600">
                Try the procurement example app
              </p>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>Built with ❤️ using FHEVM SDK</p>
          <p className="text-sm mt-2">
            Powered by Zama fhEVM • Next.js 14 • React 18
          </p>
        </footer>
      </div>
    </main>
  );
}
