import { useState } from 'react';
import { ethers } from 'ethers';
import { encrypt } from '@fhevm/sdk/core';
import { MaterialType, MATERIAL_TYPE_NAMES } from '../config/contract';

interface CreateProcurementTabProps {
  contract: ethers.Contract | null;
  fhevmInstance: any;
  userAddress: string | null;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  saveTransaction: (tx: any) => void;
}

export function CreateProcurementTab({
  contract,
  fhevmInstance,
  userAddress,
  showToast,
  saveTransaction,
}: CreateProcurementTabProps) {
  const [loading, setLoading] = useState(false);
  const [materialType, setMaterialType] = useState<MaterialType>(MaterialType.Cement);
  const [quantity, setQuantity] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract || !fhevmInstance || !userAddress) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!quantity || !deadline) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const quantityValue = parseInt(quantity);
      if (isNaN(quantityValue) || quantityValue <= 0) {
        throw new Error('Invalid quantity');
      }

      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        throw new Error('Deadline must be in the future');
      }

      showToast('Encrypting quantity...', 'info');
      const encryptedQuantity = await encrypt(fhevmInstance, quantityValue, 'uint32');

      showToast('Creating procurement...', 'info');
      const tx = await contract.createProcurement(
        materialType,
        encryptedQuantity,
        deadlineTimestamp
      );

      showToast('Transaction submitted. Waiting for confirmation...', 'info');
      const receipt = await tx.wait();

      saveTransaction({
        hash: receipt.hash,
        type: 'Create Procurement',
        status: 'confirmed',
        timestamp: Date.now(),
        details: {
          materialType: MATERIAL_TYPE_NAMES[materialType],
          quantity: quantityValue,
          deadline: new Date(deadlineTimestamp * 1000).toLocaleString(),
        },
      });

      showToast('Procurement created successfully!', 'success');

      setQuantity('');
      setDeadline('');
    } catch (error: any) {
      console.error('Create procurement error:', error);
      showToast(`Failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel active">
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Material Type</label>
          <select
            value={materialType}
            onChange={(e) => setMaterialType(Number(e.target.value) as MaterialType)}
            className="input"
          >
            {Object.entries(MATERIAL_TYPE_NAMES).map(([value, name]) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity (encrypted)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="input"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Deadline</label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary col-span-full"
          disabled={loading || !contract}
        >
          {loading ? 'Processing...' : 'Create Procurement'}
        </button>
      </form>
    </div>
  );
}
