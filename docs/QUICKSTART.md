# Quick Start Guide

## Installation

### Using the SDK in your project

```bash
npm install @fhevm/sdk
```

### Clone and run examples

```bash
# Clone the repository
git clone https://github.com/AshaGutmann/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm run install:all

# Compile contracts
npm run compile

# Run example apps
npm run dev
```

## Basic Usage

### React Application

```typescript
import { FHEVMProvider, useFHEVM, useEncrypt } from '@fhevm/sdk';

// 1. Wrap your app with FHEVMProvider
function App() {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }} autoInit>
      <YourApp />
    </FHEVMProvider>
  );
}

// 2. Use hooks in your components
function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

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

### Next.js Application

```typescript
// app/providers.tsx
'use client';

import { FHEVMProvider } from '@fhevm/sdk';

export function Providers({ children }) {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }} autoInit>
      {children}
    </FHEVMProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Vanilla JavaScript/TypeScript

```typescript
import { createFHEVMInstance, encrypt, decrypt } from '@fhevm/sdk/core';
import { ethers } from 'ethers';

// Initialize FHEVM
const instance = await createFHEVMInstance({
  chainId: 11155111,
});

// Encrypt a value
const encrypted = await encrypt(42, 'uint32');
console.log('Encrypted hash:', encrypted.hash);

// Decrypt a value (requires signer)
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const decrypted = await decrypt(contractAddress, ciphertext, signer);
console.log('Decrypted value:', decrypted);
```

## Examples

### 1. Next.js Example

```bash
cd examples/example-nextjs
npm install
npm run dev
```

Visit http://localhost:3000 to see the demo.

### 2. Procurement Platform (Vite)

```bash
cd examples/example-procurement
npm install
npm run dev
```

Visit http://localhost:5173 to see the procurement platform.

## Key Features

- **Framework Agnostic Core** - Works with React, Vue, Next.js, and vanilla JS
- **React Hooks** - `useFHEVM`, `useEncrypt`, `useDecrypt`, `useFHEContract`
- **TypeScript Support** - Full type safety and IntelliSense
- **EIP-712 Signing** - Secure user decryption flow
- **Modular Design** - Import only what you need

## Next Steps

- [Full API Documentation](../packages/fhevm-sdk/docs/API.md)
- [Framework Integration Guide](../packages/fhevm-sdk/docs/FRAMEWORK_INTEGRATION.md)
- [SDK Package README](../packages/fhevm-sdk/README.md)
- [Example Applications](../examples/)

## Support

- [GitHub Issues](https://github.com/AshaGutmann/fhevm-react-template/issues)
- [Live Demo](https://ashagutmann.github.io/BuildingMaterialProcurement/)
