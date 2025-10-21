import { ethers } from "hardhat";
import { SecureProcurement } from "../../typechain-types";

export interface Signers {
  deployer: any;
  alice: any;
  bob: any;
  charlie: any;
}

export async function deploySecureProcurementFixture() {
  // Get signers
  const [deployer, alice, bob, charlie] = await ethers.getSigners();

  const signers: Signers = {
    deployer,
    alice,
    bob,
    charlie,
  };

  // Deploy contract
  const SecureProcurementFactory = await ethers.getContractFactory("SecureProcurement");
  const contract = await SecureProcurementFactory.deploy() as SecureProcurement;
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  return {
    contract,
    contractAddress,
    signers,
  };
}
