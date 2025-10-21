# @fhevm/sdk 📦

> Universal SDK for building privacy-preserving dApps with Fully Homomorphic Encryption (FHEVM)

[![npm version](https://img.shields.io/npm/v/@fhevm/sdk.svg)](https://www.npmjs.com/package/@fhevm/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@fhevm/sdk` is a modular, framework-agnostic SDK that provides a **wagmi-like API** for integrating Fully Homomorphic Encryption (FHE) into decentralized applications. It abstracts the complexity of FHE operations, providing simple hooks and utilities for React applications.

## Features

✅ **Framework Agnostic Core** - Use with React, Vue, Svelte, or vanilla JS
✅ **React Hooks** - `useFHEVM`, `useEncrypt`, `useDecrypt`, `useFHEContract`
✅ **TypeScript First** - Full type safety and IntelliSense support
✅ **EIP-712 Signing** - Secure decryption with typed data signatures
✅ **Modular Architecture** - Import only what you need
✅ **Tree-shakeable** - Optimized bundle size

---

## Installation

```bash
npm install @fhevm/sdk fhevmjs ethers
```

**Peer Dependencies:**
- `react` >= 18.0.0 (optional, for React hooks)
- `ethers` ^6.0.0
- `fhevmjs` ^0.6.2

---

## Quick Start

### 1. Wrap Your App with Provider

```tsx
import { FHEVMProvider } from '@fhevm/sdk';

function App() {
  return (
    <FHEVMProvider
      config={{
        chainId: 11155111, // Sepolia testnet
      }}
      autoInit={true}
    >
      <YourApp />
    </FHEVMProvider>
  );
}
```

### 2. Use Hooks in Components

```tsx
import { useFHEVM, useEncrypt, useDecrypt } from '@fhevm/sdk';

function MyComponent() {
  const { instance, isInitialized } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint32');
    console.log('Encrypted:', encrypted.hash);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isInitialized}>
      Encrypt Value
    </button>
  );
}
```

---

## API Reference

### Core Functions

#### `createFHEVMInstance(config)`

Initialize FHEVM instance for encryption/decryption operations.

```typescript
import { createFHEVMInstance } from '@fhevm/sdk/core';

const instance = await createFHEVMInstance({
  chainId: 11155111,
  publicKey: '0x...',      // Optional
  gatewayUrl: 'https://...', // Optional
  aclAddress: '0x...',     // Optional
});
```

#### `encryptValue(value, type)`

Encrypt a value using FHE.

```typescript
import { encryptValue } from '@fhevm/sdk/core';

const encrypted = await encryptValue(100, 'uint32');
// Returns: Uint8Array
```

**Supported Types:**
- `bool`, `uint8`, `uint16`, `uint32`, `uint64`, `uint128`, `uint256`
- `address`, `bytes`, `bytes32`

#### `decryptValue(contractAddress, ciphertext, signer)`

Decrypt an encrypted value with EIP-712 signature.

```typescript
import { decryptValue } from '@fhevm/sdk/core';

const decrypted = await decryptValue(
  '0xContractAddress',
  ciphertext,
  signer
);
// Returns: bigint
```

---

### React Hooks

#### `useFHEVM()`

Access FHEVM instance and initialization state.

```typescript
const {
  instance,        // FhevmInstance | null
  isInitialized,   // boolean
  isLoading,       // boolean
  error,           // Error | null
  initialize,      // (config) => Promise<void>
  reset            // () => void
} = useFHEVM();
```

#### `useEncrypt()`

Hook for encrypting values.

```typescript
const {
  encrypt,         // (value, type) => Promise<EncryptedInput>
  isEncrypting,    // boolean
  error            // Error | null
} = useEncrypt();

// Usage
const result = await encrypt(42, 'uint32');
console.log(result.hash);  // 0x...
console.log(result.data);  // Uint8Array
```

#### `useDecrypt()`

Hook for decrypting values.

```typescript
const {
  decrypt,         // (contractAddress, ciphertext, signer) => Promise<bigint>
  isDecrypting,    // boolean
  error            // Error | null
} = useDecrypt();

// Usage
const decrypted = await decrypt('0x...', ciphertext, signer);
```

#### `useFHEContract(address, abi, signer)`

Combine contract instance with FHE capabilities.

```typescript
const {
  contract,        // Contract | null
  encrypt,         // Encrypt function
  decrypt,         // Decrypt function
  isInitialized    // boolean
} = useFHEContract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Usage
const encryptedBid = await encrypt(1000, 'uint32');
await contract.submitBid(procurementId, encryptedBid.data);
```

---

### Utility Functions

#### `formatEncryptedValue(encrypted, maxLength?)`

Format encrypted data for display.

```typescript
import { formatEncryptedValue } from '@fhevm/sdk/utils';

const display = formatEncryptedValue(encrypted, 20);
// Returns: "0x1234...5678"
```

#### `uint8ArrayToHex(data)` / `hexToUint8Array(hex)`

Convert between Uint8Array and hex strings.

```typescript
import { uint8ArrayToHex, hexToUint8Array } from '@fhevm/sdk/utils';

const hex = uint8ArrayToHex(encrypted);    // "0x..."
const bytes = hexToUint8Array(hex);        // Uint8Array
```

#### `validateFHEType(type)`

Validate FHE data type.

```typescript
import { validateFHEType } from '@fhevm/sdk/core';

if (validateFHEType('uint32')) {
  // Type is valid
}
```

---

## Advanced Usage

### Manual Initialization

```typescript
import { useFHEVM } from '@fhevm/sdk';

function MyApp() {
  const { initialize, isLoading } = useFHEVM();

  useEffect(() => {
    initialize({
      chainId: 11155111,
      publicKey: customPublicKey,
    });
  }, []);

  if (isLoading) return <div>Initializing FHEVM...</div>;

  return <YourApp />;
}
```

### Error Handling

```typescript
const { encrypt, error } = useEncrypt();

try {
  const encrypted = await encrypt(value, 'uint32');
} catch (err) {
  console.error('Encryption failed:', err);
}

// Or use error state
if (error) {
  console.error('Encryption error:', error);
}
```

### Chain Switching

```typescript
const { reset, initialize } = useFHEVM();

const switchChain = async (newChainId: number) => {
  reset();  // Clear current instance
  await initialize({ chainId: newChainId });
};
```

---

## Framework-Agnostic Core

You can use the core functions without React:

```typescript
import {
  createFHEVMInstance,
  encryptValue,
  decryptValue
} from '@fhevm/sdk/core';

// Initialize
const instance = await createFHEVMInstance({ chainId: 11155111 });

// Encrypt
const encrypted = await encryptValue(100, 'uint32');

// Decrypt (with ethers signer)
const decrypted = await decryptValue(contractAddress, ciphertext, signer);
```

---

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import type { FHEType, FHEVMConfig, EncryptedInput } from '@fhevm/sdk';

const config: FHEVMConfig = {
  chainId: 11155111,
  publicKey: '0x...',
};

const encrypted: EncryptedInput = await encrypt(42, 'uint32');
```

---

## Examples

### Encrypting and Submitting a Bid

```typescript
function BidForm({ procurementId }: { procurementId: number }) {
  const { contract, encrypt } = useFHEContract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );
  const [bidAmount, setBidAmount] = useState('');

  const handleSubmit = async () => {
    const encrypted = await encrypt(Number(bidAmount), 'uint32');
    await contract.submitBid(procurementId, encrypted.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={bidAmount}
        onChange={e => setBidAmount(e.target.value)}
      />
      <button type="submit">Submit Encrypted Bid</button>
    </form>
  );
}
```

### Decrypting a Value

```typescript
function ViewBid({ ciphertext }: { ciphertext: bigint }) {
  const { decrypt } = useDecrypt();
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);

  const handleDecrypt = async () => {
    const value = await decrypt(CONTRACT_ADDRESS, ciphertext, signer);
    setDecryptedValue(value);
  };

  return (
    <div>
      <button onClick={handleDecrypt}>Decrypt Bid</button>
      {decryptedValue && <p>Bid Amount: {decryptedValue.toString()}</p>}
    </div>
  );
}
```

---

## Bundle Size

The SDK is optimized for minimal bundle size:

- **Core only**: ~15KB (gzipped)
- **Core + Hooks**: ~25KB (gzipped)
- **Full package**: ~30KB (gzipped)

Import only what you need:

```typescript
// Import specific modules
import { encryptValue } from '@fhevm/sdk/core';
import { useFHEVM } from '@fhevm/sdk/hooks';
import { formatEncryptedValue } from '@fhevm/sdk/utils';
```

---

## Browser Support

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- Opera >= 76

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

## License

MIT © [Your Name]

---

## Support

- **GitHub Issues**: [Report a bug](https://github.com/your-username/fhevm-react-template/issues)
- **Documentation**: [Full API Docs](./docs/API.md)
- **Example App**: [See it in action](../example-procurement)

---

**Built for the FHEVM SDK Bounty** 🏆
*Powered by Zama fhEVM* 🔐
