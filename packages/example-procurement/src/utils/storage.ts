import type { TransactionRecord } from '../types';

const TX_HISTORY_KEY = 'secure-procurement-tx-history';
const MAX_HISTORY = 50;

export const saveTransaction = (tx: TransactionRecord): void => {
  try {
    const history = getTransactionHistory();
    history.unshift(tx);

    // Keep only the latest MAX_HISTORY transactions
    const trimmedHistory = history.slice(0, MAX_HISTORY);

    localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save transaction:', error);
  }
};

export const getTransactionHistory = (): TransactionRecord[] => {
  try {
    const stored = localStorage.getItem(TX_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load transaction history:', error);
    return [];
  }
};

export const updateTransactionStatus = (
  hash: string,
  status: 'success' | 'failed'
): void => {
  try {
    const history = getTransactionHistory();
    const index = history.findIndex(tx => tx.hash === hash);

    if (index !== -1) {
      history[index].status = status;
      localStorage.setItem(TX_HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('Failed to update transaction status:', error);
  }
};

export const clearTransactionHistory = (): void => {
  try {
    localStorage.removeItem(TX_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear transaction history:', error);
  }
};
