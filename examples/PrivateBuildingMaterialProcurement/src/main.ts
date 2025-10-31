/**
 * Private Building Material Procurement Platform
 * Fully integrated with @fhevm/sdk
 */

import './style.css';
import { ethers } from 'ethers';
import { createFHEVMInstance, encrypt, decrypt } from '@fhevm/sdk/core';
import { enableDebug } from '@fhevm/sdk/utils';

// Enable SDK debug mode in development
if (import.meta.env.DEV) {
  enableDebug('info');
}

// Contract configuration
const CONTRACT_ADDRESS = "0x8545Dd8FB3D8815580BC8B6468353B46A8323140";

const CONTRACT_ABI = [
  "function createProcurement(uint8 _materialType, uint32 _quantity, uint32 _qualityGrade, string memory _specifications) external returns (uint32)",
  "function submitBid(uint32 _procurementId, uint64 _price, uint32 _deliveryTime, uint32 _qualityScore, string memory _certifications) external",
  "function authorizeSupplier(address supplier) external",
  "function updateSupplierReputation(address supplier, uint256 newReputation) external",
  "function getProcurementInfo(uint32 _procurementId) external view returns (uint8, string memory, uint8, address, uint256, uint256, uint256, address, uint256)",
  "function getSupplierBidStatus(uint32 _procurementId, address supplier) external view returns (bool, uint256, string memory)",
  "function getSupplierReputation(address supplier) external view returns (uint256)",
  "function isSupplierAuthorized(address supplier) external view returns (bool)",
  "function getActiveProcurements() external view returns (uint32[] memory)",
  "function procurementId() external view returns (uint32)"
];

const MATERIAL_TYPES = ['Cement', 'Steel', 'Concrete', 'Brick', 'Lumber', 'Insulation'];
const STATUS_TYPES = ['Open', 'Evaluation', 'Closed', 'Awarded'];

// Global state
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;
let fhevmInstance: any = null;

// Utility functions
function showStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const statusDiv = document.createElement('div');
  statusDiv.className = type;
  statusDiv.textContent = message;
  document.body.appendChild(statusDiv);
  setTimeout(() => statusDiv.remove(), 5000);
}

function showTab(tabName: string) {
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => tab.classList.remove('active'));

  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  const clickedNav = document.querySelector(`[data-tab="${tabName}"]`);
  if (clickedNav) {
    clickedNav.classList.add('active');
  }
}

// Connect wallet and initialize FHEVM SDK
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    showStatus('Please install MetaMask!', 'error');
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Initialize FHEVM SDK
    const network = await provider.getNetwork();
    console.log('🔐 Initializing FHEVM SDK...');
    fhevmInstance = await createFHEVMInstance({
      chainId: Number(network.chainId),
    });
    console.log('✅ FHEVM SDK initialized');

    const address = await signer.getAddress();
    const walletStatus = document.getElementById('walletStatus');
    if (walletStatus) {
      walletStatus.textContent = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
      walletStatus.className = 'status connected';
    }

    showStatus('Wallet connected & FHEVM SDK initialized!', 'success');
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    showStatus('Failed to connect wallet: ' + error.message, 'error');
  }
}

// Create procurement with SDK encryption
async function createProcurement(e: Event) {
  e.preventDefault();

  if (!contract || !fhevmInstance) {
    await connectWallet();
    if (!contract || !fhevmInstance) return;
  }

  try {
    const materialType = (document.getElementById('materialType') as HTMLSelectElement).value;
    const quantity = (document.getElementById('quantity') as HTMLInputElement).value;
    const qualityGrade = (document.getElementById('qualityGrade') as HTMLInputElement).value;
    const specifications = (document.getElementById('specifications') as HTMLTextAreaElement).value;

    if (!quantity || !qualityGrade || !specifications) {
      showStatus('Please fill in all fields', 'error');
      return;
    }

    console.log('🔐 Encrypting quantity with SDK:', quantity);
    const encryptedQuantity = await encrypt(parseInt(quantity), 'uint32');

    console.log('🔐 Encrypting quality grade with SDK:', qualityGrade);
    const encryptedQualityGrade = await encrypt(parseInt(qualityGrade), 'uint32');

    console.log('✅ Data encrypted, submitting to contract...');

    const tx = await contract.createProcurement(
      parseInt(materialType),
      encryptedQuantity.data,
      encryptedQualityGrade.data,
      specifications
    );

    showStatus('Transaction submitted! Hash: ' + tx.hash, 'info');
    await tx.wait();
    showStatus('Procurement created successfully with encrypted data!', 'success');

    // Clear form
    (document.getElementById('createForm') as HTMLFormElement).reset();
  } catch (error: any) {
    console.error('Failed to create procurement:', error);
    showStatus('Failed to create procurement: ' + error.message, 'error');
  }
}

// Submit bid with SDK encryption
async function submitBid(e: Event) {
  e.preventDefault();

  if (!contract || !fhevmInstance) {
    await connectWallet();
    if (!contract || !fhevmInstance) return;
  }

  try {
    const procurementId = (document.getElementById('bidProcurementId') as HTMLInputElement).value;
    const price = (document.getElementById('bidPrice') as HTMLInputElement).value;
    const deliveryTime = (document.getElementById('deliveryTime') as HTMLInputElement).value;
    const qualityScore = (document.getElementById('qualityScore') as HTMLInputElement).value;
    const certifications = (document.getElementById('certifications') as HTMLTextAreaElement).value;

    if (!procurementId || !price || !deliveryTime || !qualityScore) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }

    console.log('🔐 Encrypting bid price with SDK:', price);
    const priceInWei = ethers.parseEther(price);
    const encryptedPrice = await encrypt(Number(priceInWei), 'uint64');

    console.log('✅ Bid price encrypted, submitting to contract...');

    const tx = await contract.submitBid(
      parseInt(procurementId),
      encryptedPrice.data,
      parseInt(deliveryTime),
      parseInt(qualityScore),
      certifications
    );

    showStatus('Bid submitted! Hash: ' + tx.hash, 'info');
    await tx.wait();
    showStatus('Bid submitted successfully with encrypted price!', 'success');

    (document.getElementById('bidForm') as HTMLFormElement).reset();
  } catch (error: any) {
    console.error('Failed to submit bid:', error);
    showStatus('Failed to submit bid: ' + error.message, 'error');
  }
}

// Load procurements
async function loadProcurements() {
  if (!contract) {
    await connectWallet();
    return;
  }

  try {
    const container = document.getElementById('procurementsContainer');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading procurements...</div>';

    const activeProcurements = await contract.getActiveProcurements();

    if (activeProcurements.length === 0) {
      container.innerHTML = '<div class="loading">No active procurements found</div>';
      return;
    }

    let html = '<div class="grid">';

    for (let i = 0; i < activeProcurements.length; i++) {
      const id = activeProcurements[i];
      const info = await contract.getProcurementInfo(id);

      html += `
        <div class="procurement-card">
          <div class="material-type">${MATERIAL_TYPES[info[0]]}</div>
          <span class="status-badge status-${STATUS_TYPES[info[2]].toLowerCase()}">${STATUS_TYPES[info[2]]}</span>
          <h3>Procurement #${id}</h3>
          <p><strong>Specifications:</strong> ${info[1]}</p>
          <p><strong>Requester:</strong> ${info[3]}</p>
          <p><strong>Start Time:</strong> ${new Date(Number(info[4]) * 1000).toLocaleString()}</p>
          <p><strong>End Time:</strong> ${new Date(Number(info[5]) * 1000).toLocaleString()}</p>
          <p><strong>Suppliers:</strong> ${info[6]}</p>
          ${info[7] !== '0x0000000000000000000000000000000000000000' ? `<p><strong>Winner:</strong> ${info[7]}</p>` : ''}
          ${info[8] > 0 ? `<p><strong>Winning Price:</strong> ${ethers.formatEther(info[8])} ETH</p>` : ''}
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  } catch (error: any) {
    console.error('Failed to load procurements:', error);
    showStatus('Failed to load procurements: ' + error.message, 'error');
  }
}

// Authorize supplier
async function authorizeSupplier(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    return;
  }

  try {
    const address = (document.getElementById('supplierAddress') as HTMLInputElement).value;
    if (!ethers.isAddress(address)) {
      showStatus('Invalid address format', 'error');
      return;
    }

    const tx = await contract.authorizeSupplier(address);
    showStatus('Transaction submitted! Hash: ' + tx.hash, 'info');
    await tx.wait();
    showStatus('Supplier authorized successfully!', 'success');

    (document.getElementById('authorizeForm') as HTMLFormElement).reset();
  } catch (error: any) {
    console.error('Failed to authorize supplier:', error);
    showStatus('Failed to authorize supplier: ' + error.message, 'error');
  }
}

// Update reputation
async function updateReputation(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    return;
  }

  try {
    const address = (document.getElementById('reputationAddress') as HTMLInputElement).value;
    const score = (document.getElementById('reputationScore') as HTMLInputElement).value;

    if (!ethers.isAddress(address)) {
      showStatus('Invalid address format', 'error');
      return;
    }

    const tx = await contract.updateSupplierReputation(address, parseInt(score));
    showStatus('Transaction submitted! Hash: ' + tx.hash, 'info');
    await tx.wait();
    showStatus('Reputation updated successfully!', 'success');

    (document.getElementById('reputationForm') as HTMLFormElement).reset();
  } catch (error: any) {
    console.error('Failed to update reputation:', error);
    showStatus('Failed to update reputation: ' + error.message, 'error');
  }
}

// Check supplier status
async function checkSupplierStatus(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    return;
  }

  try {
    const address = (document.getElementById('checkAddress') as HTMLInputElement).value;
    if (!ethers.isAddress(address)) {
      showStatus('Invalid address format', 'error');
      return;
    }

    const [authorized, reputation] = await Promise.all([
      contract.isSupplierAuthorized(address),
      contract.getSupplierReputation(address)
    ]);

    const statusDiv = document.getElementById('supplierStatus');
    if (statusDiv) {
      statusDiv.innerHTML = `
        <div class="status ${authorized ? 'connected' : 'disconnected'}">
          Status: ${authorized ? 'Authorized' : 'Not Authorized'}<br>
          Reputation: ${reputation}/100
        </div>
      `;
    }
  } catch (error: any) {
    console.error('Failed to check supplier status:', error);
    showStatus('Failed to check supplier status: ' + error.message, 'error');
  }
}

// Initialize app
function init() {
  console.log('🚀 Private Building Material Procurement with @fhevm/sdk');

  // Setup tab navigation
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = (e.target as HTMLElement).getAttribute('data-tab');
      if (tabName) showTab(tabName);
    });
  });

  // Setup form listeners
  document.getElementById('createForm')?.addEventListener('submit', createProcurement);
  document.getElementById('bidForm')?.addEventListener('submit', submitBid);
  document.getElementById('authorizeForm')?.addEventListener('submit', authorizeSupplier);
  document.getElementById('reputationForm')?.addEventListener('submit', updateReputation);
  document.getElementById('checkForm')?.addEventListener('submit', checkSupplierStatus);
  document.getElementById('refreshBtn')?.addEventListener('click', loadProcurements);

  // Auto-connect wallet if available
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      })
      .catch(console.error);

    // Handle account changes
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        const walletStatus = document.getElementById('walletStatus');
        if (walletStatus) {
          walletStatus.textContent = 'Wallet: Not Connected';
          walletStatus.className = 'status disconnected';
        }
        provider = null;
        signer = null;
        contract = null;
        fhevmInstance = null;
      } else {
        connectWallet();
      }
    });
  }
}

// Start the application
init();

// Type declarations
declare global {
  interface Window {
    ethereum?: any;
  }
}
