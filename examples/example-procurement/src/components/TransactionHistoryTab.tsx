import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import type { TransactionRecord } from '../types';

interface TransactionHistoryTabProps {
  userAddress: string | null;
  getTransactionHistory: (address: string) => TransactionRecord[];
  updateTransactionStatus: (hash: string, status: string, provider: ethers.Provider) => Promise<void>;
  clearTransactionHistory: (address: string) => void;
  provider: ethers.BrowserProvider | null;
  formatAddress: (address: string) => string;
  formatTimestamp: (timestamp: number) => string;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function TransactionHistoryTab({
  userAddress,
  getTransactionHistory,
  updateTransactionStatus,
  clearTransactionHistory,
  provider,
  formatAddress,
  formatTimestamp,
  showToast,
}: TransactionHistoryTabProps) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = () => {
    if (!userAddress) {
      setTransactions([]);
      return;
    }

    const history = getTransactionHistory(userAddress);
    setTransactions(history);
  };

  const refreshStatuses = async () => {
    if (!provider || !userAddress) return;

    setRefreshing(true);
    try {
      const history = getTransactionHistory(userAddress);
      for (const tx of history) {
        if (tx.status === 'pending') {
          await updateTransactionStatus(tx.hash, tx.status, provider);
        }
      }
      loadTransactions();
      showToast('Transaction statuses updated', 'success');
    } catch (error: any) {
      console.error('Refresh statuses error:', error);
      showToast(`Failed to refresh: ${error.message}`, 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClear = () => {
    if (!userAddress) return;
    if (confirm('Are you sure you want to clear transaction history?')) {
      clearTransactionHistory(userAddress);
      loadTransactions();
      showToast('Transaction history cleared', 'info');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [userAddress]);

  if (!userAddress) {
    return (
      <div className="tab-panel active">
        <div className="card text-center">
          <p className="text-text-muted">Please connect your wallet to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-panel active">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <div className="flex gap-2">
          <button
            onClick={refreshStatuses}
            className="btn btn-secondary"
            disabled={refreshing || !provider}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Status'}
          </button>
          <button
            onClick={handleClear}
            className="btn btn-danger"
            disabled={transactions.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="card text-center">
          <p className="text-text-muted">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.hash} className="card">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <strong>Type:</strong> {tx.type}
                </div>
                <div className="col-span-2">
                  <strong>Hash:</strong>{' '}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    {formatAddress(tx.hash)}
                  </a>
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`badge ${
                      tx.status === 'confirmed'
                        ? 'badge-success'
                        : tx.status === 'failed'
                        ? 'badge-error'
                        : 'badge-warning'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div>
                  <strong>Time:</strong> {formatTimestamp(tx.timestamp)}
                </div>
                {tx.details && (
                  <div className="col-span-2">
                    <strong>Details:</strong>
                    <pre className="mt-2 p-2 bg-bg-panel rounded text-sm">
                      {JSON.stringify(tx.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
