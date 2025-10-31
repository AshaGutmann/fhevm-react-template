import { useState } from 'react';
import { ethers } from 'ethers';

interface ManageSuppliersTabProps {
  contract: ethers.Contract | null;
  userAddress: string | null;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  formatAddress: (address: string) => string;
}

export function ManageSuppliersTab({
  contract,
  userAddress,
  showToast,
  formatAddress,
}: ManageSuppliersTabProps) {
  const [registerLoading, setRegisterLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [supplierAddress, setSupplierAddress] = useState('');
  const [checkAddress, setCheckAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract || !userAddress) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!supplierAddress) {
      showToast('Please enter a supplier address', 'error');
      return;
    }

    setRegisterLoading(true);
    try {
      if (!ethers.isAddress(supplierAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      showToast('Registering supplier...', 'info');
      const tx = await contract.registerSupplier(supplierAddress);
      await tx.wait();

      showToast('Supplier registered successfully!', 'success');
      setSupplierAddress('');
    } catch (error: any) {
      console.error('Register supplier error:', error);
      showToast(`Failed: ${error.message}`, 'error');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleCheckSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!checkAddress) {
      showToast('Please enter an address to check', 'error');
      return;
    }

    setCheckLoading(true);
    try {
      if (!ethers.isAddress(checkAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      const registered = await contract.isSupplierRegistered(checkAddress);
      setIsRegistered(registered);
      showToast(
        registered
          ? 'Supplier is registered'
          : 'Supplier is not registered',
        registered ? 'success' : 'info'
      );
    } catch (error: any) {
      console.error('Check supplier error:', error);
      showToast(`Failed: ${error.message}`, 'error');
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="tab-panel active">
      <div className="card mb-6">
        <h3 className="text-lg font-bold mb-4">Register Supplier</h3>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="form-group">
            <label>Supplier Address</label>
            <input
              type="text"
              value={supplierAddress}
              onChange={(e) => setSupplierAddress(e.target.value)}
              placeholder="0x..."
              className="input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={registerLoading || !contract}
          >
            {registerLoading ? 'Processing...' : 'Register Supplier'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Check Supplier Status</h3>
        <form onSubmit={handleCheckSupplier} className="space-y-4">
          <div className="form-group">
            <label>Supplier Address</label>
            <input
              type="text"
              value={checkAddress}
              onChange={(e) => {
                setCheckAddress(e.target.value);
                setIsRegistered(null);
              }}
              placeholder="0x..."
              className="input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-secondary w-full"
            disabled={checkLoading || !contract}
          >
            {checkLoading ? 'Checking...' : 'Check Status'}
          </button>

          {isRegistered !== null && (
            <div
              className={`p-4 rounded-lg ${
                isRegistered
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <strong>Result:</strong>{' '}
              {isRegistered
                ? '✓ Supplier is registered'
                : '✕ Supplier is not registered'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
