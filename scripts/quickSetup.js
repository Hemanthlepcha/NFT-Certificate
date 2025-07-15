// scripts/quickSetup.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Quick setup for Course Platform...");

  // Your deployed contract address
  const COURSE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  // Get the contract
  const CourseManager = await ethers.getContractFactory("CourseManager");
  const courseManager = CourseManager.attach(COURSE_MANAGER_ADDRESS);
  
  const [owner] = await ethers.getSigners();
  console.log("👤 Using account:", owner.address);

  try {
    // First verify contract exists
    console.log("\n🔍 Verifying contract...");
    const code = await ethers.provider.getCode(COURSE_MANAGER_ADDRESS);
    
    if (code === "0x") {
      throw new Error("No contract deployed at address: " + COURSE_MANAGER_ADDRESS);
    }
    console.log("✅ Contract exists");

    // Verify ownership
    try {
      const contractOwner = await courseManager.owner();
      console.log("📋 Contract owner:", contractOwner);
      if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
        console.warn("⚠️ WARNING: You are not the contract owner!");
        console.log("⚠️ Owner:", contractOwner);
        console.log("⚠️ Your address:", owner.address);
      }
    } catch (error) {
      console.warn("⚠️ Could not verify owner:", error.message);
    }

    // Add courses with better error handling
    console.log("\n📚 Adding courses...");
    
    try {
      console.log("Adding Course 1...");
      const tx1 = await courseManager.addCourse(1, 5);
      await tx1.wait();
      console.log("✅ Course 1 added (requires 5 coins)");
    } catch (error) {
      if (error.message.includes("Course already exists")) {
        console.log("ℹ️ Course 1 already exists");
      } else {
        console.error("❌ Failed to add Course 1:", error.message);
        throw error;
      }
    }
    
    try {
      console.log("Adding Course 2...");
      const tx2 = await courseManager.addCourse(2, 8);
      await tx2.wait();
      console.log("✅ Course 2 added (requires 8 coins)");
    } catch (error) {
      if (error.message.includes("Course already exists")) {
        console.log("ℹ️ Course 2 already exists");
      } else {
        console.error("❌ Failed to add Course 2:", error.message);
        throw error;
      }
    }
    
    try {
      console.log("Adding Course 3...");
      const tx3 = await courseManager.addCourse(3, 10);
      await tx3.wait();
      console.log("✅ Course 3 added (requires 10 coins)");
    } catch (error) {
      if (error.message.includes("Course already exists")) {
        console.log("ℹ️ Course 3 already exists");
      } else {
        console.error("❌ Failed to add Course 3:", error.message);
        throw error;
      }
    }

    // Verify courses with correct destructuring
    console.log("\n🔍 Verifying courses...");
    
    for (let i = 1; i <= 3; i++) {
      try {
        // The auto-generated getter returns: (uint256 minCoinsRequired, bool exists, uint256 currentIndex)
        // Note: availableTokenIds array is NOT returned by the auto-generated getter
        const courseData = await courseManager.courses(i);
        
        // Destructure the returned values correctly
        const [minCoinsRequired, exists, currentIndex] = courseData;
        
        console.log(`Course ${i}:`, {
          exists: exists,
          minCoinsRequired: minCoinsRequired.toString(),
          currentIndex: currentIndex.toString()
        });
      } catch (error) {
        console.warn(`⚠️ Could not verify Course ${i}:`, error.message);
      }
    }

    // Test getUserCoins function
    console.log("\n🪙 Testing getUserCoins...");
    try {
      const userCoins = await courseManager.getUserCoins(owner.address, 1);
      console.log(`✅ User coins for Course 1: ${userCoins.toString()}`);
    } catch (error) {
      console.warn("⚠️ Could not test getUserCoins:", error.message);
    }

    // Test canClaimCertificate function
    console.log("\n🏆 Testing certificate claiming eligibility...");
    try {
      for (let i = 1; i <= 3; i++) {
        const canClaim = await courseManager.canClaimCertificate(owner.address, i);
        console.log(`Course ${i} certificate claimable: ${canClaim}`);
      }
    } catch (error) {
      console.warn("⚠️ Could not test certificate claiming:", error.message);
    }

    console.log("\n🎉 Setup complete! Your frontend should work now.");
    console.log("\n📝 Contract Info:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎓 CourseManager:", COURSE_MANAGER_ADDRESS);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("1. Make sure Hardhat node is running: npx hardhat node");
    console.log("2. Verify contract is deployed: check the address");
    console.log("3. Ensure you're the contract owner");
    console.log("4. Check network connection");
    
    // Additional debugging
    console.log("\n🔍 DEBUG INFO:");
    try {
      const network = await ethers.provider.getNetwork();
      console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
      console.log("Latest block:", await ethers.provider.getBlockNumber());
    } catch (err) {
      console.log("Could not get network info:", err.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });