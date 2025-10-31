import './style.enhanced.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, MATERIAL_TYPE_NAMES, STATUS_NAMES, MaterialType, ProcurementStatus } from './config/contract';
import type { ProcurementInfo, TransactionRecord } from './types';
import { formatAddress, formatDate, formatEther, isValidAddress, formatTimestamp } from './utils/format';
import { saveTransaction, getTransactionHistory, updateTransactionStatus, clearTransactionHistory } from './utils/storage';

// ===== Global State =====
let provider: ethers.BrowserProvider | null = null;
let signer: ethers.Signer | null = null;
let contract: ethers.Contract | null = null;
let userAddress: string | null = null;

// ===== Toast Notification System (100% 获奖项目使用) =====
function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Add icon based on type
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

// ===== Loading Overlay (90%+ 使用) =====
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

// ===== Wallet Connection (RainbowKit风格) =====
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

    updateWalletStatus();
    showToast('Wallet connected successfully!', 'success');
  } catch (error: any) {
    console.error('Failed to connect wallet:', error);
    showToast('Failed to connect wallet: ' + error.message, 'error');
  }
}

function updateWalletStatus() {
  const statusEl = document.getElementById('wallet-status');
  if (!statusEl) return;

  if (userAddress) {
    // 玻璃态钱包状态卡片
    statusEl.innerHTML = `
      <div class="panel inline-block">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 bg-success rounded-full animate-pulse-glow"></div>
          <span class="font-semibold address">${formatAddress(userAddress)}</span>
          <span class="badge badge-success">Connected</span>
        </div>
      </div>
    `;
  } else {
    statusEl.innerHTML = `
      <button class="btn btn-primary" id="connect-wallet-btn">
        Connect Wallet
      </button>
    `;
    const btn = document.getElementById('connect-wallet-btn');
    btn?.addEventListener('click', connectWallet);
  }
}

// ===== Tab Management (100% 使用) =====
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      if (!tabName) return;

      // Update tab states with animation
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update content visibility
      contents.forEach(content => {
        if (content.id === `tab-${tabName}`) {
          content.classList.remove('hidden');
          content.classList.add('animate-fade-in');
        } else {
          content.classList.add('hidden');
        }
      });

      // Load data for specific tabs
      if (tabName === 'view') {
        loadProcurements();
      } else if (tabName === 'history') {
        renderTransactionHistory();
      }
    });
  });
}

// ===== Create Procurement (错误处理增强) =====
async function handleCreateProcurement(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    if (!contract) return;
  }

  const form = e.target as HTMLFormElement;
  const materialType = (form.querySelector('#material-type') as HTMLSelectElement).value;
  const quantity = (form.querySelector('#quantity') as HTMLInputElement).value;
  const qualityGrade = (form.querySelector('#quality-grade') as HTMLInputElement).value;
  const specifications = (form.querySelector('#specifications') as HTMLTextAreaElement).value;

  if (!quantity || !qualityGrade || !specifications) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  setButtonLoading(submitBtn, true);

  try {
    const tx = await contract.createProcurement(
      parseInt(materialType),
      parseInt(quantity),
      parseInt(qualityGrade),
      specifications
    );

    showToast(`Transaction submitted: ${formatAddress(tx.hash)}`, 'info');

    // Save to history
    saveTransaction({
      hash: tx.hash,
      type: 'procurement',
      timestamp: Date.now(),
      status: 'pending',
      description: `Create procurement for ${MATERIAL_TYPE_NAMES[parseInt(materialType) as MaterialType]}`
    });

    const receipt = await tx.wait();
    updateTransactionStatus(tx.hash, 'success');

    showToast('Procurement created successfully! ✓', 'success');

    // Clear form
    form.reset();
  } catch (error: any) {
    console.error('Failed to create procurement:', error);

    // Enhanced error handling
    if (error.code === 'ACTION_REJECTED') {
      showToast('Transaction cancelled by user', 'info');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      showToast('Insufficient funds for transaction', 'warning');
    } else {
      showToast('Failed to create procurement: ' + (error.reason || error.message), 'error');
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// ===== Submit Bid =====
async function handleSubmitBid(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    if (!contract) return;
  }

  const form = e.target as HTMLFormElement;
  const procurementId = (form.querySelector('#bid-procurement-id') as HTMLInputElement).value;
  const price = (form.querySelector('#bid-price') as HTMLInputElement).value;
  const deliveryTime = (form.querySelector('#delivery-time') as HTMLInputElement).value;
  const qualityScore = (form.querySelector('#quality-score') as HTMLInputElement).value;
  const certifications = (form.querySelector('#certifications') as HTMLTextAreaElement).value;

  if (!procurementId || !price || !deliveryTime || !qualityScore) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  setButtonLoading(submitBtn, true);

  try {
    const priceInWei = ethers.parseEther(price);

    const tx = await contract.submitBid(
      parseInt(procurementId),
      priceInWei,
      parseInt(deliveryTime),
      parseInt(qualityScore),
      certifications
    );

    showToast(`Bid submitted: ${formatAddress(tx.hash)}`, 'info');

    saveTransaction({
      hash: tx.hash,
      type: 'bid',
      timestamp: Date.now(),
      status: 'pending',
      description: `Submit bid for procurement #${procurementId}`
    });

    await tx.wait();
    updateTransactionStatus(tx.hash, 'success');

    showToast('Bid submitted successfully! ✓', 'success');
    form.reset();
  } catch (error: any) {
    console.error('Failed to submit bid:', error);

    if (error.code === 'ACTION_REJECTED') {
      showToast('Transaction cancelled by user', 'info');
    } else {
      showToast('Failed to submit bid: ' + (error.reason || error.message), 'error');
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// ===== Load Procurements (玻璃态卡片) =====
async function loadProcurements() {
  if (!contract) {
    await connectWallet();
    if (!contract) return;
  }

  const container = document.getElementById('procurements-container');
  if (!container) return;

  const loading = showLoading(container);

  try {
    const activeProcurements = await contract.getActiveProcurements();

    hideLoading(loading);

    if (activeProcurements.length === 0) {
      container.innerHTML = `
        <div class="panel text-center text-text-muted py-12">
          No active procurements found
        </div>
      `;
      return;
    }

    let html = '';

    for (const id of activeProcurements) {
      const info = await contract.getProcurementInfo(id);

      const procurement: ProcurementInfo = {
        id: Number(id),
        materialType: info[0],
        specifications: info[1],
        status: info[2],
        requester: info[3],
        startTime: info[4],
        endTime: info[5],
        supplierCount: info[6],
        winningSupplier: info[7],
        winningPrice: info[8]
      };

      html += renderProcurementCard(procurement);
    }

    container.innerHTML = html;
  } catch (error: any) {
    hideLoading(loading);
    console.error('Failed to load procurements:', error);
    showToast('Failed to load procurements: ' + error.message, 'error');
  }
}

function renderProcurementCard(procurement: ProcurementInfo): string {
  const statusBadgeClass = getStatusBadgeClass(procurement.status);

  return `
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <span class="badge badge-primary">${MATERIAL_TYPE_NAMES[procurement.materialType]}</span>
        <span class="badge ${statusBadgeClass}">${STATUS_NAMES[procurement.status]}</span>
      </div>

      <h3 class="text-xl font-bold mb-4">Procurement #${procurement.id}</h3>

      <div class="space-y-3 text-sm">
        <div>
          <span class="stat-label">Requester</span>
          <p class="address text-text">${formatAddress(procurement.requester)}</p>
        </div>

        <div>
          <span class="stat-label">Specifications</span>
          <p class="text-text">${procurement.specifications}</p>
        </div>

        <div class="layout-grid-2">
          <div>
            <span class="stat-label">Start Time</span>
            <p class="text-sm">${formatDate(procurement.startTime)}</p>
          </div>
          <div>
            <span class="stat-label">End Time</span>
            <p class="text-sm">${formatDate(procurement.endTime)}</p>
          </div>
        </div>

        <div class="stat-card">
          <span class="stat-label">Suppliers</span>
          <span class="stat-value">${procurement.supplierCount.toString()}</span>
        </div>

        ${procurement.winningSupplier !== '0x0000000000000000000000000000000000000000' ? `
          <div class="divider"></div>
          <div>
            <span class="stat-label">Winner</span>
            <p class="address text-success">${formatAddress(procurement.winningSupplier)}</p>
          </div>
        ` : ''}

        ${procurement.winningPrice > 0n ? `
          <div class="stat-card">
            <span class="stat-label">Winning Price</span>
            <span class="stat-value text-success">${formatEther(procurement.winningPrice)} ETH</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function getStatusBadgeClass(status: ProcurementStatus): string {
  switch (status) {
    case ProcurementStatus.OPEN:
      return 'badge-success';
    case ProcurementStatus.EVALUATION:
      return 'badge-warning';
    case ProcurementStatus.AWARDED:
      return 'badge-primary';
    case ProcurementStatus.CLOSED:
      return 'badge-neutral';
    default:
      return 'badge-neutral';
  }
}

// ===== Authorize Supplier =====
async function handleAuthorizeSupplier(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    if (!contract) return;
  }

  const form = e.target as HTMLFormElement;
  const address = (form.querySelector('#supplier-address') as HTMLInputElement).value;

  if (!isValidAddress(address)) {
    showToast('Invalid address format', 'error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  setButtonLoading(submitBtn, true);

  try {
    const tx = await contract.authorizeSupplier(address);

    showToast(`Transaction submitted: ${formatAddress(tx.hash)}`, 'info');

    saveTransaction({
      hash: tx.hash,
      type: 'authorize',
      timestamp: Date.now(),
      status: 'pending',
      description: `Authorize supplier ${formatAddress(address)}`
    });

    await tx.wait();
    updateTransactionStatus(tx.hash, 'success');

    showToast('Supplier authorized successfully! ✓', 'success');
    form.reset();
  } catch (error: any) {
    console.error('Failed to authorize supplier:', error);

    if (error.code === 'ACTION_REJECTED') {
      showToast('Transaction cancelled by user', 'info');
    } else {
      showToast('Failed to authorize supplier: ' + (error.reason || error.message), 'error');
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// ===== Update Reputation =====
async function handleUpdateReputation(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    if (!contract) return;
  }

  const form = e.target as HTMLFormElement;
  const address = (form.querySelector('#reputation-address') as HTMLInputElement).value;
  const score = (form.querySelector('#reputation-score') as HTMLInputElement).value;

  if (!isValidAddress(address)) {
    showToast('Invalid address format', 'error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  setButtonLoading(submitBtn, true);

  try {
    const tx = await contract.updateSupplierReputation(address, parseInt(score));

    showToast(`Transaction submitted: ${formatAddress(tx.hash)}`, 'info');

    saveTransaction({
      hash: tx.hash,
      type: 'reputation',
      timestamp: Date.now(),
      status: 'pending',
      description: `Update reputation for ${formatAddress(address)} to ${score}`
    });

    await tx.wait();
    updateTransactionStatus(tx.hash, 'success');

    showToast('Reputation updated successfully! ✓', 'success');
    form.reset();
  } catch (error: any) {
    console.error('Failed to update reputation:', error);

    if (error.code === 'ACTION_REJECTED') {
      showToast('Transaction cancelled by user', 'info');
    } else {
      showToast('Failed to update reputation: ' + (error.reason || error.message), 'error');
    }
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// ===== Check Supplier Status =====
async function handleCheckSupplier(e: Event) {
  e.preventDefault();

  if (!contract) {
    await connectWallet();
    if (!contract) return;
  }

  const form = e.target as HTMLFormElement;
  const address = (form.querySelector('#check-address') as HTMLInputElement).value;

  if (!isValidAddress(address)) {
    showToast('Invalid address format', 'error');
    return;
  }

  const statusContainer = document.getElementById('supplier-status');
  if (!statusContainer) return;

  const loading = showLoading(statusContainer);

  try {
    const [authorized, reputation] = await Promise.all([
      contract.isSupplierAuthorized(address),
      contract.getSupplierReputation(address)
    ]);

    hideLoading(loading);

    const statusBadge = authorized ? 'badge-success' : 'badge-error';

    statusContainer.innerHTML = `
      <div class="panel">
        <div class="grid grid-cols-2 gap-4">
          <div class="stat-card">
            <span class="stat-label">Status</span>
            <span class="badge ${statusBadge} mt-2">
              ${authorized ? '✓ Authorized' : '✗ Not Authorized'}
            </span>
          </div>

          <div class="stat-card">
            <span class="stat-label">Reputation</span>
            <span class="stat-value">${reputation.toString()}<span class="text-sm text-text-muted">/100</span></span>
          </div>
        </div>
      </div>
    `;
  } catch (error: any) {
    hideLoading(loading);
    console.error('Failed to check supplier status:', error);
    showToast('Failed to check supplier status: ' + error.message, 'error');
  }
}

// ===== Transaction History =====
function renderTransactionHistory() {
  const container = document.getElementById('history-container');
  if (!container) return;

  const history = getTransactionHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="panel text-center text-text-muted py-12">
        No transaction history found
      </div>
    `;
    return;
  }

  let html = '<div class="space-y-4">';

  history.forEach(tx => {
    const statusBadge = getTransactionStatusBadge(tx.status);
    const typeBadge = getTransactionTypeBadge(tx.type);

    html += `
      <div class="card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <span class="badge ${typeBadge}">${tx.type}</span>
              <span class="badge ${statusBadge}">${tx.status}</span>
            </div>
            <p class="mb-2">${tx.description}</p>
            <div class="flex items-center gap-3 text-sm text-text-muted">
              <span>${formatTimestamp(tx.timestamp)}</span>
              <span class="address">${formatAddress(tx.hash)}</span>
            </div>
          </div>
          <a
            href="https://sepolia.etherscan.io/tx/${tx.hash}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-secondary text-xs px-3 py-2"
          >
            View →
          </a>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function getTransactionStatusBadge(status: string): string {
  switch (status) {
    case 'success':
      return 'badge-success';
    case 'failed':
      return 'badge-error';
    case 'pending':
      return 'badge-warning';
    default:
      return 'badge-neutral';
  }
}

function getTransactionTypeBadge(type: string): string {
  switch (type) {
    case 'procurement':
      return 'badge-primary';
    case 'bid':
      return 'badge-encrypted';
    case 'authorize':
      return 'badge-success';
    case 'reputation':
      return 'badge-warning';
    default:
      return 'badge-neutral';
  }
}

// ===== Event Listeners =====
function setupEventListeners() {
  // Forms
  const createForm = document.getElementById('create-procurement-form');
  createForm?.addEventListener('submit', handleCreateProcurement);

  const bidForm = document.getElementById('submit-bid-form');
  bidForm?.addEventListener('submit', handleSubmitBid);

  const authorizeForm = document.getElementById('authorize-supplier-form');
  authorizeForm?.addEventListener('submit', handleAuthorizeSupplier);

  const reputationForm = document.getElementById('update-reputation-form');
  reputationForm?.addEventListener('submit', handleUpdateReputation);

  const checkForm = document.getElementById('check-supplier-form');
  checkForm?.addEventListener('submit', handleCheckSupplier);

  // Buttons
  const refreshBtn = document.getElementById('refresh-procurements');
  refreshBtn?.addEventListener('click', loadProcurements);

  const clearHistoryBtn = document.getElementById('clear-history');
  clearHistoryBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear transaction history?')) {
      clearTransactionHistory();
      renderTransactionHistory();
      showToast('Transaction history cleared', 'success');
    }
  });

  // Wallet account change
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        userAddress = null;
        provider = null;
        signer = null;
        contract = null;
        updateWalletStatus();
        showToast('Wallet disconnected', 'info');
      } else {
        connectWallet();
      }
    });

    window.ethereum.on('chainChanged', () => {
      showToast('Network changed. Reloading...', 'info');
      setTimeout(() => window.location.reload(), 1500);
    });
  }
}

// ===== Initialize App =====
function init() {
  setupTabs();
  setupEventListeners();
  updateWalletStatus();

  // Auto-connect if previously connected
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      })
      .catch(console.error);
  }
}

// Start the app
init();

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
