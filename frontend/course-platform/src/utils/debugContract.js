// src/utils/debugContract.js

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, COURSE_MANAGER_ABI } from '../constants/contracts';

export const debugContract = async () => {
  try {
    console.log("🔍 Starting contract debugging...");
    
    if (!window.ethereum) {
      console.error("❌ MetaMask not found");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log("🌐 Network:", network.name, "Chain ID:", network.chainId.toString());

    // Check if contract is deployed
    const contractAddress = CONTRACT_ADDRESSES.courseManager;
    console.log("📍 Contract Address:", contractAddress);
    
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("❌ No contract deployed at this address!");
      console.log("💡 Solutions:");
      console.log("1. Deploy your contract");
      console.log("2. Update CONTRACT_ADDRESSES in src/constants/contracts.js");
      console.log("3. Check if you're on the correct network");
      return;
    }
    
    console.log("✅ Contract is deployed");

    // Try to connect to contract
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    console.log("👤 User Address:", userAddress);

    const contract = new ethers.Contract(contractAddress, COURSE_MANAGER_ABI, signer);

    // Check if course 1 exists
    try {
      const courseInfo = await contract.courses(1);
      console.log("📚 Course 1 Info:", {
        minCoinsRequired: courseInfo.minCoinsRequired.toString(),
        exists: courseInfo.exists,
        currentIndex: courseInfo.currentIndex.toString()
      });

      if (!courseInfo.exists) {
        console.error("❌ Course 1 doesn't exist!");
        console.log("💡 Solution: Add course using:");
        console.log("await courseManager.addCourse(1, 5)");
        console.log("Or run the setup script provided above.");
        return;
      }

      // Try to get user coins
      const userCoins = await contract.getUserCoins(userAddress, 1);
      console.log("🪙 User Coins for Course 1:", userCoins.toString());
      
      console.log("✅ All checks passed!");

    } catch (error) {
      console.error("❌ Error calling contract functions:", error);
      
      if (error.message.includes("execution reverted")) {
        console.log("💡 This suggests:");
        console.log("1. Course 1 doesn't exist - ADD COURSES FIRST!");
        console.log("2. Run this in console to add courses:");
        console.log(`
const addCourses = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const abi = ["function addCourse(uint256,uint256) external"];
  const contract = new ethers.Contract("${contractAddress}", abi, signer);
  await contract.addCourse(1, 5);
  await contract.addCourse(2, 8); 
  await contract.addCourse(3, 10);
  console.log("Courses added!");
};
addCourses();
        `);
      }
    }

  } catch (error) {
    console.error("❌ Debug error:", error);
  }
};

// Auto-run debug when file is imported in development
if (process.env.NODE_ENV === 'development') {
  // You can call debugContract() manually from console
  window.debugContract = debugContract;
}