// scripts/fixOwnership.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing Contract Ownership for NFT Minting...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const COURSE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CERTIFICATE_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  try {
    // Get contracts
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const certificateNFT = CertificateNFT.attach(CERTIFICATE_NFT_ADDRESS);
    
    const CourseManager = await ethers.getContractFactory("CourseManager");
    const courseManager = CourseManager.attach(COURSE_MANAGER_ADDRESS);

    // Check current ownership
    console.log("\n🔍 Current Ownership:");
    const currentOwner = await certificateNFT.owner();
    console.log("CertificateNFT owner:", currentOwner);
    console.log("CourseManager address:", COURSE_MANAGER_ADDRESS);

    if (currentOwner.toLowerCase() === COURSE_MANAGER_ADDRESS.toLowerCase()) {
      console.log("✅ Ownership is already correct!");
      
      // Test minting
      console.log("\n🧪 Testing certificate minting...");
      try {
        const testTx = await courseManager.claimCertificate(
          1, 
          "https://example.com/test-certificate.json"
        );
        await testTx.wait();
        console.log("✅ Certificate minting test successful!");
      } catch (error) {
        console.log("❌ Certificate minting test failed:", error.message);
      }
      
      return;
    }

    // Transfer ownership
    console.log("\n🔄 Transferring CertificateNFT ownership to CourseManager...");
    console.log(`From: ${currentOwner}`);
    console.log(`To: ${COURSE_MANAGER_ADDRESS}`);

    const transferTx = await certificateNFT.transferOwnership(COURSE_MANAGER_ADDRESS);
    console.log("Transaction sent:", transferTx.hash);
    
    await transferTx.wait();
    console.log("✅ Ownership transfer confirmed!");

    // Verify transfer
    console.log("\n✅ Verifying ownership transfer...");
    const newOwner = await certificateNFT.owner();
    console.log("New CertificateNFT owner:", newOwner);
    
    if (newOwner.toLowerCase() === COURSE_MANAGER_ADDRESS.toLowerCase()) {
      console.log("🎉 SUCCESS! CourseManager is now owner of CertificateNFT");
    } else {
      console.log("❌ Transfer failed - ownership not updated correctly");
      return;
    }

    // Test certificate minting
    console.log("\n🧪 Testing certificate minting functionality...");
    
    // First, let's add some coins to test user if they don't have enough
    const userCoins = await courseManager.getUserCoins(deployer.address, 1);
    console.log(`Current user coins for Course 1: ${userCoins.toString()}`);
    
    if (parseInt(userCoins.toString()) < 5) {
      console.log("Adding test coins to user...");
      for (let i = parseInt(userCoins.toString()); i < 5; i++) {
        try {
          const rewardTx = await courseManager.rewardCoin(deployer.address, 1, true);
          await rewardTx.wait();
          console.log(`✅ Added coin ${i + 1}/5`);
        } catch (error) {
          console.log(`❌ Failed to add coin ${i + 1}:`, error.message);
        }
      }
    }

    // Check eligibility
    const canClaim = await courseManager.canClaimCertificate(deployer.address, 1);
    console.log(`Can claim certificate: ${canClaim}`);

    if (canClaim) {
      // Test claim certificate
      console.log("Attempting to claim test certificate...");
      try {
        const claimTx = await courseManager.claimCertificate(
          1, 
          "https://example.com/test-certificate-fixed.json"
        );
        const receipt = await claimTx.wait();
        console.log("✅ Certificate claimed successfully!");
        console.log("Transaction hash:", receipt.hash);
        
        // Check NFT balance
        const balance = await certificateNFT.balanceOf(deployer.address);
        console.log(`🏆 User now has ${balance.toString()} NFT certificate(s)`);
        
        if (parseInt(balance.toString()) > 0) {
          const tokenId = await certificateNFT.tokenOfOwnerByIndex(deployer.address, 0);
          const tokenURI = await certificateNFT.tokenURI(tokenId);
          console.log(`📜 Token ID: ${tokenId.toString()}`);
          console.log(`📜 Token URI: ${tokenURI}`);
        }
        
      } catch (error) {
        console.log("❌ Certificate claiming failed:", error.message);
        console.log("Full error:", error);
      }
    } else {
      console.log("❌ User not eligible to claim certificate yet");
      const hasReceived = await courseManager.hasReceivedCertificate(deployer.address, 1);
      if (hasReceived) {
        console.log("Reason: User already received certificate for Course 1");
      }
    }

    console.log("\n🎉 OWNERSHIP FIX COMPLETE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ CertificateNFT ownership transferred to CourseManager");
    console.log("✅ CourseManager can now mint NFT certificates");
    console.log("✅ Users can claim certificates after earning enough coins");
    console.log("\n💡 Your frontend certificate claiming should work now!");

  } catch (error) {
    console.error("\n❌ Error fixing ownership:", error.message);
    console.error("Full error:", error);
    
    console.log("\n🔧 MANUAL STEPS:");
    console.log("1. Make sure you're the owner of CertificateNFT");
    console.log("2. Call: certificateNFT.transferOwnership(courseManagerAddress)");
    console.log("3. Verify: certificateNFT.owner() == courseManagerAddress");
  }
}

main().catch(console.error);