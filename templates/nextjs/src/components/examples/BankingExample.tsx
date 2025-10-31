'use client';

import { useState } from 'react';
import { useFHEVM, useEncrypt } from '@fhevm/sdk';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

/**
 * Banking Example Component
 * Demonstrates private financial transactions using FHE
 */
export function BankingExample() {
  const { isInitialized } = useFHEVM();
  const { encrypt, isEncrypting } = useEncrypt();

  const [balance, setBalance] = useState('10000');
  const [transferAmount, setTransferAmount] = useState('');
  const [encryptedBalance, setEncryptedBalance] = useState<string>('');
  const [transactions, setTransactions] = useState<Array<{
    amount: string;
    type: 'deposit' | 'withdrawal' | 'transfer';
    timestamp: number;
  }>>([]);

  const handleEncryptBalance = async () => {
    try {
      const result = await encrypt(Number(balance), 'uint64');
      setEncryptedBalance(result.hash);
    } catch (error) {
      console.error('Balance encryption failed:', error);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount) return;

    try {
      await encrypt(Number(transferAmount), 'uint64');
      setTransactions([
        ...transactions,
        {
          amount: transferAmount,
          type: 'transfer',
          timestamp: Date.now(),
        },
      ]);
      setTransferAmount('');
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  return (
    <Card
      title="Private Banking"
      description="Secure financial transactions with encrypted balances"
    >
      <div className="space-y-6">
        {/* Balance Section */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Account Balance</span>
            <span className={`badge ${encryptedBalance ? 'badge-success' : 'badge-error'}`}>
              {encryptedBalance ? 'Encrypted' : 'Not Encrypted'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-2">
            ${Number(balance).toLocaleString()}
          </div>
          <Button
            size="sm"
            onClick={handleEncryptBalance}
            disabled={!isInitialized}
            isLoading={isEncrypting}
          >
            Encrypt Balance
          </Button>
        </div>

        {encryptedBalance && (
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-1">Encrypted Balance:</p>
            <code className="text-xs break-all text-gray-500">{encryptedBalance.slice(0, 40)}...</code>
          </div>
        )}

        {/* Transfer Section */}
        <div>
          <h4 className="font-medium mb-3">Private Transfer</h4>
          <Input
            type="number"
            label="Transfer Amount"
            placeholder="Enter amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <Button
            onClick={handleTransfer}
            disabled={!isInitialized || !transferAmount}
            className="w-full mt-3"
          >
            Execute Private Transfer
          </Button>
        </div>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recent Transactions</h4>
            <div className="space-y-2">
              {transactions.slice(-3).reverse().map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm capitalize">{tx.type}</span>
                  <span className="text-sm font-medium">${tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-sm text-green-800 mb-2">Privacy Features:</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>✓ Encrypted account balances</li>
            <li>✓ Private transaction amounts</li>
            <li>✓ Confidential transfers</li>
            <li>✓ Secure balance verification</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
