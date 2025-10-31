# FHEVM SDK Next.js Template

> Comprehensive Next.js 14+ template with complete FHEVM SDK integration

This template demonstrates best practices for integrating the FHEVM SDK into a Next.js application with the App Router architecture.

## 🎯 Features

### Core FHE Operations
- ✅ **Encryption Demo** - Interactive encryption with multiple data types
- ✅ **Computation Demo** - Homomorphic operations on encrypted data
- ✅ **Key Management** - FHE key generation and management
- ✅ **Decryption** - Secure decryption with EIP-712 signatures

### Component Library
- 🎨 **UI Components** - Reusable Button, Input, and Card components
- 🔐 **FHE Components** - Ready-to-use encryption and computation demos
- 💼 **Use Case Examples** - Banking and Medical privacy examples
- 📦 **Modular Architecture** - Easy to customize and extend

### Developer Experience
- 📝 **TypeScript** - Full type safety throughout
- ⚛️ **React Hooks** - Custom hooks for FHE operations
- 🛠️ **Utilities** - Security, validation, and helper functions
- 📚 **Well-Documented** - Comprehensive code comments

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── fhe/               # FHE operations
│   │   │   ├── route.ts       # Main FHE endpoint
│   │   │   ├── encrypt/       # Encryption endpoint
│   │   │   ├── decrypt/       # Decryption endpoint
│   │   │   └── compute/       # Computation endpoint
│   │   └── keys/              # Key management
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Home page
│   ├── providers.tsx          # FHEVM Provider setup
│   └── globals.css            # Global styles
│
├── components/                 # React Components
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── fhe/                   # FHE functionality
│   │   ├── FHEProvider.tsx
│   │   ├── EncryptionDemo.tsx
│   │   ├── ComputationDemo.tsx
│   │   └── KeyManager.tsx
│   └── examples/              # Use case examples
│       ├── BankingExample.tsx
│       └── MedicalExample.tsx
│
├── lib/                       # Utility Libraries
│   ├── fhe/                   # FHE integration
│   │   ├── client.ts          # Client-side operations
│   │   ├── server.ts          # Server-side operations
│   │   ├── keys.ts            # Key management
│   │   └── types.ts           # Type definitions
│   └── utils/                 # Helper functions
│       ├── security.ts
│       └── validation.ts
│
├── hooks/                     # Custom React Hooks
│   ├── useFHE.ts             # FHE operations hook
│   ├── useEncryption.ts      # Encryption hook with history
│   └── useComputation.ts     # Computation hook
│
└── types/                     # TypeScript Definitions
    ├── fhe.ts                # FHE-related types
    └── api.ts                # API types
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Basic understanding of Next.js and React

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Setup

This template works out of the box with default configurations. For production deployment, you may want to configure:

1. Chain ID (default: Sepolia testnet - 11155111)
2. Contract addresses
3. API endpoints

## 💻 Usage Examples

### Basic Encryption

```typescript
'use client';

import { useFHEVM, useEncrypt } from '@fhevm/sdk';

export function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();

  const handleEncrypt = async () => {
    const result = await encrypt(42, 'uint32');
    console.log('Encrypted:', result.hash);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isInitialized || isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
    </button>
  );
}
```

### Using Components

```typescript
import { EncryptionDemo } from '@/components/fhe/EncryptionDemo';
import { BankingExample } from '@/components/examples/BankingExample';

export default function Page() {
  return (
    <div>
      <EncryptionDemo />
      <BankingExample />
    </div>
  );
}
```

### Custom Hooks

```typescript
import { useEncryption } from '@/hooks/useEncryption';

export function MyComponent() {
  const { encrypt, encryptionHistory, clearHistory } = useEncryption();

  const handleEncrypt = async () => {
    await encrypt(100, 'uint32');
    console.log('History:', encryptionHistory);
  };

  return (
    <>
      <button onClick={handleEncrypt}>Encrypt</button>
      <button onClick={clearHistory}>Clear History</button>
    </>
  );
}
```

## 🏗️ Building Your Application

### Step 1: Set Up Providers

The template includes FHEVM Provider setup in `src/app/providers.tsx`. Customize the configuration:

```typescript
<FHEVMProvider
  config={{
    chainId: YOUR_CHAIN_ID,
  }}
  autoInit={true}
>
  {children}
</FHEVMProvider>
```

### Step 2: Use Components

Import and use pre-built components or create your own using the provided utilities.

### Step 3: Customize Styling

Modify `src/app/globals.css` to match your brand and design system.

### Step 4: Add Your Logic

Extend the API routes in `src/app/api/` to integrate with your smart contracts.

## 🎨 Customization

### Styling

The template uses CSS custom properties for easy theming. Modify variables in `globals.css`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #212529;
  --accent: #3b82f6;
}
```

### Components

All components are modular and can be customized:
- Modify existing components in `src/components/`
- Create new components following the same patterns
- Extend functionality using the provided hooks

### API Routes

Add custom endpoints in `src/app/api/`:
- Follow the existing patterns
- Handle errors appropriately
- Validate inputs using utilities from `src/lib/utils/`

## 📚 Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama fhEVM](https://docs.zama.ai/fhevm)

## 🤝 Contributing

This template is part of the FHEVM React Template monorepo. To contribute:

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see the main repository LICENSE file for details

---

Built with ❤️ using FHEVM SDK and Next.js 14
