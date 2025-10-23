# FHEVM SDK API Reference

Complete API documentation for the FHEVM SDK.

## Table of Contents

- [Core Functions](#core-functions)
- [React Hooks](#react-hooks)
- [Vue Composables](#vue-composables)
- [Utilities](#utilities)
- [Types](#types)
- [Error Handling](#error-handling)

---

## Core Functions

Core functions that work with any JavaScript framework.

### `createFHEVMInstance`

Initializes the FHEVM instance for encryption and decryption operations.

```typescript
function createFHEVMInstance(config: FHEVMConfig): Promise<FhevmInstance>
```

**Parameters:**
- `config: FHEVMConfig` - Configuration object
  - `chainId: number` - Blockchain network chain ID (e.g., 11155111 for Sepolia)
  - `publicKey?: string` - Optional FHE public key
  - `gatewayUrl?: string` - Optional gateway URL for decryption
  - `aclAddress?: string` - Optional ACL contract address

**Returns:** `Promise<FhevmInstance>` - The initialized FHEVM instance

**Example:**
```typescript
import { createFHEVMInstance } from '@fhevm/sdk/core';

const instance = await createFHEVMInstance({
  chainId: 11155111, // Sepolia testnet
});
```

**Notes:**
- Instance is cached per chain ID - calling again with same chainId returns existing instance
- Throws `InitializationError` if initialization fails

---

### `encryptValue`

Encrypts a value using the FHEVM instance.

```typescript
function encryptValue(
  value: number | bigint | boolean,
  type?: FHEType
): Promise<Uint8Array>
```

**Parameters:**
- `value: number | bigint | boolean` - Value to encrypt
- `type?: FHEType` - FHE data type (default: 'uint32')
  - Supported types: `'bool'`, `'uint8'`, `'uint16'`, `'uint32'`, `'uint64'`, `'uint128'`, `'uint256'`, `'address'`, `'bytes'`, `'bytes32'`

**Returns:** `Promise<Uint8Array>` - Encrypted data as Uint8Array

**Example:**
```typescript
import { encryptValue } from '@fhevm/sdk/core';

// Encrypt a number
const encrypted = await encryptValue(42, 'uint32');

// Encrypt a boolean
const encryptedBool = await encryptValue(true, 'bool');

// Encrypt a large number
const encryptedBig = await encryptValue(1000000n, 'uint64');
```

**Throws:**
- `EncryptionError` - If encryption fails
- `ValidationError` - If value type doesn't match FHE type

---

### `decryptValue`

Decrypts an encrypted value using EIP-712 signature.

```typescript
function decryptValue(
  contractAddress: string,
  ciphertext: bigint,
  signer: Signer
): Promise<bigint>
```

**Parameters:**
- `contractAddress: string` - Contract address that owns the encrypted data
- `ciphertext: bigint` - Encrypted value to decrypt
- `signer: Signer` - Ethers.js signer for EIP-712 signature

**Returns:** `Promise<bigint>` - Decrypted value

**Example:**
```typescript
import { decryptValue } from '@fhevm/sdk/core';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const decrypted = await decryptValue(
  '0x1234...', // contract address
  12345678n,   // ciphertext
  signer
);

console.log('Decrypted value:', decrypted.toString());
```

**Throws:**
- `DecryptionError` - If decryption fails
- `SignatureError` - If EIP-712 signature creation fails

---

### `createEIP712Signature`

Creates an EIP-712 signature for decryption permission.

```typescript
function createEIP712Signature(
  contractAddress: string,
  userAddress: string,
  signer: Signer
): Promise<string>
```

**Parameters:**
- `contractAddress: string` - Contract address
- `userAddress: string` - User's wallet address
- `signer: Signer` - Ethers.js signer

**Returns:** `Promise<string>` - EIP-712 signature

**Example:**
```typescript
import { createEIP712Signature } from '@fhevm/sdk/core';

const signature = await createEIP712Signature(
  '0x1234...', // contract
  '0x5678...', // user
  signer
);
```

---

### `getFHEVMInstance`

Gets the current FHEVM instance.

```typescript
function getFHEVMInstance(): FhevmInstance | null
```

**Returns:** `FhevmInstance | null` - Current instance or null if not initialized

**Example:**
```typescript
import { getFHEVMInstance } from '@fhevm/sdk/core';

const instance = getFHEVMInstance();
if (instance) {
  console.log('FHEVM is ready');
}
```

---

### `isInitialized`

Checks if FHEVM instance is initialized.

```typescript
function isInitialized(): boolean
```

**Returns:** `boolean` - True if initialized

**Example:**
```typescript
import { isInitialized } from '@fhevm/sdk/core';

if (isInitialized()) {
  // Perform encryption operations
}
```

---

### `resetInstance`

Resets the FHEVM instance.

```typescript
function resetInstance(): void
```

**Example:**
```typescript
import { resetInstance } from '@fhevm/sdk/core';

// Reset to reinitialize with different config
resetInstance();
```

---

## React Hooks

React hooks for easy integration in React applications.

### `FHEVMProvider`

Context provider component for FHEVM functionality.

```typescript
function FHEVMProvider({
  children,
  config,
  autoInit
}: FHEVMProviderProps): JSX.Element
```

**Props:**
- `children: ReactNode` - Child components
- `config?: FHEVMConfig` - FHEVM configuration
- `autoInit?: boolean` - Auto-initialize on mount (default: false)

**Example:**
```tsx
import { FHEVMProvider } from '@fhevm/sdk';

function App() {
  return (
    <FHEVMProvider
      config={{ chainId: 11155111 }}
      autoInit={true}
    >
      <YourApp />
    </FHEVMProvider>
  );
}
```

---

### `useFHEVM`

Hook to access FHEVM instance and state.

```typescript
function useFHEVM(): UseFHEVMReturn
```

**Returns:**
```typescript
interface UseFHEVMReturn {
  instance: FhevmInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: (config: FHEVMConfig) => Promise<void>;
  reset: () => void;
}
```

**Example:**
```tsx
import { useFHEVM } from '@fhevm/sdk';

function MyComponent() {
  const { instance, isInitialized, isLoading, error, initialize } = useFHEVM();

  useEffect(() => {
    if (!isInitialized) {
      initialize({ chainId: 11155111 });
    }
  }, [isInitialized, initialize]);

  if (isLoading) return <div>Initializing FHEVM...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isInitialized) return <div>Not initialized</div>;

  return <div>FHEVM Ready!</div>;
}
```

---

### `useEncrypt`

Hook for encrypting values.

```typescript
function useEncrypt(): UseEncryptReturn
```

**Returns:**
```typescript
interface UseEncryptReturn {
  encrypt: (value: number | bigint | boolean, type?: FHEType) => Promise<EncryptResult>;
  isEncrypting: boolean;
  error: Error | null;
}

interface EncryptResult {
  data: Uint8Array;
  hash: string;
}
```

**Example:**
```tsx
import { useEncrypt } from '@fhevm/sdk';

function EncryptButton() {
  const { encrypt, isEncrypting, error } = useEncrypt();
  const [result, setResult] = useState<string>('');

  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(42, 'uint32');
      setResult(encrypted.hash);
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
      </button>
      {result && <p>Hash: {result}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

---

### `useDecrypt`

Hook for decrypting values with EIP-712 signatures.

```typescript
function useDecrypt(): UseDecryptReturn
```

**Returns:**
```typescript
interface UseDecryptReturn {
  decrypt: (
    contractAddress: string,
    ciphertext: bigint,
    signer: Signer
  ) => Promise<bigint>;
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
import { useDecrypt } from '@fhevm/sdk';
import { ethers } from 'ethers';

function DecryptButton({ contractAddress, ciphertext }) {
  const { decrypt, isDecrypting, error } = useDecrypt();
  const [value, setValue] = useState<string>('');

  const handleDecrypt = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    try {
      const decrypted = await decrypt(contractAddress, ciphertext, signer);
      setValue(decrypted.toString());
    } catch (err) {
      console.error('Decryption failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt Value'}
      </button>
      {value && <p>Value: {value}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

---

### `useFHEContract`

Hook for interacting with FHE-enabled smart contracts.

```typescript
function useFHEContract(
  address: string,
  abi: any[],
  signer?: Signer
): UseFHEContractReturn
```

**Parameters:**
- `address: string` - Contract address
- `abi: any[]` - Contract ABI
- `signer?: Signer` - Optional ethers.js signer

**Returns:**
```typescript
interface UseFHEContractReturn {
  contract: Contract | null;
  encrypt: (value: number | bigint | boolean, type?: FHEType) => Promise<EncryptResult>;
  decrypt: (ciphertext: bigint) => Promise<bigint>;
  isReady: boolean;
}
```

**Example:**
```tsx
import { useFHEContract } from '@fhevm/sdk';
import CONTRACT_ABI from './abi.json';

function ContractInteraction() {
  const { contract, encrypt, decrypt, isReady } = useFHEContract(
    '0x1234...',
    CONTRACT_ABI,
    signer
  );

  const submitEncryptedValue = async () => {
    if (!contract) return;

    const encrypted = await encrypt(100, 'uint32');
    const tx = await contract.submitValue(encrypted.data);
    await tx.wait();
  };

  return (
    <button onClick={submitEncryptedValue} disabled={!isReady}>
      Submit Encrypted Value
    </button>
  );
}
```

---

## Vue Composables

Vue 3 Composition API composables.

### `useFHEVM` (Vue)

Vue composable for FHEVM instance management.

```typescript
function useFHEVM(autoInit?: FHEVMConfig): UseFHEVMReturn
```

**Parameters:**
- `autoInit?: FHEVMConfig` - Optional auto-initialization config

**Returns:**
```typescript
interface UseFHEVMReturn {
  instance: Ref<FhevmInstance | null>;
  isInitialized: ComputedRef<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  initialize: (config: FHEVMConfig) => Promise<void>;
  reset: () => void;
}
```

**Example:**
```vue
<script setup lang="ts">
import { useFHEVM } from '@fhevm/sdk/vue';

const { instance, isInitialized, isLoading, initialize } = useFHEVM();

onMounted(() => {
  initialize({ chainId: 11155111 });
});
</script>

<template>
  <div v-if="isLoading">Initializing...</div>
  <div v-else-if="isInitialized">FHEVM Ready!</div>
</template>
```

---

### `useEncrypt` (Vue)

Vue composable for encryption.

```typescript
function useEncrypt(): UseEncryptReturn
```

**Returns:**
```typescript
interface UseEncryptReturn {
  encrypt: (value: number | bigint | boolean, type?: FHEType) => Promise<EncryptResult>;
  isEncrypting: Ref<boolean>;
  error: Ref<Error | null>;
}
```

**Example:**
```vue
<script setup lang="ts">
import { useEncrypt } from '@fhevm/sdk/vue';
import { ref } from 'vue';

const { encrypt, isEncrypting } = useEncrypt();
const encryptedHash = ref<string>('');

const handleEncrypt = async () => {
  const result = await encrypt(42, 'uint32');
  encryptedHash.value = result.hash;
};
</script>

<template>
  <button @click="handleEncrypt" :disabled="isEncrypting">
    {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
  </button>
  <p v-if="encryptedHash">Hash: {{ encryptedHash }}</p>
</template>
```

---

### `useDecrypt` (Vue)

Vue composable for decryption.

```typescript
function useDecrypt(): UseDecryptReturn
```

**Returns:**
```typescript
interface UseDecryptReturn {
  decrypt: (
    contractAddress: string,
    ciphertext: bigint,
    signer: Signer
  ) => Promise<bigint>;
  isDecrypting: Ref<boolean>;
  error: Ref<Error | null>;
}
```

---

## Utilities

Utility functions for formatting and validation.

### `formatEncryptedValue`

Formats encrypted data for display or storage.

```typescript
function formatEncryptedValue(encrypted: Uint8Array): string
```

**Parameters:**
- `encrypted: Uint8Array` - Encrypted data

**Returns:** `string` - Hex string representation

**Example:**
```typescript
import { formatEncryptedValue } from '@fhevm/sdk/utils';

const encrypted = await encrypt(42, 'uint32');
const hex = formatEncryptedValue(encrypted);
console.log('Hex:', hex); // "0x1234..."
```

---

### `validateFHEType`

Validates if a value matches the specified FHE type.

```typescript
function validateFHEType(value: any, type: FHEType): boolean
```

**Parameters:**
- `value: any` - Value to validate
- `type: FHEType` - FHE type to validate against

**Returns:** `boolean` - True if valid

**Example:**
```typescript
import { validateFHEType } from '@fhevm/sdk/utils';

validateFHEType(42, 'uint32');     // true
validateFHEType(true, 'bool');     // true
validateFHEType(-1, 'uint32');     // false
```

---

### `uint8ArrayToHex`

Converts Uint8Array to hex string.

```typescript
function uint8ArrayToHex(arr: Uint8Array): string
```

---

### `hexToUint8Array`

Converts hex string to Uint8Array.

```typescript
function hexToUint8Array(hex: string): Uint8Array
```

---

## Types

TypeScript type definitions.

### `FHEVMConfig`

```typescript
interface FHEVMConfig {
  chainId: number;
  publicKey?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}
```

### `FHEType`

```typescript
type FHEType =
  | 'bool'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'address'
  | 'bytes'
  | 'bytes32';
```

### `EncryptResult`

```typescript
interface EncryptResult {
  data: Uint8Array;
  hash: string;
}
```

---

## Error Handling

Custom error classes for better error handling.

### `FHEVMError`

Base error class for all FHEVM errors.

```typescript
class FHEVMError extends Error {
  constructor(message: string, code: string, details?: unknown);
}
```

### `InitializationError`

Thrown when FHEVM initialization fails.

```typescript
class InitializationError extends FHEVMError
```

### `EncryptionError`

Thrown when encryption fails.

```typescript
class EncryptionError extends FHEVMError
```

### `DecryptionError`

Thrown when decryption fails.

```typescript
class DecryptionError extends FHEVMError
```

### `SignatureError`

Thrown when EIP-712 signature creation fails.

```typescript
class SignatureError extends FHEVMError
```

### `ValidationError`

Thrown when input validation fails.

```typescript
class ValidationError extends FHEVMError
```

**Example Usage:**
```typescript
import { EncryptionError, isEncryptionError } from '@fhevm/sdk/utils';

try {
  await encrypt(value, 'uint32');
} catch (error) {
  if (isEncryptionError(error)) {
    console.error('Encryption failed:', error.message);
    console.error('Error code:', error.code);
  }
}
```

---

## Debug Utilities

Built-in debugging tools.

### `enableDebug`

Enables debug mode with logging.

```typescript
function enableDebug(level?: LogLevel): void

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

**Example:**
```typescript
import { enableDebug } from '@fhevm/sdk/utils';

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  enableDebug('debug');
}
```

### `debugger.startTimer` / `debugger.endTimer`

Performance tracking utilities.

```typescript
debugger.startTimer(name: string): void
debugger.endTimer(name: string): number
```

**Example:**
```typescript
import { debugger } from '@fhevm/sdk/utils';

debugger.startTimer('encryption');
await encrypt(42, 'uint32');
const duration = debugger.endTimer('encryption');
console.log(`Encryption took ${duration}ms`);
```

---

## Complete Example

Here's a complete example combining multiple APIs:

```tsx
import {
  FHEVMProvider,
  useFHEVM,
  useEncrypt,
  useDecrypt
} from '@fhevm/sdk';
import { enableDebug } from '@fhevm/sdk/utils';
import { ethers } from 'ethers';

// Enable debugging in development
if (process.env.NODE_ENV === 'development') {
  enableDebug('info');
}

// App wrapper
function App() {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }} autoInit>
      <EncryptionDemo />
    </FHEVMProvider>
  );
}

// Component using FHEVM
function EncryptionDemo() {
  const { isInitialized, isLoading } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const [value, setValue] = useState(100);
  const [encryptedHash, setEncryptedHash] = useState('');
  const [decryptedValue, setDecryptedValue] = useState('');

  const handleEncrypt = async () => {
    try {
      const result = await encrypt(value, 'uint32');
      setEncryptedHash(result.hash);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  const handleDecrypt = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = await decrypt(
        '0x1234...', // contract address
        BigInt(encryptedHash),
        signer
      );
      setDecryptedValue(result.toString());
    } catch (error) {
      console.error('Decryption failed:', error);
    }
  };

  if (isLoading) return <div>Initializing FHEVM...</div>;
  if (!isInitialized) return <div>FHEVM not ready</div>;

  return (
    <div>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />

      <button onClick={handleEncrypt} disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Encrypt'}
      </button>

      {encryptedHash && (
        <>
          <p>Encrypted Hash: {encryptedHash}</p>
          <button onClick={handleDecrypt} disabled={isDecrypting}>
            {isDecrypting ? 'Decrypting...' : 'Decrypt'}
          </button>
        </>
      )}

      {decryptedValue && <p>Decrypted Value: {decryptedValue}</p>}
    </div>
  );
}
```

---

## Support

For more information:
- [Framework Integration Guide](./FRAMEWORK_INTEGRATION.md)
- [GitHub Repository](https://github.com/AshaGutmann/fhevm-react-template)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)

---

**FHEVM SDK** - Built for the FHEVM SDK Bounty by Zama
