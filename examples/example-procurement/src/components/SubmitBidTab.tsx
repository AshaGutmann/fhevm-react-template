import { useState } from 'react';
import { ethers } from 'ethers';
import { encrypt } from '@fhevm/sdk/core';

interface SubmitBidTabProps {
  contract: ethers.Contract | null;
  fhevmInstance: any;
  userAddress: string | null;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  saveTransaction: (tx: any) => void;
}

export function SubmitBidTab({
  contract,
  fhevmInstance,
  userAddress,
  showToast,
  saveTransaction,
}: SubmitBidTabProps) {
  const [loading, setLoading] = useState(false);
  const [procurementId, setProcurementId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [qualityScore, setQualityScore] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract || !fhevmInstance || !userAddress) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!procurementId || !bidAmount || !deliveryTime || !qualityScore) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const id = parseInt(procurementId);
      const amount = parseInt(bidAmount);
      const delivery = parseInt(deliveryTime);
      const quality = parseInt(qualityScore);

      if (isNaN(id) || isNaN(amount) || isNaN(delivery) || isNaN(quality)) {
        throw new Error('Invalid input values');
      }

      if (quality < 0 || quality > 100) {
        throw new Error('Quality score must be between 0 and 100');
      }

      showToast('Encrypting bid data...', 'info');
      const encryptedPrice = await encrypt(fhevmInstance, amount, 'uint64');
      const encryptedDeliveryTime = await encrypt(fhevmInstance, delivery, 'uint32');
      const encryptedQualityScore = await encrypt(fhevmInstance, quality, 'uint8');

      showToast('Submitting bid...', 'info');
      const tx = await contract.submitBid(
        id,
        encryptedPrice,
        encryptedDeliveryTime,
        encryptedQualityScore
      );

      showToast('Transaction submitted. Waiting for confirmation...', 'info');
      const receipt = await tx.wait();

      saveTransaction({
        hash: receipt.hash,
        type: 'Submit Bid',
        status: 'confirmed',
        timestamp: Date.now(),
        details: {
          procurementId: id,
          bidAmount: amount,
          deliveryTime: delivery,
          qualityScore: quality,
        },
      });

      showToast('Bid submitted successfully!', 'success');

      setProcurementId('');
      setBidAmount('');
      setDeliveryTime('');
      setQualityScore('');
    } catch (error: any) {
      console.error('Submit bid error:', error);
      showToast(`Failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-panel active">
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Procurement ID</label>
          <input
            type="number"
            value={procurementId}
            onChange={(e) => setProcurementId(e.target.value)}
            placeholder="Enter procurement ID"
            className="input"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Bid Amount (ETH, encrypted)</label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount"
            className="input"
            min="0"
            step="0.001"
          />
        </div>

        <div className="form-group">
          <label>Delivery Time (days, encrypted)</label>
          <input
            type="number"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="Enter delivery time in days"
            className="input"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Quality Score (0-100, encrypted)</label>
          <input
            type="number"
            value={qualityScore}
            onChange={(e) => setQualityScore(e.target.value)}
            placeholder="Enter quality score"
            className="input"
            min="0"
            max="100"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary col-span-full"
          disabled={loading || !contract}
        >
          {loading ? 'Processing...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
}
