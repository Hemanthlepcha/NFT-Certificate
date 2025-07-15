// scripts/checkOwnership.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Contract Ownership...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const COURSE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const CERTIFICATE_NFT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);

  try {
    // Check CourseManager
    console.log("\n🎓 CourseManager Contract:");
    const CourseManager = await ethers.getContractFactory("CourseManager");
    const courseManager = CourseManager.attach(COURSE_MANAGER_ADDRESS);
    
    const courseOwner = await courseManager.owner();
    console.log("📋 CourseManager owner:", courseOwner);
    console.log("✅ Is deployer owner?", courseOwner.toLowerCase() === deployer.address.toLowerCase());

    // Check CertificateNFT  
    console.log("\n📜 CertificateNFT Contract:");
    const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
    const certificateNFT = CertificateNFT.attach(CERTIFICATE_NFT_ADDRESS);
    
    const certOwner = await certificateNFT.owner();
    console.log("📋 CertificateNFT owner:", certOwner);
    console.log("✅ Is CourseManager owner?", certOwner.toLowerCase() === COURSE_MANAGER_ADDRESS.toLowerCase());
    console.log("✅ Is deployer owner?", certOwner.toLowerCase() === deployer.address.toLowerCase());

    // Test certificate reference in CourseManager
    console.log("\n🔗 Contract References:");
    const certificateRef = await courseManager.certificate();
    console.log("📋 CourseManager.certificate():", certificateRef);
    console.log("✅ Correct reference?", certificateRef.toLowerCase() === CERTIFICATE_NFT_ADDRESS.toLowerCase());

    // Test user coins and eligibility
    console.log("\n🪙 Testing Certificate Eligibility:");
    const userCoins1 = await courseManager.getUserCoins(deployer.address, 1);
    const userCoins2 = await courseManager.getUserCoins(deployer.address, 2);
    const userCoins3 = await courseManager.getUserCoins(deployer.address, 3);
    
    console.log(`User coins Course 1: ${userCoins1.toString()}`);
    console.log(`User coins Course 2: ${userCoins2.toString()}`);
    console.log(`User coins Course 3: ${userCoins3.toString()}`);

    const canClaim1 = await courseManager.canClaimCertificate(deployer.address, 1);
    const canClaim2 = await courseManager.canClaimCertificate(deployer.address, 2);
    const canClaim3 = await courseManager.canClaimCertificate(deployer.address, 3);
    
    console.log(`Can claim Course 1: ${canClaim1}`);
    console.log(`Can claim Course 2: ${canClaim2}`);
    console.log(`Can claim Course 3: ${canClaim3}`);

    // Check course requirements
    console.log("\n📚 Course Requirements:");
    for (let i = 1; i <= 3; i++) {
      const courseData = await courseManager.courses(i);
      const [minCoinsRequired, exists] = courseData;
      console.log(`Course ${i}: ${minCoinsRequired.toString()} coins required, exists: ${exists}`);
    }

    // Check if certificates already received
    console.log("\n🏆 Certificate Status:");
    const hasReceived1 = await courseManager.hasReceivedCertificate(deployer.address, 1);
    const hasReceived2 = await courseManager.hasReceivedCertificate(deployer.address, 2);
    const hasReceived3 = await courseManager.hasReceivedCertificate(deployer.address, 3);
    
    console.log(`Already received Course 1: ${hasReceived1}`);
    console.log(`Already received Course 2: ${hasReceived2}`);
    console.log(`Already received Course 3: ${hasReceived3}`);

    // Diagnosis
    console.log("\n🔧 DIAGNOSIS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (certOwner.toLowerCase() !== COURSE_MANAGER_ADDRESS.toLowerCase()) {
      console.log("❌ ISSUE FOUND: CertificateNFT owner is NOT CourseManager");
      console.log("💡 SOLUTION: Transfer CertificateNFT ownership to CourseManager");
      console.log(`   Current owner: ${certOwner}`);
      console.log(`   Should be: ${COURSE_MANAGER_ADDRESS}`);
    } else {
      console.log("✅ Ownership is correct");
    }

    if (parseInt(userCoins1.toString()) >= 5 && canClaim1 && !hasReceived1) {
      console.log("✅ User should be able to claim Course 1 certificate");
    } else if (parseInt(userCoins1.toString()) < 5) {
      console.log(`❌ User needs more coins for Course 1 (has ${userCoins1.toString()}, needs 5)`);
    } else if (hasReceived1) {
      console.log("❌ User already received Course 1 certificate");
    }

  } catch (error) {
    console.error("❌ Error checking ownership:", error.message);
  }
}

main().catch(console.error);