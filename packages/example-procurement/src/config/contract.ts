// Contract Configuration
export const CONTRACT_ADDRESS = "0xcC1805A797270d2cb2dF70E3b86469d8F3A315b9" as const;

export const CONTRACT_ABI = [
  "function createProcurement(uint8 _materialType, uint32 _quantity, uint32 _qualityGrade, string memory _specifications) external returns (uint32)",
  "function submitBid(uint32 _procurementId, uint64 _price, uint32 _deliveryTime, uint32 _qualityScore, string memory _certifications) external",
  "function authorizeSupplier(address supplier) external",
  "function updateSupplierReputation(address supplier, uint256 newReputation) external",
  "function getProcurementInfo(uint32 _procurementId) external view returns (uint8, string memory, uint8, address, uint256, uint256, uint256, address, uint256)",
  "function getSupplierBidStatus(uint32 _procurementId, address supplier) external view returns (bool, uint256, string memory)",
  "function getSupplierReputation(address supplier) external view returns (uint256)",
  "function isSupplierAuthorized(address supplier) external view returns (bool)",
  "function getActiveProcurements() external view returns (uint32[] memory)",
  "function procurementId() external view returns (uint32)",
  "event ProcurementCreated(uint32 indexed procurementId, uint8 indexed materialType, address indexed requester, uint256 deadline)",
  "event BidSubmitted(uint32 indexed procurementId, address indexed supplier, uint256 timestamp)",
  "event ProcurementAwarded(uint32 indexed procurementId, address indexed winningSupplier, uint256 winningPrice)"
] as const;

export enum MaterialType {
  CEMENT = 0,
  STEEL = 1,
  CONCRETE = 2,
  BRICK = 3,
  LUMBER = 4,
  INSULATION = 5
}

export enum ProcurementStatus {
  OPEN = 0,
  EVALUATION = 1,
  CLOSED = 2,
  AWARDED = 3
}

export const MATERIAL_TYPE_NAMES: Record<MaterialType, string> = {
  [MaterialType.CEMENT]: 'Cement',
  [MaterialType.STEEL]: 'Steel',
  [MaterialType.CONCRETE]: 'Concrete',
  [MaterialType.BRICK]: 'Brick',
  [MaterialType.LUMBER]: 'Lumber',
  [MaterialType.INSULATION]: 'Insulation'
};

export const STATUS_NAMES: Record<ProcurementStatus, string> = {
  [ProcurementStatus.OPEN]: 'Open',
  [ProcurementStatus.EVALUATION]: 'Evaluation',
  [ProcurementStatus.CLOSED]: 'Closed',
  [ProcurementStatus.AWARDED]: 'Awarded'
};
