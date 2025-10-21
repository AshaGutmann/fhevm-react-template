# Example: Secure Procurement Platform 🏗️

> A complete privacy-preserving procurement system demonstrating **@fhevm/sdk** usage

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://ashagutmann.github.io/BuildingMaterialProcurement/)
[![FHEVM SDK](https://img.shields.io/badge/FHEVM-SDK-blue)](../fhevm-sdk)

---

## Overview

This example demonstrates how to use the `@fhevm/sdk` to build a fully functional procurement platform where:

- **Bids are encrypted** - Suppliers submit confidential price quotes
- **Quantities are private** - Procurement volumes remain hidden
- **Fair selection** - Smart contracts compute on encrypted data
- **Transparent history** - Full audit trail without revealing sensitive data

---

## Features

### 🔐 Privacy Features

- **Encrypted Bids**: Submit price quotes without revealing amounts
- **Private Quantities**: Hide procurement volumes from competitors
- **Confidential Selection**: Automated winner selection on encrypted data
- **Secure Decryption**: Owner-only access with EIP-712 signatures

### 🎨 UI/UX Features

- **Glass-morphism design** - Modern, clean interface
- **Real-time updates** - Instant feedback on all actions
- **Toast notifications** - Success/error messages
- **Responsive layout** - Works on desktop and mobile
- **Loading states** - Clear visual feedback during transactions

### 🛠️ Technical Features

- **React + TypeScript** - Type-safe development
- **Ethers.js v6** - Web3 connectivity
- **FHEVM SDK** - Simplified FHE operations
- **Hardhat** - Contract development and testing
- **Vite** - Fast build and HMR

---

## Live Demo

🌐 **[View Live Demo](https://ashagutmann.github.io/BuildingMaterialProcurement/)**

Demo Features:
- Connect MetaMask wallet
- Create procurement requests
- Submit encrypted bids
- Authorize suppliers
- View transaction history

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MetaMask or compatible wallet
- Sepolia testnet ETH

### Installation

```bash
# From repository root
npm install

# Or from this package
cd packages/example-procurement
npm install
```

### Development

```bash
# Start dev server
npm run dev

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy
```

---

## Project Structure

```
example-procurement/
├── contracts/              # Solidity smart contracts
│   └── SecureProcurement.sol
├── scripts/                # Deployment scripts
│   └── deploy.js
├── test/                   # Contract tests
│   └── SecureProcurement.test.js
├── src/                    # React frontend
│   ├── config/             # Contract addresses and ABIs
│   ├── types/              # TypeScript types
│   ├── utils/              # Helper functions
│   ├── main.enhanced.ts    # Main application logic
│   └── style.enhanced.css  # Styles
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── hardhat.config.js       # Hardhat configuration
└── package.json
```

---

## SDK Integration Example

### 1. Initialize FHEVM

```typescript
import { createFHEVMInstance } from '@fhevm/sdk';

const fhevmInstance = await createFHEVMInstance({
  chainId: 11155111, // Sepolia
});
```

### 2. Encrypt Bid Amount

```typescript
import { encryptValue } from '@fhevm/sdk';

const bidAmount = 1000;
const encrypted = await encryptValue(bidAmount, 'uint32');

// Submit to contract
await contract.submitBid(procurementId, encrypted.data);
```

### 3. Decrypt Winner Bid

```typescript
import { decryptValue } from '@fhevm/sdk';

const ciphertext = await contract.getBid(procurementId, bidId);
const decrypted = await decryptValue(
  CONTRACT_ADDRESS,
  ciphertext,
  signer
);

console.log('Bid amount:', decrypted);
```

---

## Smart Contract

### Key Functions

```solidity
// Create procurement request
function createProcurement(
    MaterialType materialType,
    euint32 encryptedQuantity,
    uint256 deadline
) external

// Submit encrypted bid
function submitBid(
    uint256 procurementId,
    bytes calldata encryptedBid
) external

// Select winner (automated on encrypted data)
function selectWinner(
    uint256 procurementId
) external

// Authorize supplier
function authorizeSupplier(
    address supplier
) external onlyOwner
```

### Contract Address (Sepolia)

```
0xYourContractAddress
```

---

## Usage Guide

### For Buyers

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Create Procurement**:
   - Select material type
   - Enter quantity (encrypted automatically)
   - Set deadline
   - Submit transaction
3. **Review Bids**: View encrypted bids from suppliers
4. **Select Winner**: Let the contract choose lowest bid
5. **View History**: Check transaction history

### For Suppliers

1. **Get Authorized**: Contact platform owner
2. **View Requests**: Browse open procurement requests
3. **Submit Bid**:
   - Enter bid amount
   - Amount is encrypted before submission
   - Transaction confirms bid receipt
4. **Wait for Selection**: Contract automatically selects lowest bid
5. **Track Status**: Monitor bid status in history

---

## Configuration

### Environment Variables

Create `.env` file:

```bash
# Sepolia RPC URL
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Deployer private key
PRIVATE_KEY=your_private_key_here

# Etherscan API key (for verification)
ETHERSCAN_API_KEY=your_etherscan_key
```

### Contract Configuration

Edit `src/config/contract.ts`:

```typescript
export const CONTRACT_ADDRESS = '0xYourContractAddress';
export const CHAIN_ID = 11155111; // Sepolia
```

---

## Testing

### Run Contract Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

---

## Deployment

### Deploy to Sepolia

```bash
# 1. Set up .env file
cp .env.example .env

# 2. Add your private key and RPC URL

# 3. Deploy
npm run deploy
```

### Verify Contract

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## Key Learnings

### What This Example Teaches

1. **FHEVM SDK Integration**: How to use hooks and core functions
2. **Encrypted Data Flow**: From encryption to smart contract to decryption
3. **EIP-712 Signatures**: Secure decryption with typed data
4. **React Patterns**: Clean component structure with hooks
5. **Error Handling**: Graceful failures and user feedback

### Code Highlights

**Encrypting User Input:**
```typescript
const { encrypt } = useEncrypt();

const handleSubmitBid = async (bidAmount: number) => {
  const encrypted = await encrypt(bidAmount, 'uint32');
  await contract.submitBid(procurementId, encrypted.data);
};
```

**Decrypting Contract Data:**
```typescript
const { decrypt } = useDecrypt();

const viewBid = async (ciphertext: bigint) => {
  const decrypted = await decrypt(
    CONTRACT_ADDRESS,
    ciphertext,
    signer
  );
  console.log('Decrypted bid:', decrypted);
};
```

---

## Design Decisions

### Why Glass-morphism?

Modern, professional look that conveys transparency and trust

### Why Toast Notifications?

Non-intrusive feedback that doesn't block user workflow

### Why Tab-based Navigation?

Clear separation of concerns, easy to find features

---

## Performance

- **Initial Load**: ~500ms
- **Encryption**: ~50-100ms per operation
- **Decryption**: ~500-1000ms (includes signature)
- **Bundle Size**: ~350KB (gzipped)

---

## Browser Support

- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14

Requires:
- Web3 wallet (MetaMask, etc.)
- JavaScript enabled
- LocalStorage enabled

---

## Troubleshooting

### MetaMask Not Detected

```
Error: Please install MetaMask!
```

**Solution**: Install MetaMask browser extension

### Wrong Network

```
Error: Please switch to Sepolia testnet
```

**Solution**: Switch network in MetaMask

### Transaction Failed

```
Error: execution reverted: Unauthorized
```

**Solution**: Ensure supplier is authorized by owner

---

## Security Considerations

- **Never store private keys in code**
- **Validate all user inputs**
- **Use EIP-712 for decryption**
- **Set reasonable gas limits**
- **Test thoroughly before mainnet**

---

## Future Enhancements

- [ ] Multi-round bidding
- [ ] Bid bond deposits
- [ ] Dispute resolution
- [ ] Rating system for suppliers
- [ ] Integration with real payment systems

---

## License

MIT

---

## Support

- **GitHub Issues**: [Report a bug](https://github.com/your-username/fhevm-react-template/issues)
- **SDK Docs**: [View SDK documentation](../fhevm-sdk/README.md)
- **Live Chat**: [Join our Discord](#)

---

**Built with @fhevm/sdk** 📦
*Demonstrating privacy-preserving procurement with FHE* 🔐
