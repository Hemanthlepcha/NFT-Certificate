// scripts/testCertificates.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing NFT Certificate Claiming...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const COURSE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CERTIFICATE_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [deployer] = await ethers.getSigners();
  console.log("👤 Test User:", deployer.address);

  try {
    // Get contracts
    const CourseManager = await ethers.getContractFactory("CourseManager");
    const courseManager = CourseManager.attach(COURSE_MANAGER_ADDRESS);
    
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const certificateNFT = CertificateNFT.attach(CERTIFICATE_NFT_ADDRESS);

    // Test each course
    for (let courseId = 1; courseId <= 3; courseId++) {
      console.log(`\n📚 Testing Course ${courseId}:`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Get course info
      const courseData = await courseManager.courses(courseId);
      const [minCoinsRequired, exists] = courseData;
      console.log(`Course exists: ${exists}, Min coins: ${minCoinsRequired.toString()}`);

      if (!exists) {
        console.log("❌ Course doesn't exist, skipping...");
        continue;
      }

      // Get user status
      const userCoins = await courseManager.getUserCoins(deployer.address, courseId);
      const hasReceived = await courseManager.hasReceivedCertificate(deployer.address, courseId);
      const canClaim = await courseManager.canClaimCertificate(deployer.address, courseId);

      console.log(`User coins: ${userCoins.toString()}`);
      console.log(`Already received: ${hasReceived}`);
      console.log(`Can claim: ${canClaim}`);

      // If user doesn't have enough coins, add them
      if (parseInt(userCoins.toString()) < parseInt(minCoinsRequired.toString())) {
        console.log("\n🪙 Adding coins to reach minimum requirement...");
        const coinsNeeded = parseInt(minCoinsRequired.toString()) - parseInt(userCoins.toString());
        
        for (let i = 0; i < coinsNeeded; i++) {
          try {
            const rewardTx = await courseManager.rewardCoin(deployer.address, courseId, true);
            await rewardTx.wait();
            console.log(`✅ Added coin ${i + 1}/${coinsNeeded}`);
          } catch (error) {
            console.log(`❌ Failed to add coin ${i + 1}:`, error.message);
            break;
          }
        }

        // Re-check status
        const newUserCoins = await courseManager.getUserCoins(deployer.address, courseId);
        const newCanClaim = await courseManager.canClaimCertificate(deployer.address, courseId);
        console.log(`Updated coins: ${newUserCoins.toString()}`);
        console.log(`Updated can claim: ${newCanClaim}`);
      }

      // Try to claim certificate if eligible and not already received
      if (!hasReceived) {
        const finalCanClaim = await courseManager.canClaimCertificate(deployer.address, courseId);
        
        if (finalCanClaim) {
          console.log("\n🏆 Attempting to claim certificate...");
          const tokenURI = `https://api.courseplatform.com/certificates/${courseId}/${deployer.address}/${Date.now()}.json`;
          
          try {
            const claimTx = await courseManager.claimCertificate(courseId, tokenURI);
            console.log("Transaction sent:", claimTx.hash);
            
            const receipt = await claimTx.wait();
            console.log("✅ Certificate claimed successfully!");
            
            // Check for CertificateMinted event
            const events = receipt.logs.filter(log => {
              try {
                const parsed = courseManager.interface.parseLog(log);
                return parsed.name === 'CertificateMinted';
              } catch {
                return false;
              }
            });
            
            if (events.length > 0) {
              const event = courseManager.interface.parseLog(events[0]);
              console.log(`📜 NFT Token ID: ${event.args.tokenId.toString()}`);
              console.log(`🎯 Course ID: ${event.args.courseId.toString()}`);
              console.log(`👤 Recipient: ${event.args.user}`);
            }
            
          } catch (error) {
            console.log("❌ Certificate claiming failed:", error.message);
            console.log("Error details:", error);
          }
        } else {
          console.log("❌ Not eligible to claim certificate");
        }
      } else {
        console.log("ℹ️ Certificate already received for this course");
      }
    }

    // Final status check
    console.log("\n📊 FINAL STATUS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const nftBalance = await certificateNFT.balanceOf(deployer.address);
    console.log(`🏆 Total NFT certificates owned: ${nftBalance.toString()}`);
    
    if (parseInt(nftBalance.toString()) > 0) {
      console.log("\n📜 Certificate Details:");
      for (let i = 0; i < parseInt(nftBalance.toString()); i++) {
        try {
          const tokenId = await certificateNFT.tokenOfOwnerByIndex(deployer.address, i);
          const tokenURI = await certificateNFT.tokenURI(tokenId);
          console.log(`Certificate ${i + 1}: Token ID ${tokenId.toString()}, URI: ${tokenURI}`);
        } catch (error) {
          console.log(`Error getting certificate ${i + 1}:`, error.message);
        }
      }
    }

    for (let courseId = 1; courseId <= 3; courseId++) {
      const hasReceived = await courseManager.hasReceivedCertificate(deployer.address, courseId);
      const userCoins = await courseManager.getUserCoins(deployer.address, courseId);
      console.log(`Course ${courseId}: ${userCoins.toString()} coins, Certificate received: ${hasReceived}`);
    }

    console.log("\n🎉 CERTIFICATE TESTING COMPLETE!");

  } catch (error) {
    console.error("\n❌ Error during testing:", error.message);
    console.error("Full error:", error);
  }
}

main().catch(console.error);