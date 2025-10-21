import { expect } from "chai";
import { ethers } from "hardhat";
import { SecureProcurement } from "../typechain-types";
import { deploySecureProcurementFixture, Signers } from "./fixtures/SecureProcurementFixture";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SecureProcurement", function () {
  let contract: SecureProcurement;
  let contractAddress: string;
  let signers: Signers;

  // Material types enum
  const MaterialType = {
    CEMENT: 0,
    STEEL: 1,
    CONCRETE: 2,
    BRICK: 3,
    LUMBER: 4,
    INSULATION: 5,
  };

  // Procurement status enum
  const ProcurementStatus = {
    OPEN: 0,
    EVALUATION: 1,
    CLOSED: 2,
    AWARDED: 3,
  };

  beforeEach(async function () {
    const deployment = await deploySecureProcurementFixture();
    contract = deployment.contract;
    contractAddress = deployment.contractAddress;
    signers = deployment.signers;
  });

  // ===== 1. Deployment Tests (Required) =====
  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(contractAddress).to.be.properAddress;
      expect(contractAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("should set deployer as owner", async function () {
      const owner = await contract.owner();
      expect(owner).to.equal(signers.deployer.address);
    });

    it("should initialize procurement counter to zero", async function () {
      const procurementId = await contract.procurementId();
      expect(procurementId).to.equal(0);
    });

    it("should set correct procurement duration constant", async function () {
      const duration = await contract.PROCUREMENT_DURATION();
      expect(duration).to.equal(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it("should have no authorized suppliers initially", async function () {
      const isAuthorized = await contract.isSupplierAuthorized(signers.alice.address);
      expect(isAuthorized).to.be.false;
    });
  });

  // ===== 2. Supplier Authorization Tests =====
  describe("Supplier Authorization", function () {
    it("should allow owner to authorize supplier", async function () {
      await expect(contract.connect(signers.deployer).authorizeSupplier(signers.alice.address))
        .to.emit(contract, "SupplierAuthorized")
        .withArgs(signers.alice.address);

      const isAuthorized = await contract.isSupplierAuthorized(signers.alice.address);
      expect(isAuthorized).to.be.true;
    });

    it("should set initial reputation to 50 when authorizing supplier", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);

      const reputation = await contract.getSupplierReputation(signers.alice.address);
      expect(reputation).to.equal(50);
    });

    it("should reject authorization from non-owner", async function () {
      await expect(
        contract.connect(signers.alice).authorizeSupplier(signers.bob.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow authorizing multiple suppliers", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).authorizeSupplier(signers.bob.address);

      expect(await contract.isSupplierAuthorized(signers.alice.address)).to.be.true;
      expect(await contract.isSupplierAuthorized(signers.bob.address)).to.be.true;
    });
  });

  // ===== 3. Create Procurement Tests =====
  describe("Create Procurement", function () {
    it("should create procurement successfully", async function () {
      const materialType = MaterialType.CEMENT;
      const quantity = 100;
      const qualityGrade = 8;
      const specifications = "High quality cement for construction";

      await expect(
        contract.connect(signers.alice).createProcurement(
          materialType,
          quantity,
          qualityGrade,
          specifications
        )
      ).to.emit(contract, "ProcurementCreated");
    });

    it("should increment procurement ID", async function () {
      await contract.connect(signers.alice).createProcurement(
        MaterialType.STEEL,
        50,
        7,
        "Steel beams"
      );

      const procurementId = await contract.procurementId();
      expect(procurementId).to.equal(1);

      await contract.connect(signers.bob).createProcurement(
        MaterialType.CONCRETE,
        200,
        9,
        "Concrete mix"
      );

      const newProcurementId = await contract.procurementId();
      expect(newProcurementId).to.equal(2);
    });

    it("should return the new procurement ID", async function () {
      const tx = await contract.connect(signers.alice).createProcurement(
        MaterialType.BRICK,
        1000,
        6,
        "Red bricks"
      );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "ProcurementCreated";
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });

    it("should set correct procurement details", async function () {
      await contract.connect(signers.alice).createProcurement(
        MaterialType.LUMBER,
        300,
        7,
        "Pine wood planks"
      );

      const info = await contract.getProcurementInfo(1);

      expect(info[0]).to.equal(MaterialType.LUMBER); // materialType
      expect(info[1]).to.equal("Pine wood planks"); // specifications
      expect(info[2]).to.equal(ProcurementStatus.OPEN); // status
      expect(info[3]).to.equal(signers.alice.address); // requester
      expect(info[6]).to.equal(0); // supplierCount
    });

    it("should set correct start and end times", async function () {
      const blockTimestamp = await time.latest();

      await contract.connect(signers.alice).createProcurement(
        MaterialType.INSULATION,
        150,
        8,
        "Thermal insulation"
      );

      const info = await contract.getProcurementInfo(1);
      const startTime = info[4];
      const endTime = info[5];

      expect(startTime).to.be.closeTo(blockTimestamp, 2);
      expect(endTime - startTime).to.equal(7 * 24 * 60 * 60); // 7 days
    });
  });

  // ===== 4. Submit Bid Tests =====
  describe("Submit Bid", function () {
    beforeEach(async function () {
      // Authorize suppliers
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).authorizeSupplier(signers.bob.address);

      // Create a procurement
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.CEMENT,
        100,
        8,
        "Portland cement"
      );
    });

    it("should allow authorized supplier to submit bid", async function () {
      const procurementId = 1;
      const price = ethers.parseEther("1.5");
      const deliveryTime = 30;
      const qualityScore = 85;
      const certifications = "ISO 9001, ISO 14001";

      await expect(
        contract.connect(signers.alice).submitBid(
          procurementId,
          price,
          deliveryTime,
          qualityScore,
          certifications
        )
      ).to.emit(contract, "BidSubmitted")
        .withArgs(procurementId, signers.alice.address, await time.latest() + 1);
    });

    it("should reject bid from unauthorized supplier", async function () {
      await expect(
        contract.connect(signers.charlie).submitBid(
          1,
          ethers.parseEther("1.0"),
          20,
          90,
          "None"
        )
      ).to.be.revertedWith("Not authorized supplier");
    });

    it("should reject duplicate bid from same supplier", async function () {
      await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("1.5"),
        30,
        85,
        "ISO 9001"
      );

      await expect(
        contract.connect(signers.alice).submitBid(
          1,
          ethers.parseEther("1.2"),
          25,
          90,
          "ISO 9001"
        )
      ).to.be.revertedWith("Bid already submitted");
    });

    it("should reject bid for invalid procurement ID", async function () {
      await expect(
        contract.connect(signers.alice).submitBid(
          999,
          ethers.parseEther("1.0"),
          20,
          80,
          "ISO 9001"
        )
      ).to.be.revertedWith("Invalid procurement ID");
    });

    it("should reject bid with quality score > 100", async function () {
      await expect(
        contract.connect(signers.alice).submitBid(
          1,
          ethers.parseEther("1.0"),
          20,
          101,
          "ISO 9001"
        )
      ).to.be.revertedWith("Quality score must be 0-100");
    });

    it("should reject bid outside bidding period", async function () {
      // Fast forward time beyond procurement end time
      await time.increase(8 * 24 * 60 * 60); // 8 days

      await expect(
        contract.connect(signers.alice).submitBid(
          1,
          ethers.parseEther("1.0"),
          20,
          80,
          "ISO 9001"
        )
      ).to.be.revertedWith("Not during bidding period");
    });

    it("should store bid details correctly", async function () {
      await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("1.5"),
        30,
        85,
        "ISO 9001, ISO 14001"
      );

      const bidStatus = await contract.getSupplierBidStatus(1, signers.alice.address);

      expect(bidStatus[0]).to.be.true; // hasSubmitted
      expect(bidStatus[2]).to.equal("ISO 9001, ISO 14001"); // certifications
    });

    it("should increment supplier count", async function () {
      await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("1.5"),
        30,
        85,
        "ISO 9001"
      );

      await contract.connect(signers.bob).submitBid(
        1,
        ethers.parseEther("1.3"),
        25,
        90,
        "ISO 9001"
      );

      const info = await contract.getProcurementInfo(1);
      expect(info[6]).to.equal(2); // supplierCount
    });
  });

  // ===== 5. Access Control Tests =====
  describe("Access Control", function () {
    it("should allow only owner to update reputation", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);

      await expect(
        contract.connect(signers.bob).updateSupplierReputation(signers.alice.address, 75)
      ).to.be.revertedWith("Not authorized");
    });

    it("should allow owner to update reputation", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);

      await expect(
        contract.connect(signers.deployer).updateSupplierReputation(signers.alice.address, 75)
      ).to.emit(contract, "ReputationUpdated")
        .withArgs(signers.alice.address, 75);

      const reputation = await contract.getSupplierReputation(signers.alice.address);
      expect(reputation).to.equal(75);
    });

    it("should reject reputation update for unauthorized supplier", async function () {
      await expect(
        contract.connect(signers.deployer).updateSupplierReputation(signers.alice.address, 75)
      ).to.be.revertedWith("Supplier not authorized");
    });

    it("should reject reputation value > 100", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);

      await expect(
        contract.connect(signers.deployer).updateSupplierReputation(signers.alice.address, 101)
      ).to.be.revertedWith("Reputation must be 0-100");
    });

    it("should allow only owner to emergency close procurement", async function () {
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.CEMENT,
        100,
        8,
        "Test"
      );

      await expect(
        contract.connect(signers.alice).emergencyCloseProcurement(1)
      ).to.be.revertedWith("Not authorized");
    });
  });

  // ===== 6. Edge Cases Tests =====
  describe("Edge Cases", function () {
    it("should handle zero quality grade", async function () {
      await contract.connect(signers.alice).createProcurement(
        MaterialType.CEMENT,
        100,
        0, // Zero quality grade
        "Low grade cement"
      );

      const info = await contract.getProcurementInfo(1);
      expect(info[0]).to.equal(MaterialType.CEMENT);
    });

    it("should handle maximum quality grade (10)", async function () {
      await contract.connect(signers.alice).createProcurement(
        MaterialType.STEEL,
        50,
        10, // Maximum quality grade
        "Premium steel"
      );

      const info = await contract.getProcurementInfo(1);
      expect(info[0]).to.equal(MaterialType.STEEL);
    });

    it("should handle zero quality score in bid", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.BRICK,
        100,
        5,
        "Bricks"
      );

      await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("1.0"),
        30,
        0, // Zero quality score
        "Basic"
      );

      const bidStatus = await contract.getSupplierBidStatus(1, signers.alice.address);
      expect(bidStatus[0]).to.be.true;
    });

    it("should handle maximum quality score (100) in bid", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.LUMBER,
        200,
        8,
        "Wood"
      );

      await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("2.0"),
        15,
        100, // Maximum quality score
        "Premium"
      );

      const bidStatus = await contract.getSupplierBidStatus(1, signers.alice.address);
      expect(bidStatus[0]).to.be.true;
    });

    it("should handle empty specifications", async function () {
      await contract.connect(signers.alice).createProcurement(
        MaterialType.CONCRETE,
        150,
        7,
        "" // Empty specifications
      );

      const info = await contract.getProcurementInfo(1);
      expect(info[1]).to.equal("");
    });

    it("should handle empty certifications", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.CEMENT,
        100,
        8,
        "Cement"
      );

      await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("1.0"),
        20,
        80,
        "" // Empty certifications
      );

      const bidStatus = await contract.getSupplierBidStatus(1, signers.alice.address);
      expect(bidStatus[2]).to.equal("");
    });
  });

  // ===== 7. View Functions Tests =====
  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.STEEL,
        100,
        8,
        "Steel beams"
      );
    });

    it("should return correct procurement info", async function () {
      const info = await contract.getProcurementInfo(1);

      expect(info[0]).to.equal(MaterialType.STEEL); // materialType
      expect(info[1]).to.equal("Steel beams"); // specifications
      expect(info[2]).to.equal(ProcurementStatus.OPEN); // status
      expect(info[3]).to.be.properAddress; // requester
      expect(info[6]).to.equal(0); // supplierCount (initially zero)
      expect(info[7]).to.equal(ethers.ZeroAddress); // winningSupplier (initially zero)
      expect(info[8]).to.equal(0); // winningPrice (initially zero)
    });

    it("should return active procurements", async function () {
      await contract.connect(signers.bob).createProcurement(
        MaterialType.CONCRETE,
        200,
        7,
        "Concrete"
      );

      const activeProcurements = await contract.getActiveProcurements();
      expect(activeProcurements.length).to.equal(2);
      expect(activeProcurements[0]).to.equal(1);
      expect(activeProcurements[1]).to.equal(2);
    });

    it("should return empty array when no active procurements", async function () {
      await contract.connect(signers.deployer).emergencyCloseProcurement(1);

      const activeProcurements = await contract.getActiveProcurements();
      expect(activeProcurements.length).to.equal(0);
    });

    it("should return correct supplier authorization status", async function () {
      expect(await contract.isSupplierAuthorized(signers.alice.address)).to.be.true;
      expect(await contract.isSupplierAuthorized(signers.bob.address)).to.be.false;
    });

    it("should return correct supplier reputation", async function () {
      const reputation = await contract.getSupplierReputation(signers.alice.address);
      expect(reputation).to.equal(50); // Initial reputation
    });
  });

  // ===== 8. Gas Optimization Tests =====
  describe("Gas Optimization", function () {
    it("should create procurement within gas limit", async function () {
      const tx = await contract.connect(signers.alice).createProcurement(
        MaterialType.CEMENT,
        100,
        8,
        "Test cement"
      );

      const receipt = await tx.wait();
      expect(receipt!.gasUsed).to.be.lt(500000); // < 500k gas
    });

    it("should authorize supplier within gas limit", async function () {
      const tx = await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      const receipt = await tx.wait();

      expect(receipt!.gasUsed).to.be.lt(100000); // < 100k gas
    });

    it("should submit bid within gas limit", async function () {
      await contract.connect(signers.deployer).authorizeSupplier(signers.alice.address);
      await contract.connect(signers.deployer).createProcurement(
        MaterialType.STEEL,
        50,
        7,
        "Steel"
      );

      const tx = await contract.connect(signers.alice).submitBid(
        1,
        ethers.parseEther("1.0"),
        20,
        80,
        "ISO 9001"
      );

      const receipt = await tx.wait();
      expect(receipt!.gasUsed).to.be.lt(500000); // < 500k gas
    });
  });
});
