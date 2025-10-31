import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createFHEVMInstance, encrypt } from '@fhevm/sdk/core';
import { enableDebug } from '@fhevm/sdk/utils';
import { CONTRACT_ADDRESS, CONTRACT_ABI, MATERIAL_TYPE_NAMES, STATUS_NAMES, MaterialType } from './config/contract';
import type { ProcurementInfo, TransactionRecord } from './types';
import { formatAddress, formatDate, formatEther, formatTimestamp } from './utils/format';
import { saveTransaction, getTransactionHistory, updateTransactionStatus, clearTransactionHistory } from './utils/storage';
import { WalletStatus } from './components/WalletStatus';
import { TabNavigation } from './components/TabNavigation';
import { CreateProcurementTab } from './components/CreateProcurementTab';
import { SubmitBidTab } from './components/SubmitBidTab';
import { ViewProcurementsTab } from './components/ViewProcurementsTab';
import { ManageSuppliersTab } from './components/ManageSuppliersTab';
import { TransactionHistoryTab } from './components/TransactionHistoryTab';
import { Toast, ToastType } from './components/Toast';

// Enable SDK debug mode in development
if (import.meta.env.DEV) {
  enableDebug('info');
}

type Tab = 'create' | 'bid' | 'view' | 'manage' | 'history';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [fhevmInstance, setFhevmInstance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('create');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [nextToastId, setNextToastId] = useState(0);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = nextToastId;
    setNextToastId(id + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        showToast('Please install MetaMask!', 'error');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const address = accounts[0];

      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);

      const network = await newProvider.getNetwork();
      const chainId = Number(network.chainId);

      const instance = await createFHEVMInstance({ chainId });

      setProvider(newProvider);
      setSigner(newSigner);
      setContract(newContract);
      setUserAddress(address);
      setFhevmInstance(instance);

      showToast('Wallet connected successfully!', 'success');
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      showToast(`Failed to connect wallet: ${error.message}`, 'error');
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          setProvider(null);
          setSigner(null);
          setContract(null);
          setUserAddress(null);
          setFhevmInstance(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="container animate-fade-in">
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">
          🔒 Secure Procurement Platform
        </h1>
        <p className="text-lg text-text-muted mb-6">
          Confidential Supply Chain Management with FHE Technology
        </p>
        <WalletStatus
          userAddress={userAddress}
          onConnect={connectWallet}
        />
      </header>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="tab-content">
        {activeTab === 'create' && (
          <CreateProcurementTab
            contract={contract}
            fhevmInstance={fhevmInstance}
            userAddress={userAddress}
            showToast={showToast}
            saveTransaction={saveTransaction}
          />
        )}
        {activeTab === 'bid' && (
          <SubmitBidTab
            contract={contract}
            fhevmInstance={fhevmInstance}
            userAddress={userAddress}
            showToast={showToast}
            saveTransaction={saveTransaction}
          />
        )}
        {activeTab === 'view' && (
          <ViewProcurementsTab
            contract={contract}
            fhevmInstance={fhevmInstance}
            userAddress={userAddress}
            showToast={showToast}
            formatAddress={formatAddress}
            formatTimestamp={formatTimestamp}
            formatEther={formatEther}
            MATERIAL_TYPE_NAMES={MATERIAL_TYPE_NAMES}
            STATUS_NAMES={STATUS_NAMES}
          />
        )}
        {activeTab === 'manage' && (
          <ManageSuppliersTab
            contract={contract}
            userAddress={userAddress}
            showToast={showToast}
            formatAddress={formatAddress}
          />
        )}
        {activeTab === 'history' && (
          <TransactionHistoryTab
            userAddress={userAddress}
            getTransactionHistory={getTransactionHistory}
            updateTransactionStatus={updateTransactionStatus}
            clearTransactionHistory={clearTransactionHistory}
            provider={provider}
            formatAddress={formatAddress}
            formatTimestamp={formatTimestamp}
            showToast={showToast}
          />
        )}
      </div>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default App;
