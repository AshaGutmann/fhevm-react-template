# Deployment Guide

## Overview

This guide covers deploying the FHEVM SDK examples to various platforms.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MetaMask or Web3 wallet
- Access to Sepolia testnet (or target network)

## Smart Contract Deployment

### 1. Configure Environment

```bash
cd examples/example-procurement

# Copy environment template
cp .env.example .env

# Edit .env with your values
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Deploy to Sepolia

```bash
npm run deploy
```

The deployment script will output the contract address. Update your frontend configuration with this address.

## Frontend Deployment

### Next.js Example (Vercel)

1. **Prepare for deployment**

```bash
cd examples/example-nextjs
npm run build
```

2. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

3. **Configure Environment Variables** (in Vercel dashboard)

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed contract address
- `NEXT_PUBLIC_CHAIN_ID`: Network chain ID (11155111 for Sepolia)

### Vite Example (GitHub Pages / Netlify)

1. **Build the project**

```bash
cd examples/example-procurement
npm run build
```

2. **Deploy to GitHub Pages**

```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

3. **Deploy to Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Configuration

### Update Contract Address

After deploying smart contracts, update the contract address in your frontend:

**Vite Example:**
```typescript
// src/config/contract.ts
export const CONTRACT_ADDRESS = '0xYourContractAddress';
```

**Next.js Example:**
```typescript
// .env.local
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

### Network Configuration

Ensure your app is configured for the correct network:

```typescript
// FHEVM SDK initialization
const instance = await createFHEVMInstance({
  chainId: 11155111, // Sepolia
  // or 8009 for Zama devnet
});
```

## Verification

After deployment:

1. ✅ Visit your deployed URL
2. ✅ Connect MetaMask to the correct network
3. ✅ Test encryption/decryption operations
4. ✅ Verify smart contract interactions
5. ✅ Check transaction history on block explorer

## Troubleshooting

### Build Errors

**Issue:** Module not found errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue:** TypeScript errors
```bash
# Solution: Check TypeScript version compatibility
npm install typescript@~5.9.3
```

### Runtime Errors

**Issue:** FHEVM initialization fails
- Check that you're on the correct network
- Verify chain ID matches configuration
- Ensure wallet is connected

**Issue:** Contract interaction fails
- Verify contract address is correct
- Check network configuration
- Ensure contract is deployed on the target network

## Production Checklist

- [ ] Smart contracts deployed and verified
- [ ] Frontend built and tested locally
- [ ] Environment variables configured
- [ ] Contract addresses updated in frontend
- [ ] Network configuration verified
- [ ] Error handling tested
- [ ] Performance optimized
- [ ] Security audit completed (if applicable)
- [ ] Documentation updated
- [ ] Demo video prepared

## Live Deployments

- **Procurement Platform Demo**: https://ashagutmann.github.io/BuildingMaterialProcurement/
- **Next.js Template**: [Deploy to Vercel](https://vercel.com/import/project)

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/AshaGutmann/fhevm-react-template/issues)
- Review [SDK Documentation](../packages/fhevm-sdk/README.md)
