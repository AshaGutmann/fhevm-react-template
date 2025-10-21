/**
 * SDK-integrated version of the Procurement Platform
 * This demonstrates how to use @fhevm/sdk in a vanilla TypeScript app
 */

import './style.enhanced.css';
import { ethers } from 'ethers';
import { createFHEVMInstance, encryptValue, decryptValue, enableDebug } from '@fhevm/sdk/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI, MATERIAL_TYPE_NAMES, STATUS_NAMES, MaterialType, ProcurementStatus } from './config/contract';
import type { ProcurementInfo, TransactionRecord } from './types';
import { formatAddress, formatDate, formatEther, isValidAddress, formatTimestamp } from './utils/format';
import { saveTransaction, getTransactionHistory, updateTransactionStatus, clearTransactionHistory } from './utils/storage';

// Enable SDK debug mode in development
if (import.meta.env.DEV) {
  enableDebug('info');
}

// ===== Global State =====
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;
let userAddress: string | null = null;
let fhevmInstance: any = null;

// ===== Toast Notification System =====
function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };

  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <span class="text-lg">${icons[type]}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ===== Loading Overlay =====
function showLoading(container: HTMLElement): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 flex items-center justify-center bg-bg-panel rounded-lg backdrop-blur-md z-10';
  overlay.innerHTML = '<div class="spinner spinner-lg"></div>';
  container.style.position = 'relative';
  container.appendChild(overlay);
  return overlay;
}

function hideLoading(overlay: HTMLElement) {
  overlay.remove();
}

// ===== Button Loading State =====
function setButtonLoading(button: HTMLButtonElement, loading: boolean) {
  const originalText = button.getAttribute('data-original-text') || button.textContent || '';

  if (loading) {
    button.setAttribute('data-original-text', originalText);
    button.classList.add('btn-loading');
    button.disabled = true;
    button.textContent = 'Processing...';
  } else {
    button.classList.remove('btn-loading');
    button.disabled = false;
    button.textContent = originalText;
  }
}

// ===== Wallet Connection with FHEVM SDK Initialization =====
async function connectWallet() {
  try {
    if (typeof window.ethereum === 'undefined') {
      showToast('Please install MetaMask!', 'error');
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = accounts[0];

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Initialize FHEVM using SDK
    const network = await provider.getNetwork();
    console.log('🔐 Initializing FHEVM SDK...');
    fhevmInstance = await createFHEVMInstance({
      chainId: Number(network.chainId),
    });
    console.log('✅ FHEVM SDK initialized');

    updateWalletStatus();
    showToast('Wallet connected & FHEVM initialized!', 'success');
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    showToast('Failed to connect wallet: ' + error.message, 'error');
  }
}

function updateWalletStatus() {
  const statusEl = document.getElementById('wallet-status');
  if (!statusEl) return;

  if (userAddress) {
    statusEl.innerHTML = `
      <div class="wallet-connected">
        <div class="wallet-indicator"></div>
        <span class="font-medium">${formatAddress(userAddress)}</span>
        <span class="badge badge-sm badge-success">Connected</span>
      </div>
    `;
  } else {
    statusEl.innerHTML = `
      <button id="connect-wallet-btn" class="btn btn-primary">
        Connect Wallet
      </button>
    `;

    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connectWallet);
    }
  }
}

// ===== Create Procurement with SDK Encryption =====
async function createProcurement(materialType: MaterialType, quantity: number, deadline: number) {
  if (!contract || !signer || !fhevmInstance) {
    showToast('Please connect wallet first', 'error');
    return;
  }

  const loadingEl = showLoading(document.querySelector('.tab-content.active') as HTMLElement);

  try {
    console.log('🔐 Encrypting quantity with SDK:', quantity);

    // Use SDK to encrypt the quantity
    const encryptedQuantity = await encryptValue(quantity, 'uint32');
    console.log('✅ Quantity encrypted');

    const tx = await contract.createProcurement(
      materialType,
      encryptedQuantity.data,  // Use encrypted data from SDK
      deadline
    );

    saveTransaction({
      hash: tx.hash,
      type: 'create',
      status: 'pending',
      timestamp: Date.now(),
      description: `Create ${MATERIAL_TYPE_NAMES[materialType]} procurement`
    });

    showToast('Creating procurement...', 'info');

    const receipt = await tx.wait();

    updateTransactionStatus(tx.hash, 'confirmed');
    showToast('Procurement created successfully!', 'success');

    hideLoading(loadingEl);
    refreshProcurementsList();
    updateTransactionHistory();
  } catch (error: any) {
    hideLoading(loadingEl);
    console.error('Failed to create procurement:', error);
    showToast('Failed to create procurement: ' + error.message, 'error');
  }
}

// ===== Submit Bid with SDK Encryption =====
async function submitBid(procurementId: number, bidAmount: number) {
  if (!contract || !signer || !fhevmInstance) {
    showToast('Please connect wallet first', 'error');
    return;
  }

  const loadingEl = showLoading(document.querySelector('.tab-content.active') as HTMLElement);

  try {
    console.log('🔐 Encrypting bid with SDK:', bidAmount);

    // Use SDK to encrypt the bid amount
    const encryptedBid = await encryptValue(bidAmount, 'uint32');
    console.log('✅ Bid encrypted');

    const tx = await contract.submitBid(procurementId, encryptedBid.data);

    saveTransaction({
      hash: tx.hash,
      type: 'bid',
      status: 'pending',
      timestamp: Date.now(),
      description: `Submit bid for procurement #${procurementId}`
    });

    showToast('Submitting bid...', 'info');

    const receipt = await tx.wait();

    updateTransactionStatus(tx.hash, 'confirmed');
    showToast('Bid submitted successfully!', 'success');

    hideLoading(loadingEl);
    refreshProcurementsList();
    updateTransactionHistory();
  } catch (error: any) {
    hideLoading(loadingEl);
    console.error('Failed to submit bid:', error);
    showToast('Failed to submit bid: ' + error.message, 'error');
  }
}

// ===== View Encrypted Bid with SDK Decryption =====
async function viewEncryptedBid(procurementId: number, bidId: number) {
  if (!contract || !signer || !fhevmInstance) {
    showToast('Please connect wallet first', 'error');
    return;
  }

  try {
    console.log('🔓 Requesting bid decryption with SDK...');

    // Get encrypted bid from contract
    const procurement = await contract.procurements(procurementId);
    // Note: This is a simplified example - actual implementation would get specific bid

    // Use SDK to decrypt (requires EIP-712 signature)
    showToast('Requesting signature for decryption...', 'info');

    // SDK handles EIP-712 signature and gateway interaction
    const decrypted = await decryptValue(
      CONTRACT_ADDRESS,
      procurement.encryptedQuantity,  // Example: decrypt quantity
      signer
    );

    console.log('✅ Decrypted value:', decrypted.toString());
    showToast(`Decrypted value: ${decrypted.toString()}`, 'success');
  } catch (error: any) {
    console.error('Failed to decrypt:', error);
    showToast('Failed to decrypt: ' + error.message, 'error');
  }
}

// ===== Placeholder functions (same as before) =====
async function refreshProcurementsList() {
  console.log('Refreshing procurements list...');
}

function updateTransactionHistory() {
  const history = getTransactionHistory();
  console.log('Transaction history:', history);
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Procurement Platform with @fhevm/sdk initialized');
  updateWalletStatus();

  // Add event listeners for forms
  const createForm = document.getElementById('create-procurement-form');
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);
      await createProcurement(
        Number(formData.get('materialType')),
        Number(formData.get('quantity')),
        Number(formData.get('deadline'))
      );
    });
  }
});

// Export for testing
export { createProcurement, submitBid, viewEncryptedBid };
