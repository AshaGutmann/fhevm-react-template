const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment of SecureProcurement...");
  console.log("━".repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("━".repeat(60));

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const SecureProcurement = await hre.ethers.getContractFactory(
    "SecureProcurement"
  );

  const contract = await SecureProcurement.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("━".repeat(60));
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("━".repeat(60));

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(3);
  console.log("✅ Confirmed!");

  console.log("━".repeat(60));
  console.log("📋 Deployment Summary:");
  console.log("   Network: Sepolia Testnet");
  console.log("   Contract: SecureProcurement");
  console.log("   Address:", contractAddress);
  console.log("   Deployer:", deployer.address);
  console.log("   Transaction:", contract.deploymentTransaction().hash);
  console.log("━".repeat(60));

  console.log("\n🎯 Next Steps:");
  console.log("1. Update src/config/contract.ts with new contract address:");
  console.log(`   export const CONTRACT_ADDRESS = "${contractAddress}";`);
  console.log("\n2. View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("\n3. Verify contract (optional):");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "sepolia",
    contractName: "SecureProcurement",
    address: contractAddress,
    deployer: deployer.address,
    txHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    blockNumber: contract.deploymentTransaction().blockNumber
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📄 Deployment info saved to: deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
