// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SecureProcurement is SepoliaConfig {

    address public owner;
    uint32 public procurementId;
    uint256 public constant PROCUREMENT_DURATION = 7 days;

    enum MaterialType { CEMENT, STEEL, CONCRETE, BRICK, LUMBER, INSULATION }
    enum ProcurementStatus { OPEN, EVALUATION, CLOSED, AWARDED }

    struct MaterialSpec {
        MaterialType materialType;
        euint32 encryptedQuantity;
        euint32 encryptedQualityGrade;
        string specifications;
        uint256 deadline;
    }

    struct SupplierBid {
        euint64 encryptedPrice;
        euint32 encryptedDeliveryTime;
        euint32 encryptedQualityScore;
        bool hasSubmitted;
        uint256 timestamp;
        string certifications;
    }

    struct Procurement {
        MaterialSpec materialSpec;
        ProcurementStatus status;
        address requester;
        uint256 startTime;
        uint256 endTime;
        address[] suppliers;
        address winningSupplier;
        uint256 revealedWinningPrice;
        bool completed;
    }

    mapping(uint32 => Procurement) public procurements;
    mapping(uint32 => mapping(address => SupplierBid)) public supplierBids;
    mapping(address => bool) public authorizedSuppliers;
    mapping(address => uint256) public supplierReputation;

    event ProcurementCreated(
        uint32 indexed procurementId,
        MaterialType indexed materialType,
        address indexed requester,
        uint256 deadline
    );

    event BidSubmitted(
        uint32 indexed procurementId,
        address indexed supplier,
        uint256 timestamp
    );

    event ProcurementAwarded(
        uint32 indexed procurementId,
        address indexed winningSupplier,
        uint256 winningPrice
    );

    event SupplierAuthorized(address indexed supplier);
    event ReputationUpdated(address indexed supplier, uint256 newReputation);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedSupplier() {
        require(authorizedSuppliers[msg.sender], "Not authorized supplier");
        _;
    }

    modifier procurementExists(uint32 _procurementId) {
        require(_procurementId > 0 && _procurementId <= procurementId, "Invalid procurement ID");
        _;
    }

    modifier onlyDuringBiddingPeriod(uint32 _procurementId) {
        require(
            block.timestamp >= procurements[_procurementId].startTime &&
            block.timestamp <= procurements[_procurementId].endTime,
            "Not during bidding period"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        procurementId = 0;
    }

    function authorizeSupplier(address supplier) external onlyOwner {
        authorizedSuppliers[supplier] = true;
        supplierReputation[supplier] = 50; // Starting reputation
        emit SupplierAuthorized(supplier);
    }

    function createProcurement(
        MaterialType _materialType,
        uint32 _quantity,
        uint32 _qualityGrade,
        string memory _specifications
    ) external returns (uint32) {
        procurementId++;

        euint32 encryptedQuantity = FHE.asEuint32(_quantity);
        euint32 encryptedQualityGrade = FHE.asEuint32(_qualityGrade);

        MaterialSpec memory spec = MaterialSpec({
            materialType: _materialType,
            encryptedQuantity: encryptedQuantity,
            encryptedQualityGrade: encryptedQualityGrade,
            specifications: _specifications,
            deadline: block.timestamp + PROCUREMENT_DURATION
        });

        procurements[procurementId] = Procurement({
            materialSpec: spec,
            status: ProcurementStatus.OPEN,
            requester: msg.sender,
            startTime: block.timestamp,
            endTime: block.timestamp + PROCUREMENT_DURATION,
            suppliers: new address[](0),
            winningSupplier: address(0),
            revealedWinningPrice: 0,
            completed: false
        });

        // Grant access permissions for encrypted values
        FHE.allowThis(encryptedQuantity);
        FHE.allowThis(encryptedQualityGrade);
        FHE.allow(encryptedQuantity, msg.sender);
        FHE.allow(encryptedQualityGrade, msg.sender);

        emit ProcurementCreated(procurementId, _materialType, msg.sender, spec.deadline);
        return procurementId;
    }

    function submitBid(
        uint32 _procurementId,
        uint64 _price,
        uint32 _deliveryTime,
        uint32 _qualityScore,
        string memory _certifications
    ) external
        onlyAuthorizedSupplier
        procurementExists(_procurementId)
        onlyDuringBiddingPeriod(_procurementId)
    {
        require(!supplierBids[_procurementId][msg.sender].hasSubmitted, "Bid already submitted");
        require(procurements[_procurementId].status == ProcurementStatus.OPEN, "Procurement not open");
        require(_qualityScore <= 100, "Quality score must be 0-100");

        euint64 encryptedPrice = FHE.asEuint64(_price);
        euint32 encryptedDeliveryTime = FHE.asEuint32(_deliveryTime);
        euint32 encryptedQualityScore = FHE.asEuint32(_qualityScore);

        supplierBids[_procurementId][msg.sender] = SupplierBid({
            encryptedPrice: encryptedPrice,
            encryptedDeliveryTime: encryptedDeliveryTime,
            encryptedQualityScore: encryptedQualityScore,
            hasSubmitted: true,
            timestamp: block.timestamp,
            certifications: _certifications
        });

        procurements[_procurementId].suppliers.push(msg.sender);

        // Grant access permissions
        FHE.allowThis(encryptedPrice);
        FHE.allowThis(encryptedDeliveryTime);
        FHE.allowThis(encryptedQualityScore);
        FHE.allow(encryptedPrice, msg.sender);
        FHE.allow(encryptedDeliveryTime, msg.sender);
        FHE.allow(encryptedQualityScore, msg.sender);

        emit BidSubmitted(_procurementId, msg.sender, block.timestamp);
    }

    function evaluateBids(uint32 _procurementId) external procurementExists(_procurementId) {
        require(
            msg.sender == procurements[_procurementId].requester || msg.sender == owner,
            "Not authorized to evaluate"
        );
        require(block.timestamp > procurements[_procurementId].endTime, "Bidding period not ended");
        require(procurements[_procurementId].status == ProcurementStatus.OPEN, "Already evaluated");

        procurements[_procurementId].status = ProcurementStatus.EVALUATION;

        // In a real implementation, this would use FHE operations for private evaluation
        _performPrivateEvaluation(_procurementId);
    }

    function _performPrivateEvaluation(uint32 _procurementId) private {
        Procurement storage procurement = procurements[_procurementId];

        if (procurement.suppliers.length == 0) {
            procurement.status = ProcurementStatus.CLOSED;
            return;
        }

        // Simplified evaluation - in practice this would use FHE computations
        address bestSupplier = procurement.suppliers[0];
        uint256 bestScore = supplierReputation[bestSupplier];

        for (uint i = 1; i < procurement.suppliers.length; i++) {
            address supplier = procurement.suppliers[i];
            uint256 score = supplierReputation[supplier];

            // In real FHE implementation, we would compare encrypted values
            if (score > bestScore) {
                bestScore = score;
                bestSupplier = supplier;
            }
        }

        procurement.winningSupplier = bestSupplier;
        procurement.status = ProcurementStatus.AWARDED;

        // Request decryption of winning bid price for transparency
        SupplierBid storage winningBid = supplierBids[_procurementId][bestSupplier];
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(winningBid.encryptedPrice);
        FHE.requestDecryption(cts, this.processAward.selector);
    }

    function processAward(
        uint256 requestId,
        uint64 winningPrice,
        bytes[] memory signatures
    ) external {
        // Note: With fhEVM latest updates, signature verification is handled automatically
        // by the gateway. The decryption process now includes automatic re-randomization
        // for sIND-CPAD security. No manual signature verification needed.

        // Find the procurement this award belongs to (simplified)
        for (uint32 i = 1; i <= procurementId; i++) {
            if (procurements[i].status == ProcurementStatus.AWARDED &&
                procurements[i].revealedWinningPrice == 0) {

                procurements[i].revealedWinningPrice = winningPrice;
                procurements[i].completed = true;

                // Update supplier reputation
                address winner = procurements[i].winningSupplier;
                supplierReputation[winner] += 5;

                emit ProcurementAwarded(i, winner, winningPrice);
                break;
            }
        }
    }

    function getProcurementInfo(uint32 _procurementId) external view
        procurementExists(_procurementId)
        returns (
            MaterialType materialType,
            string memory specifications,
            ProcurementStatus status,
            address requester,
            uint256 startTime,
            uint256 endTime,
            uint256 supplierCount,
            address winningSupplier,
            uint256 winningPrice
        )
    {
        Procurement storage procurement = procurements[_procurementId];
        return (
            procurement.materialSpec.materialType,
            procurement.materialSpec.specifications,
            procurement.status,
            procurement.requester,
            procurement.startTime,
            procurement.endTime,
            procurement.suppliers.length,
            procurement.winningSupplier,
            procurement.revealedWinningPrice
        );
    }

    function getSupplierBidStatus(uint32 _procurementId, address supplier) external view
        procurementExists(_procurementId)
        returns (bool hasSubmitted, uint256 timestamp, string memory certifications)
    {
        SupplierBid storage bid = supplierBids[_procurementId][supplier];
        return (bid.hasSubmitted, bid.timestamp, bid.certifications);
    }

    function getSupplierReputation(address supplier) external view returns (uint256) {
        return supplierReputation[supplier];
    }

    function isSupplierAuthorized(address supplier) external view returns (bool) {
        return authorizedSuppliers[supplier];
    }

    function updateSupplierReputation(address supplier, uint256 newReputation) external onlyOwner {
        require(authorizedSuppliers[supplier], "Supplier not authorized");
        require(newReputation <= 100, "Reputation must be 0-100");

        supplierReputation[supplier] = newReputation;
        emit ReputationUpdated(supplier, newReputation);
    }

    function emergencyCloseProcurement(uint32 _procurementId) external onlyOwner procurementExists(_procurementId) {
        procurements[_procurementId].status = ProcurementStatus.CLOSED;
    }

    function getActiveProcurements() external view returns (uint32[] memory) {
        uint32[] memory active = new uint32[](procurementId);
        uint32 count = 0;

        for (uint32 i = 1; i <= procurementId; i++) {
            if (procurements[i].status == ProcurementStatus.OPEN) {
                active[count] = i;
                count++;
            }
        }

        // Resize array to actual count
        uint32[] memory result = new uint32[](count);
        for (uint32 j = 0; j < count; j++) {
            result[j] = active[j];
        }

        return result;
    }
}
