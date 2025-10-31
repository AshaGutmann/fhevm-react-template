# FHEVM React Template 🔐

> Universal SDK for building privacy-preserving dApps with Fully Homomorphic Encryption

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![FHEVM](https://img.shields.io/badge/FHEVM-0.6.2-blue)](https://github.com/zama-ai/fhevmjs)

## 🎯 FHEVM SDK Bounty Submission

This repository contains a **universal FHEVM SDK** and example implementations demonstrating how to build privacy-preserving decentralized applications using Fully Homomorphic Encryption.

### Live Demo

🌐 **[View Live Demo](https://private-building-material-procureme.vercel.app/)**

- ✅ **Video Demo**
  - ✅ demo1.mp4 demo2.mp4 demo3.mp4

### 📦 What's Inside

This is a **monorepo** containing:

1. **`@fhevm/sdk`** - Universal, reusable SDK package (packages/fhevm-sdk)
2. **`templates/nextjs`** - Next.js template with comprehensive SDK integration
3. **`examples/`** - Complete React-based example applications:
   - **example-nextjs** - Next.js 14+ integration with App Router & React Server Components
   - **example-procurement** - React + Vite Procurement Platform (fully converted to React)
   - **PrivateBuildingMaterialProcurement** - React-enabled building materials system

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/AshaGutmann/fhevm-react-template.git
cd fhevm-react-template

# Install all packages from root
npm run install:all

# Compile Solidity contracts
npm run compile

# Start the example dApp
npm run dev
```

The example app will be available at `http://localhost:3000`

---

## 📚 Project Structure

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/              # 🎁 Universal FHEVM SDK Package
│       ├── src/
│       │   ├── core/           # Core FHE encryption/decryption
│       │   ├── hooks/          # React hooks (useFHEVM, useEncrypt, etc.)
│       │   ├── vue/            # Vue 3 composables
│       │   ├── adapters/       # Framework adapters (React, Next.js)
│       │   ├── utils/          # Utility functions (encryption, decryption, etc.)
│       │   └── types/          # TypeScript type definitions
│       ├── docs/               # Documentation
│       ├── package.json
│       └── README.md
│
├── templates/                  # 📋 Framework Templates
│   └── nextjs/                # ⚡ Next.js Template
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   │   ├── api/       # API routes for FHE operations
│       │   │   ├── layout.tsx # Root layout with providers
│       │   │   ├── page.tsx   # Home page with SDK demo
│       │   │   └── globals.css# Styles
│       │   ├── components/    # Reusable components
│       │   │   ├── ui/        # UI components (Button, Input, Card)
│       │   │   ├── fhe/       # FHE components (EncryptionDemo, etc.)
│       │   │   └── examples/  # Use case examples (Banking, Medical)
│       │   ├── lib/           # Utility libraries
│       │   │   ├── fhe/       # FHE client/server utilities
│       │   │   └── utils/     # General utilities
│       │   ├── hooks/         # Custom React hooks
│       │   └── types/         # TypeScript definitions
│       ├── package.json
│       └── README.md
│
├── examples/                   # 📱 Complete Example Applications
│   ├── example-nextjs/        # Next.js full example
│   ├── example-procurement/   # Vite + React Procurement Platform
│   │   ├── contracts/         # Solidity smart contracts
│   │   ├── scripts/           # Deployment scripts
│   │   ├── test/              # Contract tests
│   │   ├── src/               # React frontend
│   │   └── README.md
│   └── PrivateBuildingMaterialProcurement/  # Additional example
│
├── docs/                      # 📚 Project Documentation
│   ├── QUICKSTART.md         # Quick start guide
│   └── DEPLOYMENT.md         # Deployment instructions
│
├── package.json               # Workspace configuration
└── README.md                  # This file
```

---

## 🎁 FHEVM SDK Package

The `@fhevm/sdk` package provides a **modular, wagmi-like API** for integrating FHE into any dApp.

### Features

✅ **Framework Agnostic Core** - Use with React, Vue, or vanilla JS
✅ **React Hooks** - `useFHEVM`, `useEncrypt`, `useDecrypt`, `useFHEContract`
✅ **Vue 3 Composables** - `useFHEVM`, `useEncrypt`, `useDecrypt`
✅ **Framework Adapters** - Dedicated adapters for React and Next.js
✅ **Encryption/Decryption Utilities** - Comprehensive encryption and decryption helpers
✅ **TypeScript First** - Full type safety
✅ **EIP-712 Signing** - Secure decrypt operations
✅ **Modular Architecture** - Import only what you need

### Installation

```bash
npm install @fhevm/sdk
```

### Basic Usage

#### React

```typescript
import { FHEVMProvider, useFHEVM, useEncrypt } from '@fhevm/sdk';

// Wrap your app
function App() {
  return (
    <FHEVMProvider>
      <YourApp />
    </FHEVMProvider>
  );
}

// Use in components
function MyComponent() {
  const { instance, isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(42, 'uint32');
    console.log('Encrypted value:', encrypted);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isInitialized}>
      Encrypt Value
    </button>
  );
}
```

#### Next.js

```typescript
// app/providers.tsx
'use client';

import { FHEVMProvider } from '@fhevm/sdk';

export function Providers({ children }) {
  return (
    <FHEVMProvider config={{ chainId: 11155111 }} autoInit={true}>
      {children}
    </FHEVMProvider>
  );
}

// app/page.tsx
'use client';

import { useFHEVM, useEncrypt } from '@fhevm/sdk';

export default function Home() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();

  // Your component logic...
}
```

[📖 Full SDK Documentation](./packages/fhevm-sdk/README.md)

---

## 📱 Example 1: Secure Procurement Platform (React + Vite + SDK)

A complete privacy-preserving procurement system **built with React and fully integrated with @fhevm/sdk** using modern React patterns, hooks, and component architecture.

### Features

- ⚛️ **React Components** - Modular component architecture with hooks and context
- 🔐 **SDK-Encrypted Bids** - Uses `@fhevm/sdk` encrypt() for confidential price quotes
- 📊 **Private Quantities** - Automatic encryption with SDK on procurement creation
- 🏆 **Fair Selection** - Smart contracts compute on FHE-encrypted data
- 👥 **Supplier Management** - Reputation scoring with encrypted scores
- 📜 **Transaction History** - Full audit trail with local storage
- ⚡ **Full SDK Integration** - Uses SDK core functions and React hooks throughout



### SDK Integration Highlights

**React application (`src/App.tsx` and components) uses @fhevm/sdk throughout:**

```typescript
import { createFHEVMInstance, encrypt } from '@fhevm/sdk/core';
import { enableDebug } from '@fhevm/sdk/utils';

// React component with SDK integration
function App() {
  const [fhevmInstance, setFhevmInstance] = useState(null);

  // Initialize on wallet connect
  const fhevmInstance = await createFHEVMInstance({ chainId });

  // Encrypt in React components
  const encryptedQuantity = await encrypt(fhevmInstance, quantity, 'uint32');
  const encryptedPrice = await encrypt(fhevmInstance, bidAmount, 'uint64');
}
```

### Local Development

```bash
# From root directory
npm run dev

# Or from example package
cd examples/example-procurement
npm run dev
```

[📖 Example App Documentation](./examples/example-procurement/README.md)

---

## ⚡ Template: Next.js Integration

A comprehensive Next.js 14+ template with complete SDK integration, demonstrating all FHE capabilities.

### Features

- ✅ **Complete App Router Structure** - Organized src/ directory with Next.js 14+
- ✅ **API Routes** - FHE encryption, decryption, and computation endpoints
- ✅ **Rich Component Library** - UI components, FHE demos, and real-world examples
- ✅ **Custom Hooks** - Enhanced encryption, computation, and FHE hooks
- ✅ **Type-Safe** - Full TypeScript support with comprehensive type definitions
- ✅ **Real-World Examples** - Banking and Medical use case demonstrations
- ✅ **Utilities & Libs** - FHE client/server utilities, validation, and security helpers

### Template Structure

```
templates/nextjs/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/fhe/          # FHE API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/               # Button, Input, Card
│   │   ├── fhe/              # EncryptionDemo, ComputationDemo, KeyManager
│   │   └── examples/         # BankingExample, MedicalExample
│   ├── lib/                  # FHE utilities and helpers
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript definitions
└── package.json
```

### Local Development

```bash
# From root directory
cd templates/nextjs
npm install
npm run dev
```

Visit `http://localhost:3000` to see the comprehensive Next.js template.

[📖 Next.js Template Documentation](./templates/nextjs/README.md)

---

## 📱 Example Applications (All React + SDK-Integrated) ✅

All **three examples** in this repository **are built with React and fully integrate @fhevm/sdk**:

### Example 1: Next.js Demo (React + SDK)
- **Location**: `examples/example-nextjs/`
- **Tech Stack**: Next.js 14+ App Router + React 18 + TypeScript
- **SDK Integration**: React hooks (`useFHEVM`, `useEncrypt`, `useDecrypt`)
- **React Features**: Server Components, Client Components, React hooks
- **Run**: `cd examples/example-nextjs && npm install && npm run dev`

### Example 2: Secure Procurement Platform (React + SDK)
- **Location**: `examples/example-procurement/`
- **Tech Stack**: React 18 + Vite + TypeScript + Ethers.js
- **SDK Integration**: Core SDK with React components and hooks
- **React Features**: Functional components, useState, useEffect, modular architecture
- **Run**: `cd examples/example-procurement && npm install && npm run dev`
- **Live Demo**: [View Demo](https://private-building-material-procureme.vercel.app/)

### Example 3: Building Material Procurement (React-Enabled + SDK)
- **Location**: `examples/PrivateBuildingMaterialProcurement/`
- **Tech Stack**: React 18 + Vite + TypeScript + @fhevm/sdk
- **SDK Integration**: Full SDK integration with React support
- **React Features**: React components available, Vite with React plugin
- **Run**: `cd examples/PrivateBuildingMaterialProcurement && npm install && npm run dev`
- **Note**: Now includes React support alongside existing implementation

[📖 Example Apps Documentation](./examples/)

---

## 🎯 SDK Integration Summary

| Example | Framework | SDK Integration | Entry Point | Port |
|---------|-----------|----------------|-------------|------|
| example-nextjs | Next.js 14+ + React | React Hooks | `src/app/page.tsx` | 3000 |
| example-procurement | React + Vite | Core + React Components | `src/main.tsx`, `src/App.tsx` | 5173 |
| PrivateBuildingMaterialProcurement | React + Vite | Core + React Support | `src/main.ts` | 5174 |

---

## 🛠️ Development Workflow

### Build Everything

```bash
npm run build
```

### Build SDK Only

```bash
npm run build:sdk
```

### Build Example Apps

```bash
# Vite example
npm run build:example

# Next.js example
cd packages/example-nextjs
npm run build
```

### Run Tests

```bash
npm run test
```

### Lint & Format

```bash
npm run lint
npm run format
```

### Deploy Contracts

```bash
# Set up .env file first
cp packages/example-procurement/.env.example packages/example-procurement/.env

# Deploy to Sepolia testnet
npm run deploy
```

---

## 📖 SDK API Reference

### Core Functions

- `createFHEVMInstance(config)` - Initialize FHEVM instance
- `encryptValue(value, type)` - Encrypt a value
- `createEIP712Signature(...)` - Create decrypt signature
- `decryptValue(...)` - Decrypt an encrypted value

### React Hooks

- `useFHEVM()` - Access FHEVM instance and state
- `useEncrypt()` - Encrypt values
- `useDecrypt()` - Decrypt values with EIP-712
- `useFHEContract(address, abi)` - Interact with FHE contracts
- `useEncryptedInput()` - Handle encrypted form inputs

### Vue 3 Composables

- `useFHEVM()` - FHEVM instance management
- `useEncrypt()` - Encryption composable
- `useDecrypt()` - Decryption composable

### Utilities

#### Encryption
- `encrypt(value, type)` - Encrypt values using FHE
- `encryptBatch(values)` - Encrypt multiple values
- `prepareEncryptedInput(value, type)` - Prepare encrypted input for contracts
- `validateEncryptionInput(value, type)` - Validate encryption inputs
- `encryptedToHex(data)` - Convert encrypted data to hex
- `hexToEncrypted(hex)` - Convert hex to encrypted data

#### Decryption
- `decrypt(contractAddress, ciphertext, signer)` - Decrypt encrypted values
- `decryptWithRetry(...)` - Decrypt with automatic retry
- `decryptBatch(requests, signer)` - Decrypt multiple values
- `userDecrypt(request, signer)` - User-initiated decryption
- `createDecryptSignature(...)` - Create EIP-712 signature for decryption
- `validateDecryptionRequest(request)` - Validate decryption requests
- `formatDecryptedValue(value, targetType)` - Format decrypted values

#### General
- `formatEncryptedValue()` - Format encrypted data
- `validateFHEType()` - Validate FHE data types
- `serializeProof()` - Serialize zero-knowledge proofs

### Next.js Integration

```typescript
// Use 'use client' directive for client components
'use client';

import { FHEVMProvider, useFHEVM, useEncrypt } from '@fhevm/sdk';

// Providers should be in a separate client component
export function Providers({ children }) {
  return <FHEVMProvider autoInit>{children}</FHEVMProvider>;
}

// Use hooks in client components
export function EncryptButton() {
  const { isInitialized } = useFHEVM();
  const { encrypt } = useEncrypt();
  // ...
}
```

[📖 Complete API Documentation](./packages/fhevm-sdk/docs/API.md)
[📖 Framework Integration Guide](./packages/fhevm-sdk/docs/FRAMEWORK_INTEGRATION.md)

---

## 🎥 Video Demo

[![Video Demo demo1.mp4 demo2.mp4 demo3.mp4]

> Demonstrates setup, SDK integration, and design choices

---

## 🏆 Bounty Requirements Checklist

- ✅ **Universal SDK Package** (`@fhevm/sdk`)
  - ✅ Importable into any dApp
  - ✅ Modular API structure (like wagmi)
  - ✅ Core encryption/decryption modules (`src/core/`)
  - ✅ Dedicated encryption utilities (`src/utils/encryption.ts`)
  - ✅ Dedicated decryption utilities (`src/utils/decryption.ts`)
  - ✅ Framework adapters (`src/adapters/`)
  - ✅ EIP-712 signing for decryption
  - ✅ Clean, reusable, extensible

- ✅ **React Integration**
  - ✅ Custom hooks for FHE operations
  - ✅ Context providers
  - ✅ TypeScript support
  - ✅ Next.js compatibility

- ✅ **Example Implementations**
  - ✅ Vite + React template (Procurement Platform)
  - ✅ Next.js template with App Router
  - ✅ Complete setup from root
  - ✅ Contract compilation + deployment
  - ✅ Frontend integration

- ✅ **Documentation**
  - ✅ Comprehensive README
  - ✅ API documentation (`packages/fhevm-sdk/docs/API.md`)
  - ✅ Framework integration guide (`packages/fhevm-sdk/docs/FRAMEWORK_INTEGRATION.md`)
  - ✅ Quick start guide (`docs/QUICKSTART.md`)
  - ✅ Deployment guide (`docs/DEPLOYMENT.md`)
  - ✅ Usage examples
  - ✅ Deployment links



---

## 🔗 Links


- **GitHub Repository**: https://github.com/AshaGutmann/fhevm-react-template
- **SDK Package**: [packages/fhevm-sdk](./packages/fhevm-sdk)
- **Next.js Template**: [templates/nextjs](./templates/nextjs)
- **Example Applications**: [examples/](./examples)
  - [example-nextjs](./examples/example-nextjs)
  - [example-procurement](./examples/example-procurement)
  - [PrivateBuildingMaterialProcurement](./examples/PrivateBuildingMaterialProcurement)
- **Documentation**:
  - [Quick Start Guide](./docs/QUICKSTART.md)
  - [Deployment Guide](./docs/DEPLOYMENT.md)
  - [SDK API Documentation](./packages/fhevm-sdk/docs/API.md)
  - [Framework Integration](./packages/fhevm-sdk/docs/FRAMEWORK_INTEGRATION.md)
- **Video Demos**: demo1.mp4, demo2.mp4, demo3.mp4

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- **Zama** - For the amazing FHEVM technology
- **fhevmjs** - Core FHE library
- Community contributors

---

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/AshaGutmann/fhevm-react-template/issues)
- Documentation: [Read the docs](./packages/fhevm-sdk/README.md)

---

**Built with ❤️ for the FHEVM SDK Bounty**

*Powered by Zama fhEVM* 🔐
