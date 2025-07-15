const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts first...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  try {
    // 1. Deploy CertificateNFT with deployer as initial owner
    console.log("\n📜 Deploying CertificateNFT...");
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const certificateNFT = await CertificateNFT.deploy(deployer.address);
    await certificateNFT.waitForDeployment();
    const certificateAddress = await certificateNFT.getAddress();
    console.log("✅ CertificateNFT deployed to:", certificateAddress);

    // 2. Deploy CourseManager
    console.log("\n🎓 Deploying CourseManager...");
    const CourseManager = await ethers.getContractFactory("CourseManager");
    const courseManager = await CourseManager.deploy(certificateAddress);
    await courseManager.waitForDeployment();
    const courseManagerAddress = await courseManager.getAddress();
    console.log("✅ CourseManager deployed to:", courseManagerAddress);

    // 3. Transfer ownership of CertificateNFT to CourseManager
    console.log("\n🔄 Transferring CertificateNFT ownership to CourseManager...");
    const tx = await certificateNFT.transferOwnership(courseManagerAddress);
    await tx.wait();
    console.log("✅ Ownership transferred");

    // 4. Verify deployments
    console.log("\n🔍 Verifying deployments...");
    const owner1 = await courseManager.owner();
    const owner2 = await certificateNFT.owner();
    console.log("📋 CourseManager owner:", owner1);
    console.log("📋 CertificateNFT owner:", owner2);

    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 DEPLOYED ADDRESSES:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🎓 CourseManager: ${courseManagerAddress}`);
    console.log(`📜 CertificateNFT: ${certificateAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 5. Save addresses for quickSetup.js
    console.log("\n📝 UPDATE YOUR contracts.js:");
    console.log(`export const CONTRACT_ADDRESSES = {`);
    console.log(`  courseManager: "${courseManagerAddress}",`);
    console.log(`  certificateNFT: "${certificateAddress}"`);
    console.log(`};`);

    // 6. Save to file
    const fs = require('fs');
    const addresses = {
      courseManager: courseManagerAddress,
      certificateNFT: certificateAddress,
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('deployed-addresses.json', JSON.stringify(addresses, null, 2));
    console.log("\n💾 Addresses saved to deployed-addresses.json");

    console.log("\n➡️ NEXT STEP: Run setup with these addresses");
    console.log("npx hardhat run scripts/quickSetup.js --network localhost");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });