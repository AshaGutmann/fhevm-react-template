# FHEVM React Template 🔐

> Universal SDK for building privacy-preserving dApps with Fully Homomorphic Encryption

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![FHEVM](https://img.shields.io/badge/FHEVM-0.6.2-blue)](https://github.com/zama-ai/fhevmjs)

## 🎯 FHEVM SDK Bounty Submission

This repository contains a **universal FHEVM SDK** and example implementation demonstrating how to build privacy-preserving decentralized applications using Fully Homomorphic Encryption.

### 📦 What's Inside

This is a **monorepo** containing:

1. **`@fhevm/sdk`** - Universal, reusable SDK package
2. **`example-procurement`** - Complete dApp example (Secure Procurement Platform)

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
│   ├── fhevm-sdk/              # 🎁 Universal FHEVM SDK Package
│   │   ├── src/
│   │   │   ├── core/           # Core FHE encryption/decryption
│   │   │   ├── hooks/          # React hooks (useFHEVM, useEncrypt, etc.)
│   │   │   ├── utils/          # Utility functions
│   │   │   └── types/          # TypeScript type definitions
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── example-procurement/    # 📱 Example dApp
│       ├── contracts/          # Solidity smart contracts
│       ├── scripts/            # Deployment scripts
│       ├── test/               # Contract tests
│       ├── src/                # React frontend
│       ├── package.json
│       └── README.md
│
├── package.json                # Workspace configuration
└── README.md                   # This file
```

---

## 🎁 FHEVM SDK Package

The `@fhevm/sdk` package provides a **modular, wagmi-like API** for integrating FHE into any dApp.

### Features

✅ **Framework Agnostic Core** - Use with React, Vue, or vanilla JS
✅ **React Hooks** - `useFHEVM`, `useEncrypt`, `useDecrypt`, `useFHEContract`
✅ **TypeScript First** - Full type safety
✅ **EIP-712 Signing** - Secure decrypt operations
✅ **Modular Architecture** - Import only what you need

### Installation

```bash
npm install @fhevm/sdk
```

### Basic Usage

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

[📖 Full SDK Documentation](./packages/fhevm-sdk/README.md)

---

## 📱 Example: Secure Procurement Platform

A complete privacy-preserving procurement system demonstrating SDK usage.

### Features

- 🔐 **Encrypted Bids** - Submit confidential price quotes
- 📊 **Private Quantities** - Hide procurement volumes
- 🏆 **Fair Selection** - Compute on encrypted data
- 👥 **Supplier Management** - Reputation scoring
- 📜 **Transaction History** - Full audit trail

### Live Demo

🌐 **[View Live Demo](https://ashagutmann.github.io/BuildingMaterialProcurement/)**

### Local Development

```bash
# From root directory
npm run dev

# Or from example package
cd packages/example-procurement
npm run dev
```

[📖 Example App Documentation](./packages/example-procurement/README.md)

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

### Build Example App Only

```bash
npm run build:example
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
- `encryptInput(value, type)` - Encrypt a value
- `createEIP712Signature(...)` - Create decrypt signature
- `decryptValue(...)` - Decrypt an encrypted value

### React Hooks

- `useFHEVM()` - Access FHEVM instance and state
- `useEncrypt()` - Encrypt values
- `useDecrypt()` - Decrypt values with EIP-712
- `useFHEContract(address, abi)` - Interact with FHE contracts
- `useEncryptedInput()` - Handle encrypted form inputs

### Utilities

- `formatEncryptedValue()` - Format encrypted data
- `validateFHEType()` - Validate FHE data types
- `serializeProof()` - Serialize zero-knowledge proofs

[📖 Complete API Documentation](./packages/fhevm-sdk/docs/API.md)

---

## 🎥 Video Demo

[![Video Demo](https://img.shields.io/badge/Watch-Video%20Demo-red?logo=youtube)](https://youtube.com/your-video-link)

> Demonstrates setup, SDK integration, and design choices

---

## 🏆 Bounty Requirements Checklist

- ✅ **Universal SDK Package** (`@fhevm/sdk`)
  - ✅ Importable into any dApp
  - ✅ Modular API structure (like wagmi)
  - ✅ Encryption/decryption utilities
  - ✅ EIP-712 signing for decryption
  - ✅ Clean, reusable, extensible

- ✅ **React Integration**
  - ✅ Custom hooks for FHE operations
  - ✅ Context providers
  - ✅ TypeScript support

- ✅ **Example Implementation**
  - ✅ Next.js/React template *(Vite + React)*
  - ✅ Complete setup from root
  - ✅ Contract compilation + deployment
  - ✅ Frontend integration

- ✅ **Documentation**
  - ✅ Comprehensive README
  - ✅ API documentation
  - ✅ Usage examples
  - ✅ Deployment links

- ✅ **Video Demo**
  - ⏳ In progress

---

## 🔗 Links

- **Live Demo**: https://ashagutmann.github.io/BuildingMaterialProcurement/
- **GitHub Repository**: https://github.com/AshaGutmann/fhevm-react-template
- **SDK Package**: [packages/fhevm-sdk](./packages/fhevm-sdk)
- **Example App**: [packages/example-procurement](./packages/example-procurement)
- **Video Demo**: *Coming soon*

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
