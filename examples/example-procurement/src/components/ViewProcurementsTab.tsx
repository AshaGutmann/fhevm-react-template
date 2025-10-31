import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import type { ProcurementInfo } from '../types';

interface ViewProcurementsTabProps {
  contract: ethers.Contract | null;
  fhevmInstance: any;
  userAddress: string | null;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  formatAddress: (address: string) => string;
  formatTimestamp: (timestamp: number) => string;
  formatEther: (value: string) => string;
  MATERIAL_TYPE_NAMES: Record<number, string>;
  STATUS_NAMES: Record<number, string>;
}

export function ViewProcurementsTab({
  contract,
  fhevmInstance,
  userAddress,
  showToast,
  formatAddress,
  formatTimestamp,
  formatEther,
  MATERIAL_TYPE_NAMES,
  STATUS_NAMES,
}: ViewProcurementsTabProps) {
  const [procurements, setProcurements] = useState<ProcurementInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [selectedBidder, setSelectedBidder] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadProcurements = async () => {
    if (!contract) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    setLoading(true);
    try {
      const count = await contract.procurementCount();
      const items: ProcurementInfo[] = [];

      for (let i = 0; i < count; i++) {
        try {
          const info = await contract.getProcurementInfo(i);
          items.push({
            id: i,
            buyer: info[0],
            materialType: Number(info[1]),
            deadline: Number(info[2]),
            status: Number(info[3]),
            bidCount: Number(info[4]),
            selectedSupplier: info[5],
          });
        } catch (error) {
          console.error(`Error loading procurement ${i}:`, error);
        }
      }

      setProcurements(items);
      showToast(`Loaded ${items.length} procurements`, 'success');
    } catch (error: any) {
      console.error('Load procurements error:', error);
      showToast(`Failed to load: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSupplier = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contract || !userAddress) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!selectedId || !selectedBidder) {
      showToast('Please fill all fields', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const id = parseInt(selectedId);
      if (isNaN(id)) {
        throw new Error('Invalid procurement ID');
      }

      showToast('Selecting supplier...', 'info');
      const tx = await contract.selectSupplier(id, selectedBidder);
      await tx.wait();

      showToast('Supplier selected successfully!', 'success');
      setSelectedId('');
      setSelectedBidder('');
      loadProcurements();
    } catch (error: any) {
      console.error('Select supplier error:', error);
      showToast(`Failed: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      loadProcurements();
    }
  }, [contract]);

  return (
    <div className="tab-panel active">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Active Procurements</h2>
        <button
          onClick={loadProcurements}
          className="btn btn-secondary"
          disabled={loading || !contract}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {procurements.length === 0 ? (
        <div className="card text-center">
          <p className="text-text-muted">No procurements found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {procurements.map((proc) => (
            <div key={proc.id} className="card">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {proc.id}
                </div>
                <div>
                  <strong>Buyer:</strong> {formatAddress(proc.buyer)}
                </div>
                <div>
                  <strong>Material:</strong> {MATERIAL_TYPE_NAMES[proc.materialType]}
                </div>
                <div>
                  <strong>Deadline:</strong> {formatTimestamp(proc.deadline)}
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${proc.status === 2 ? 'badge-success' : 'badge-warning'}`}>
                    {STATUS_NAMES[proc.status]}
                  </span>
                </div>
                <div>
                  <strong>Bids:</strong> {proc.bidCount}
                </div>
                {proc.selectedSupplier !== ethers.ZeroAddress && (
                  <div className="col-span-2">
                    <strong>Selected Supplier:</strong> {formatAddress(proc.selectedSupplier)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-6">
        <h3 className="text-lg font-bold mb-4">Select Supplier</h3>
        <form onSubmit={handleSelectSupplier} className="form-grid">
          <div className="form-group">
            <label>Procurement ID</label>
            <input
              type="number"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              placeholder="Enter procurement ID"
              className="input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Supplier Address</label>
            <input
              type="text"
              value={selectedBidder}
              onChange={(e) => setSelectedBidder(e.target.value)}
              placeholder="0x..."
              className="input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary col-span-full"
            disabled={actionLoading || !contract}
          >
            {actionLoading ? 'Processing...' : 'Select Supplier'}
          </button>
        </form>
      </div>
    </div>
  );
}
