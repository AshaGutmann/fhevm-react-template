# SDK Integration Guide for PrivateBuildingMaterialProcurement

## Current Implementation

This example currently uses:
- Standalone HTML file with inline JavaScript
- Ethers.js loaded via CDN
- Direct contract interactions without FHE SDK

## How to Integrate @fhevm/sdk

To integrate the FHEVM SDK into this example, you would need to:

### Option 1: Convert to Build-Based Project

1. **Create a package.json**:

```json
{
  "name": "private-building-material-procurement",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@fhevm/sdk": "workspace:*",
    "ethers": "^6.13.0",
    "fhevmjs": "^0.6.2"
  },
  "devDependencies": {
    "vite": "^7.1.7"
  }
}
```

2. **Create src/main.js with SDK integration**:

```javascript
import { createFHEVMInstance, encrypt, decrypt } from '@fhevm/sdk/core';
import { enableDebug } from '@fhevm/sdk/utils';
import { ethers } from 'ethers';

// Initialize FHEVM SDK
let fhevmInstance = null;

async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask!');
    return;
  }

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Initialize FHEVM SDK
  const network = await provider.getNetwork();
  fhevmInstance = await createFHEVMInstance({
    chainId: Number(network.chainId),
  });

  console.log('✅ FHEVM SDK initialized');
  return { provider, signer };
}

async function createProcurement(materialType, quantity, qualityGrade, specifications) {
  if (!fhevmInstance) {
    throw new Error('FHEVM SDK not initialized');
  }

  // Encrypt quantity with SDK
  console.log('🔐 Encrypting quantity with SDK:', quantity);
  const encryptedQuantity = await encrypt(quantity, 'uint32');

  // Encrypt quality grade with SDK
  const encryptedQualityGrade = await encrypt(qualityGrade, 'uint32');

  // Send to contract
  const tx = await contract.createProcurement(
    materialType,
    encryptedQuantity.data,
    encryptedQualityGrade.data,
    specifications
  );

  await tx.wait();
  console.log('✅ Procurement created with encrypted data');
}

async function submitBid(procurementId, price, deliveryTime, qualityScore, certifications) {
  if (!fhevmInstance) {
    throw new Error('FHEVM SDK not initialized');
  }

  // Encrypt bid price with SDK
  console.log('🔐 Encrypting bid price with SDK');
  const priceInWei = ethers.parseEther(price);
  const encryptedPrice = await encrypt(Number(priceInWei), 'uint64');

  // Encrypt delivery time
  const encryptedDeliveryTime = await encrypt(deliveryTime, 'uint32');

  // Send to contract
  const tx = await contract.submitBid(
    procurementId,
    encryptedPrice.data,
    encryptedDeliveryTime.data,
    qualityScore,
    certifications
  );

  await tx.wait();
  console.log('✅ Bid submitted with encrypted data');
}
```

3. **Create vite.config.js**:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
```

4. **Update index.html** to load the bundled JavaScript instead of inline script.

### Option 2: Reference the SDK-Integrated Examples

Instead of modifying this standalone example, you can reference the fully integrated examples:

1. **example-procurement** - Vite + TypeScript with full SDK integration
   - Location: `../../example-procurement`
   - Features: Complete SDK integration with encryption/decryption
   - Run: `cd ../example-procurement && npm install && npm run dev`

2. **example-nextjs** - Next.js with SDK integration
   - Location: `../../example-nextjs`
   - Features: React hooks, components, and API routes
   - Run: `cd ../example-nextjs && npm install && npm run dev`

## Key Improvements with SDK Integration

1. **Encrypted Values**: Quantity, quality grade, price, and delivery time are encrypted before sending to blockchain
2. **Secure Decryption**: EIP-712 signatures for authorized decryption
3. **Type Safety**: TypeScript definitions for all SDK functions
4. **Better Error Handling**: SDK provides structured error types
5. **Debug Support**: Built-in debugging utilities
6. **Framework Agnostic**: Can be used in any JavaScript environment

## Migration Benefits

| Without SDK | With SDK |
|-------------|----------|
| Manual encryption setup | Automatic FHEVM initialization |
| Direct fhevmjs usage | High-level SDK API |
| Custom error handling | Built-in error types |
| Manual EIP-712 signatures | Automated signature handling |
| No TypeScript support | Full TypeScript definitions |

## Recommended Approach

For this standalone HTML example, we recommend:

1. **Keep as-is** for simple demonstrations and GitHub Pages deployment
2. **Reference example-procurement** for production-ready SDK integration
3. **Use templates/nextjs** for new projects requiring SDK integration

## See Also

- [SDK Documentation](../../../packages/fhevm-sdk/README.md)
- [Example Procurement (SDK Integrated)](../example-procurement/README.md)
- [Next.js Example](../example-nextjs/README.md)
- [Quick Start Guide](../../../docs/QUICKSTART.md)
