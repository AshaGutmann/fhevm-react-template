# Framework Integration Guide

Complete guide for integrating @fhevm/sdk into different frameworks.

---

## React Integration

### Setup

```bash
npm install @fhevm/sdk react ethers
```

### Basic Usage

```tsx
// App.tsx
import { FHEVMProvider } from '@fhevm/sdk';

function App() {
  return (
    <FHEVMProvider
      config={{
        chainId: 11155111, // Sepolia
      }}
      autoInit={true}
    >
      <MyApp />
    </FHEVMProvider>
  );
}
```

### Using Hooks

```tsx
// Component.tsx
import { useFHEVM, useEncrypt, useDecrypt } from '@fhevm/sdk';

function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(100, 'uint32');
    console.log('Encrypted:', encrypted.hash);
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={!isInitialized || isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>
    </div>
  );
}
```

### Contract Interaction

```tsx
import { useFHEContract } from '@fhevm/sdk';
import { useEthersSigner } from './hooks/useEthersSigner'; // Your ethers hook

function BidForm() {
  const signer = useEthersSigner();
  const { contract, encrypt } = useFHEContract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );

  const submitBid = async (bidAmount: number) => {
    const encrypted = await encrypt(bidAmount, 'uint32');
    const tx = await contract.submitBid(procurementId, encrypted.data);
    await tx.wait();
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Vue 3 Integration

### Setup

```bash
npm install @fhevm/sdk vue ethers
```

### Basic Usage

```vue
<!-- App.vue -->
<script setup lang="ts">
import { useFHEVM } from '@fhevm/sdk/vue';

const { initialize, isInitialized, isLoading } = useFHEVM();

onMounted(() => {
  initialize({
    chainId: 11155111,
  });
});
</script>

<template>
  <div v-if="isLoading">Initializing FHEVM...</div>
  <MyApp v-else-if="isInitialized" />
</template>
```

### Using Composables

```vue
<!-- Component.vue -->
<script setup lang="ts">
import { useEncrypt, useDecrypt } from '@fhevm/sdk/vue';

const { encrypt, isEncrypting } = useEncrypt();
const { decrypt, isDecrypting } = useDecrypt();

const bidAmount = ref(100);

const handleEncrypt = async () => {
  const encrypted = await encrypt(bidAmount.value, 'uint32');
  console.log('Encrypted:', encrypted.hash);
};
</script>

<template>
  <button
    @click="handleEncrypt"
    :disabled="isEncrypting"
  >
    {{ isEncrypting ? 'Encrypting...' : 'Encrypt Value' }}
  </button>
</template>
```

---

## Next.js Integration

### App Router (Next.js 13+)

```tsx
// app/providers.tsx
'use client';

import { FHEVMProvider } from '@fhevm/sdk';

export function Providers({ children }: { children: React.Node }) {
  return (
    <FHEVMProvider
      config={{ chainId: 11155111 }}
      autoInit={true}
    >
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

### Pages Router (Next.js 12 and below)

```tsx
// pages/_app.tsx
import { FHEVMProvider } from '@fhevm/sdk';

function MyApp({ Component, pageProps }) {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }} autoInit={true}>
      <Component {...pageProps} />
    </FHEVMProvider>
  );
}

export default MyApp;
```

---

## Vanilla JavaScript

For non-framework usage, use the core functions directly:

```javascript
import {
  createFHEVMInstance,
  encryptValue,
  decryptValue,
} from '@fhevm/sdk/core';

// Initialize
const instance = await createFHEVMInstance({
  chainId: 11155111,
});

// Encrypt
const encrypted = await encryptValue(100, 'uint32');

// Use with contract
const tx = await contract.submitBid(procurementId, encrypted.data);

// Decrypt (with signer)
const decrypted = await decryptValue(
  contractAddress,
  ciphertext,
  signer
);
```

---

## Error Handling Best Practices

### React

```tsx
import { useEncrypt, parseError } from '@fhevm/sdk';

function MyComponent() {
  const { encrypt, error } = useEncrypt();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEncrypt = async () => {
    try {
      await encrypt(value, 'uint32');
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(parseError(err));
    }
  };

  return (
    <>
      <button onClick={handleEncrypt}>Encrypt</button>
      {(error || errorMessage) && (
        <div className="error">
          {errorMessage || parseError(error)}
        </div>
      )}
    </>
  );
}
```

### Vue

```vue
<script setup lang="ts">
import { useEncrypt, parseError } from '@fhevm/sdk/vue';

const { encrypt, error } = useEncrypt();
const errorMessage = ref<string | null>(null);

const handleEncrypt = async () => {
  try {
    await encrypt(value.value, 'uint32');
    errorMessage.value = null;
  } catch (err) {
    errorMessage.value = parseError(err);
  }
};
</script>

<template>
  <div v-if="error || errorMessage" class="error">
    {{ errorMessage || parseError(error) }}
  </div>
</template>
```

---

## Debugging

Enable debug mode to see detailed logs:

```typescript
import { enableDebug } from '@fhevm/sdk/utils';

// Enable with debug level
enableDebug('debug');

// Now all operations will be logged
const encrypted = await encrypt(100, 'uint32');
// Console: [FHEVM SDK][Encryption] Encrypted uint32 value { duration: "45.23ms" }
```

---

## TypeScript Support

The SDK provides full TypeScript support:

```typescript
import type {
  FHEType,
  FHEVMConfig,
  EncryptedInput,
} from '@fhevm/sdk';

const config: FHEVMConfig = {
  chainId: 11155111,
  publicKey: '0x...',
};

const type: FHEType = 'uint32';

const encrypted: EncryptedInput = await encrypt(100, type);
```

---

## Advanced Patterns

### Retry Failed Operations

```typescript
import { retryOperation } from '@fhevm/sdk/utils';

const encrypted = await retryOperation(
  () => encrypt(value, 'uint32'),
  3, // max retries
  1000 // delay between retries
);
```

### Custom Error Handling

```typescript
import {
  isEncryptionError,
  isDecryptionError,
  EncryptionError,
} from '@fhevm/sdk/utils';

try {
  await encrypt(value, 'uint32');
} catch (err) {
  if (isEncryptionError(err)) {
    console.log('Encryption failed:', err.message);
  }
}
```

---

## Performance Optimization

### Lazy Loading

Only load FHEVM when needed:

```tsx
const { initialize } = useFHEVM();

// Initialize only when user clicks "Connect"
const handleConnect = async () => {
  await connectWallet();
  await initialize({ chainId });
};
```

### Tree-shaking

Import only what you need:

```typescript
// Good - only imports what's needed
import { encryptValue } from '@fhevm/sdk/core';

// Less optimal - imports everything
import { encryptValue } from '@fhevm/sdk';
```

---

## Testing

### Jest + React Testing Library

```tsx
import { render, screen } from '@testing-library/react';
import { FHEVMProvider } from '@fhevm/sdk';

const wrapper = ({ children }) => (
  <FHEVMProvider config={{ chainId: 11155111 }}>
    {children}
  </FHEVMProvider>
);

test('encrypts value', async () => {
  const { result } = renderHook(() => useEncrypt(), { wrapper });

  await act(async () => {
    await result.current.encrypt(100, 'uint32');
  });

  expect(result.current.error).toBeNull();
});
```

---

## Common Issues

### Issue: "FHEVM not initialized"

**Solution**: Ensure FHEVMProvider wraps your app or manually call `initialize()`

### Issue: "Module not found: @fhevm/sdk/vue"

**Solution**: Check that you have Vue 3 installed and the build output exists

### Issue: Slow encryption

**Solution**: FHEVM initialization is async. Ensure it's complete before encrypting

---

For more examples, see the [example-procurement](../../example-procurement) package.
