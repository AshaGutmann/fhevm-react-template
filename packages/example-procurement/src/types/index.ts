import { MaterialType, ProcurementStatus } from '../config/contract';

export interface ProcurementInfo {
  id: number;
  materialType: MaterialType;
  specifications: string;
  status: ProcurementStatus;
  requester: string;
  startTime: bigint;
  endTime: bigint;
  supplierCount: bigint;
  winningSupplier: string;
  winningPrice: bigint;
}

export interface SupplierBidStatus {
  hasSubmitted: boolean;
  timestamp: bigint;
  certifications: string;
}

export interface TransactionRecord {
  hash: string;
  type: 'procurement' | 'bid' | 'authorize' | 'reputation';
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  description: string;
}

export interface CreateProcurementForm {
  materialType: MaterialType;
  quantity: string;
  qualityGrade: string;
  specifications: string;
}

export interface SubmitBidForm {
  procurementId: string;
  price: string;
  deliveryTime: string;
  qualityScore: string;
  certifications: string;
}
