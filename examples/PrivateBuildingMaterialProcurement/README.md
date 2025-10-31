# Private Building Material Procurement Platform

A revolutionary blockchain-based platform **fully integrated with @fhevm/sdk** that leverages Fully Homomorphic Encryption (FHE) to enable confidential procurement of building materials while maintaining complete privacy throughout the supply chain management process.

## 🎯 SDK Integration Status

This example now includes **two versions**:

### ✅ SDK-Integrated Version (Recommended)
- **Tech Stack**: Vite + TypeScript + @fhevm/sdk
- **Entry Point**: `index-sdk.html` → `src/main.ts`
- **Features**: Full SDK integration with encryption utilities
- **Development**: `npm install && npm run dev`
- **Port**: http://localhost:5174

### 📄 Standalone Version (Legacy - GitHub Pages)
- **Tech Stack**: Pure HTML + CDN ethers.js
- **Entry Point**: `index.html`
- **Purpose**: GitHub Pages deployment (no build tools)
- **Live Demo**: [Vercel Deployment](https://private-building-material-procureme.vercel.app/)

---

## 🚀 Quick Start (SDK Version)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:5174` to see the SDK-integrated application.

---

## 💎 SDK Integration Highlights

The SDK-integrated version (`src/main.ts`) demonstrates best practices for using @fhevm/sdk:

### 1. Initialize FHEVM SDK on Wallet Connect

```typescript
import { createFHEVMInstance, encrypt, decrypt } from '@fhevm/sdk/core';
import { enableDebug } from '@fhevm/sdk/utils';

async function connectWallet() {
  // ... wallet connection ...

  // Auto-initialize FHEVM SDK
  const network = await provider.getNetwork();
  console.log('🔐 Initializing FHEVM SDK...');
  fhevmInstance = await createFHEVMInstance({
    chainId: Number(network.chainId),
  });
  console.log('✅ FHEVM SDK initialized');
}
```

### 2. Encrypt Procurement Data with SDK

```typescript
// Encrypt quantity
console.log('🔐 Encrypting quantity with SDK:', quantity);
const encryptedQuantity = await encrypt(parseInt(quantity), 'uint32');

// Encrypt quality grade
console.log('🔐 Encrypting quality grade with SDK:', qualityGrade);
const encryptedQualityGrade = await encrypt(parseInt(qualityGrade), 'uint32');

// Submit encrypted data to blockchain
const tx = await contract.createProcurement(
  materialType,
  encryptedQuantity.data,      // Encrypted with SDK
  encryptedQualityGrade.data,  // Encrypted with SDK
  specifications
);
```

### 3. Encrypt Bid Prices with SDK

```typescript
// Encrypt bid price
console.log('🔐 Encrypting bid price with SDK:', price);
const priceInWei = ethers.parseEther(price);
const encryptedPrice = await encrypt(Number(priceInWei), 'uint64');

// Submit encrypted bid
const tx = await contract.submitBid(
  procurementId,
  encryptedPrice.data,  // Encrypted with SDK
  deliveryTime,
  qualityScore,
  certifications
);

console.log('✅ Bid submitted with encrypted price!');
```

### 4. Enable Debug Mode in Development

```typescript
// Enable SDK debug mode for development
if (import.meta.env.DEV) {
  enableDebug('info');
}
```

---

## 🏗️ Core Concepts

### FHE-Powered Confidential Building Material Procurement
This platform transforms traditional building material procurement by implementing cutting-edge Fully Homomorphic Encryption technology. The system enables secure, private transactions where sensitive procurement data remains encrypted throughout the entire process, from initial requirements to final delivery.

### Privacy-First Building Supply Chain Management
Our innovative approach ensures that all stakeholder information, pricing details, quality specifications, and delivery schedules remain completely confidential while still enabling transparent and verifiable transactions on the blockchain.

## 🔐 Key Features

### **Confidential Procurement Process**
- **Encrypted Material Specifications**: All building material requirements are encrypted using FHE, ensuring competitors cannot access sensitive project details
- **Private Bidding System**: Suppliers can submit bids without revealing their pricing strategies to competitors
- **Secure Quality Assessment**: Quality grades and certifications are processed in encrypted form, maintaining supplier confidentiality

### **Privacy-Preserving Operations**
- **Anonymous Supplier Participation**: Suppliers can participate in procurement processes without exposing their identity until contract award
- **Encrypted Delivery Tracking**: Delivery schedules and logistics information remain private while ensuring accountability
- **Confidential Performance Metrics**: Historical performance data is processed without revealing sensitive business information

### **Transparent Yet Private Governance**
- **Verifiable Results**: All procurement decisions are cryptographically verifiable while maintaining privacy
- **Audit Trail**: Complete procurement history is maintained in encrypted form for compliance purposes
- **Fair Competition**: Ensures equal opportunity for all suppliers without information asymmetry

## 🛠️ Technical Architecture

### Smart Contract Features
- **FHE Integration**: Native support for fully homomorphic encryption operations
- **Privacy-Preserving Comparisons**: Secure comparison of encrypted bids and specifications
- **Encrypted State Management**: All sensitive data stored and processed in encrypted form
- **Zero-Knowledge Proofs**: Verification of compliance without revealing underlying data

### Material Categories
- **Structural Materials**: Steel, concrete, timber with encrypted specifications
- **Finishing Materials**: Tiles, paint, fixtures with private quality assessments
- **Specialized Components**: HVAC, electrical, plumbing with confidential performance metrics
- **Sustainable Materials**: Eco-friendly options with private sustainability scores

## 📊 Platform Benefits

### For Procurement Managers
- **Cost Optimization**: Achieve better pricing through confidential competitive bidding
- **Risk Mitigation**: Reduce information leakage to competitors and market manipulation
- **Quality Assurance**: Verify supplier capabilities without compromising sensitive project details
- **Compliance Management**: Maintain regulatory compliance while preserving commercial confidentiality

### For Building Material Suppliers
- **Protected Pricing Strategies**: Submit competitive bids without exposing pricing models
- **Fair Market Participation**: Equal access to opportunities regardless of company size
- **Reputation Building**: Build trust through verifiable performance without revealing sensitive operations
- **Market Intelligence**: Gain insights while maintaining own information privacy

### for Construction Projects
- **Budget Protection**: Keep project budgets confidential from competitors
- **Timeline Security**: Protect critical project milestones and delivery schedules
- **Specification Privacy**: Maintain confidentiality of unique project requirements
- **Vendor Relationship Management**: Build supplier relationships based on performance, not politics

## 🌐 Live Platform

**Live Demo**: [https://private-building-material-procureme.vercel.app/](https://private-building-material-procureme.vercel.app/)

**Contract Address**: `0x8545Dd8FB3D8815580BC8B6468353B46A8323140`

## 📹 Demonstration Materials

### Video Demonstrations
The platform includes comprehensive video demonstrations showcasing:
- Complete procurement workflow from material specification to contract award
- Privacy preservation mechanisms in action during the bidding process
- Real-time encrypted data processing and verification procedures
- User interface walkthrough for both procurement managers and suppliers

### On-Chain Transaction Evidence
All platform interactions are permanently recorded on the blockchain, providing:
- Cryptographic proof of fair procurement processes
- Immutable audit trails for regulatory compliance
- Verifiable execution of encrypted smart contract operations
- Transparent governance decisions while maintaining participant privacy

## 🔍 Use Cases

### **Large-Scale Construction Projects**
Perfect for major infrastructure projects where procurement details must remain confidential to prevent market manipulation and ensure fair competition among suppliers.

### **Government Building Programs**
Ideal for public sector construction where transparency and accountability are required while maintaining competitive procurement processes.

### **Corporate Real Estate Development**
Suitable for private sector developments where commercial sensitivity requires privacy protection throughout the supply chain.

### **Specialized Construction Applications**
Excellent for projects requiring unique materials or specifications that need protection from competitors and market speculation.

## 🚀 Getting Started

### Option 1: SDK-Integrated Development

```bash
# Clone the repository
cd examples/PrivateBuildingMaterialProcurement

# Install dependencies
npm install

# Start development server
npm run dev
```

### Option 2: Standalone Version

Visit our live platform at [https://private-building-material-procureme.vercel.app/](https://private-building-material-procureme.vercel.app/) to experience the future of confidential building material procurement.

The standalone version is ready to use with no setup required - simply connect your wallet and begin creating or participating in confidential procurement processes.

---

## 📦 Project Structure (SDK Version)

```
PrivateBuildingMaterialProcurement/
├── src/
│   ├── main.ts          # SDK-integrated main application
│   └── style.css        # Application styles
├── contracts/
│   └── PrivateBuildingMaterialProcurement.sol
├── index-sdk.html       # SDK version entry point
├── index.html           # Standalone version (legacy)
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── README.md
```

## 🔗 Repository

**GitHub Repository**: [https://github.com/AshaGutmann/PrivateBuildingMaterialProcurement](https://github.com/AshaGutmann/PrivateBuildingMaterialProcurement)

## 🛡️ Security & Privacy

This platform represents a breakthrough in construction industry technology, combining the transparency and immutability of blockchain with the privacy protection of advanced cryptographic techniques. By utilizing Fully Homomorphic Encryption, we ensure that sensitive business information remains protected while still enabling trustless, verifiable procurement processes.

The system maintains the highest standards of data protection while providing all stakeholders with the transparency and accountability they require for successful construction project management.

---

*Revolutionizing building material procurement through privacy-preserving blockchain technology*