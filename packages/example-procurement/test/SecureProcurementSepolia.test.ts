import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SecureProcurement } from "../typechain-types";
import { Signers } from "./fixtures/SecureProcurementFixture";

/**
 * Sepolia Integration Tests
 *
 * These tests run on the Sepolia testnet and test real network interactions.
 * They are skipped when running on local Hardhat network.
 *
 * Requirements:
 * - SEPOLIA_RPC_URL in .env
 * - PRIVATE_KEY with Sepolia ETH
 * - Deployed contract address
 *
 * Run with: npx hardhat test --network sepolia
 */

// Skip these tests if not on Sepolia network
const describeIfSepolia = network.name === "sepolia" ? describe : describe.skip;

// Progress logging for network operations
function logProgress(step: string) {
  console.log(`\n  ⏳ ${step}...`);
}

describeIfSepolia("SecureProcurement - Sepolia Integration", function () {
  // Extended timeout for network operations
  this.timeout(160000); // 160 seconds

  let contract: SecureProcurement;
  let contractAddress: string;
  let signers: Signers;

  before(async function () {
    logProgress("Getting signers");
    const [deployer, alice, bob, charlie] = await ethers.getSigners();

    signers = {
      deployer,
      alice,
      bob,
      charlie,
    };

    // Check if contract is already deployed
    const deployedAddress = process.env.VITE_CONTRACT_ADDRESS;

    if (deployedAddress && deployedAddress !== "") {
      logProgress(`Connecting to deployed contract at ${deployedAddress}`);
      contractAddress = deployedAddress;
      contract = await ethers.getContractAt("SecureProcurement", contractAddress) as SecureProcurement;
    } else {
      logProgress("Deploying new contract to Sepolia");
      const SecureProcurementFactory = await ethers.getContractFactory("SecureProcurement");
      contract = await SecureProcurementFactory.deploy() as SecureProcurement;
      await contract.waitForDeployment();
      contractAddress = await contract.getAddress();
      console.log(`  ✅ Contract deployed at: ${contractAddress}`);
    }

    // Wait for contract to be ready
    logProgress("Verifying contract deployment");
    const owner = await contract.owner();
    console.log(`  ✅ Contract owner: ${owner}`);
  });

  describe("Network Connectivity", function () {
    it("should connect to Sepolia network", async function () {
      const network = await ethers.provider.getNetwork();
      expect(network.chainId).to.equal(11155111n); // Sepolia chain ID
    });

    it("should have sufficient ETH balance", async function () {
      const balance = await ethers.provider.getBalance(signers.deployer.address);
      expect(balance).to.be.gt(0);
      console.log(`  💰 Deployer balance: ${ethers.formatEther(balance)} ETH`);
    });

    it("should get current block number", async function () {
      const blockNumber = await ethers.provider.getBlockNumber();
      expect(blockNumber).to.be.gt(0);
      console.log(`  📦 Current block: ${blockNumber}`);
    });
  });

  describe("Contract State on Sepolia", function () {
    it("should verify contract owner", async function () {
      logProgress("Checking contract owner");
      const owner = await contract.owner();
      expect(owner).to.equal(signers.deployer.address);
    });

    it("should get procurement counter", async function () {
      logProgress("Reading procurement counter");
      const procurementId = await contract.procurementId();
      expect(procurementId).to.be.gte(0);
      console.log(`  📊 Current procurement ID: ${procurementId}`);
    });

    it("should verify procurement duration constant", async function () {
      const duration = await contract.PROCUREMENT_DURATION();
      expect(duration).to.equal(7n * 24n * 60n * 60n); // 7 days in seconds
    });
  });

  describe("Supplier Authorization on Sepolia", function () {
    it("should authorize a new supplier", async function () {
      logProgress("Authorizing supplier");

      const tx = await contract.authorizeSupplier(signers.alice.address);
      console.log(`  📝 Transaction hash: ${tx.hash}`);

      logProgress("Waiting for transaction confirmation");
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1); // Success
      console.log(`  ✅ Confirmed in block: ${receipt?.blockNumber}`);

      logProgress("Verifying supplier authorization");
      const supplier = await contract.suppliers(signers.alice.address);
      expect(supplier.isAuthorized).to.be.true;
      expect(supplier.reputation).to.equal(100);
    });

    it("should emit SupplierAuthorized event", async function () {
      logProgress("Testing event emission");

      await expect(contract.authorizeSupplier(signers.bob.address))
        .to.emit(contract, "SupplierAuthorized")
        .withArgs(signers.bob.address);
    });

    it("should reject non-owner authorization attempt", async function () {
      logProgress("Testing access control");

      const contractAsAlice = contract.connect(signers.alice);
      await expect(
        contractAsAlice.authorizeSupplier(signers.charlie.address)
      ).to.be.revertedWith("Only owner can authorize suppliers");
    });
  });

  describe("Create Procurement on Sepolia", function () {
    beforeEach(async function () {
      // Ensure alice is authorized
      const supplier = await contract.suppliers(signers.alice.address);
      if (!supplier.isAuthorized) {
        logProgress("Pre-authorizing supplier");
        await contract.authorizeSupplier(signers.alice.address);
      }
    });

    it("should create a new procurement request", async function () {
      logProgress("Creating procurement request");

      const materialType = 0; // CEMENT
      const quantity = 1000;
      const qualityStandard = 85;
      const specifications = "High-grade cement for foundation";

      const tx = await contract.createProcurement(
        materialType,
        quantity,
        qualityStandard,
        specifications
      );
      console.log(`  📝 Transaction hash: ${tx.hash}`);

      logProgress("Waiting for confirmation");
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);
      console.log(`  ✅ Confirmed in block: ${receipt?.blockNumber}`);

      // Get the procurement ID from the event
      const event = receipt?.logs.find(
        (log: any) => log.fragment && log.fragment.name === "ProcurementCreated"
      );

      if (event) {
        console.log(`  📊 Procurement created with ID: ${event.args[0]}`);
      }
    });

    it("should increment procurement ID after creation", async function () {
      logProgress("Getting current procurement ID");
      const beforeId = await contract.procurementId();

      logProgress("Creating procurement");
      await contract.createProcurement(1, 500, 90, "Steel beams");

      logProgress("Verifying ID increment");
      const afterId = await contract.procurementId();
      expect(afterId).to.equal(beforeId + 1n);
    });
  });

  describe("Gas Usage on Sepolia", function () {
    it("should track gas cost for supplier authorization", async function () {
      logProgress("Testing gas cost for authorization");

      const tx = await contract.authorizeSupplier(signers.charlie.address);
      const receipt = await tx.wait();

      const gasUsed = receipt?.gasUsed || 0n;
      const gasPrice = receipt?.gasPrice || 0n;
      const gasCost = gasUsed * gasPrice;

      console.log(`  ⛽ Gas used: ${gasUsed.toString()}`);
      console.log(`  💰 Gas cost: ${ethers.formatEther(gasCost)} ETH`);

      // Verify gas usage is reasonable (less than 200k gas)
      expect(gasUsed).to.be.lt(200000);
    });

    it("should track gas cost for procurement creation", async function () {
      logProgress("Testing gas cost for procurement creation");

      const tx = await contract.createProcurement(2, 200, 95, "Concrete mix");
      const receipt = await tx.wait();

      const gasUsed = receipt?.gasUsed || 0n;
      const gasPrice = receipt?.gasPrice || 0n;
      const gasCost = gasUsed * gasPrice;

      console.log(`  ⛽ Gas used: ${gasUsed.toString()}`);
      console.log(`  💰 Gas cost: ${ethers.formatEther(gasCost)} ETH`);

      // Verify gas usage is reasonable (less than 500k gas for FHE operations)
      expect(gasUsed).to.be.lt(500000);
    });
  });

  describe("View Functions on Sepolia", function () {
    it("should get procurement details", async function () {
      logProgress("Creating test procurement");
      const tx = await contract.createProcurement(3, 1500, 88, "Brick batch");
      await tx.wait();

      const procurementId = await contract.procurementId();
      const id = procurementId - 1n; // Get the last created procurement

      logProgress("Fetching procurement details");
      const procurement = await contract.procurements(id);

      expect(procurement.requester).to.equal(signers.deployer.address);
      expect(procurement.materialType).to.equal(3); // BRICK
      expect(procurement.specifications).to.equal("Brick batch");
      expect(procurement.status).to.equal(0); // OPEN

      console.log(`  📊 Procurement ID: ${id}`);
      console.log(`  👤 Requester: ${procurement.requester}`);
      console.log(`  📦 Material: ${procurement.materialType}`);
      console.log(`  📝 Status: ${procurement.status}`);
    });

    it("should get supplier information", async function () {
      logProgress("Fetching supplier information");

      const supplier = await contract.suppliers(signers.alice.address);

      expect(supplier.isAuthorized).to.be.true;
      expect(supplier.reputation).to.be.gte(0);
      expect(supplier.reputation).to.be.lte(100);

      console.log(`  🏢 Supplier: ${signers.alice.address}`);
      console.log(`  ✅ Authorized: ${supplier.isAuthorized}`);
      console.log(`  ⭐ Reputation: ${supplier.reputation}`);
    });

    it("should get all active procurements", async function () {
      logProgress("Fetching active procurements");

      const activeProcurements = await contract.getActiveProcurements();

      expect(activeProcurements).to.be.an('array');
      console.log(`  📊 Active procurements: ${activeProcurements.length}`);

      if (activeProcurements.length > 0) {
        console.log(`  📋 IDs: ${activeProcurements.join(', ')}`);
      }
    });
  });

  describe("Transaction Timing on Sepolia", function () {
    it("should measure block confirmation time", async function () {
      logProgress("Sending transaction and measuring confirmation time");

      const startTime = Date.now();
      const tx = await contract.authorizeSupplier(ethers.Wallet.createRandom().address);

      logProgress("Waiting for confirmation");
      await tx.wait();

      const endTime = Date.now();
      const confirmationTime = (endTime - startTime) / 1000;

      console.log(`  ⏱️  Confirmation time: ${confirmationTime.toFixed(2)} seconds`);

      // Sepolia should confirm within 60 seconds typically
      expect(confirmationTime).to.be.lt(60);
    });
  });

  describe("Contract Upgradability Check", function () {
    it("should verify contract is at expected address", async function () {
      const address = await contract.getAddress();
      expect(address).to.equal(contractAddress);
      console.log(`  📍 Contract address: ${address}`);
    });

    it("should verify contract has correct bytecode", async function () {
      logProgress("Checking contract bytecode");

      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x"); // Has deployed code
      expect(code.length).to.be.gt(100); // Has substantial bytecode

      console.log(`  💾 Bytecode length: ${code.length} characters`);
    });
  });

  describe("Sepolia Network Statistics", function () {
    it("should get network gas price", async function () {
      logProgress("Fetching gas price");

      const feeData = await ethers.provider.getFeeData();
      const gasPrice = feeData.gasPrice || 0n;

      console.log(`  ⛽ Current gas price: ${ethers.formatUnits(gasPrice, "gwei")} gwei`);
      expect(gasPrice).to.be.gt(0);
    });

    it("should estimate gas for procurement creation", async function () {
      logProgress("Estimating gas");

      const estimatedGas = await contract.createProcurement.estimateGas(
        4, // LUMBER
        800,
        92,
        "Premium lumber"
      );

      console.log(`  📊 Estimated gas: ${estimatedGas.toString()}`);
      expect(estimatedGas).to.be.gt(0);
      expect(estimatedGas).to.be.lt(1000000); // Less than 1M gas
    });
  });
});
