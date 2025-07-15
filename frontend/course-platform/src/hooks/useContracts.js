import { useState, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getTokenURI } from '../utils/courseMetadata';

export const useContracts = () => {
  const { courseManager, certificateNFT, userAddress, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user coins for a specific course - FIXED PARAMETER ORDER
  const getUserCoins = useCallback(async (userAddr, courseId) => {
    try {
      setError(null);
      
      // If only one parameter provided, assume it's courseId and use current user
      if (typeof courseId === 'undefined') {
        courseId = userAddr;
        userAddr = userAddress;
      }
      
      if (!courseManager || !userAddr) {
        console.log('Missing dependencies:', { courseManager: !!courseManager, userAddr });
        return 0;
      }

      console.log(`Getting coins for user ${userAddr} in course ${courseId}`);
      
      try {
        const courseInfo = await courseManager.courses(courseId);
        if (!courseInfo.exists) {
          console.warn(`Course ${courseId} does not exist`);
          return 0;
        }
      } catch (courseError) {
        console.error('Error checking course existence:', courseError);
        throw new Error(`Course ${courseId} might not exist or contract not deployed correctly`);
      }
      
      const coins = await courseManager.getUserCoins(userAddr, courseId);
      const result = parseInt(coins.toString());
      console.log(`User has ${result} coins in course ${courseId}`);
      return result;
    } catch (err) {
      console.error('Error getting user coins:', err);
      setError(err.message);
      return 0;
    }
  }, [courseManager, userAddress]);

  // Check if user can claim certificate - FIXED PARAMETER ORDER
  const canClaimCertificate = useCallback(async (userAddr, courseId) => {
    try {
      setError(null);
      
      // If only one parameter provided, assume it's courseId and use current user
      if (typeof courseId === 'undefined') {
        courseId = userAddr;
        userAddr = userAddress;
      }
      
      if (!courseManager || !userAddr) return false;
      
      const canClaim = await courseManager.canClaimCertificate(userAddr, courseId);
      console.log(`Can claim certificate for course ${courseId}: ${canClaim}`);
      return canClaim;
    } catch (err) {
      console.error('Error checking certificate eligibility:', err);
      setError(err.message);
      return false;
    }
  }, [courseManager, userAddress]);

  // Check if user has received certificate - FIXED PARAMETER ORDER
  const hasReceivedCertificate = useCallback(async (userAddr, courseId) => {
    try {
      setError(null);
      
      // If only one parameter provided, assume it's courseId and use current user
      if (typeof courseId === 'undefined') {
        courseId = userAddr;
        userAddr = userAddress;
      }
      
      if (!courseManager || !userAddr) return false;
      
      const hasReceived = await courseManager.hasReceivedCertificate(userAddr, courseId);
      console.log(`Has received certificate for course ${courseId}: ${hasReceived}`);
      return hasReceived;
    } catch (err) {
      console.error('Error checking certificate status:', err);
      setError(err.message);
      return false;
    }
  }, [courseManager, userAddress]);

  // Get course information
  const getCourseInfo = useCallback(async (courseId) => {
    try {
      setError(null);
      if (!courseManager) return null;
      
      const courseInfo = await courseManager.courses(courseId);
      return {
        minCoinsRequired: parseInt(courseInfo.minCoinsRequired.toString()),
        exists: courseInfo.exists
      };
    } catch (err) {
      console.error('Error getting course info:', err);
      setError(err.message);
      return null;
    }
  }, [courseManager]);

  // Reward coin for correct answer (blockchain transaction)
  const rewardCoin = useCallback(async (userAddr, courseId, isCorrect) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!courseManager) {
        throw new Error('Contract not connected');
      }

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      console.log(`🪙 Rewarding coin on blockchain to ${userAddr} for course ${courseId}`);
      
      const tx = await courseManager.rewardCoin(userAddr, courseId, isCorrect);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return receipt;
    } catch (err) {
      console.error('Error rewarding coin on blockchain:', err);
      const errorMessage = err.reason || err.message || 'Failed to reward coin';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [courseManager, isConnected]);

  // Claim certificate with Pinata metadata CID
  const claimCertificate = useCallback(async (courseId, customTokenURI = null) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!courseManager) {
        throw new Error('Contract not connected');
      }

      if (!isConnected) {
        throw new Error('Wallet not connected');
      }

      if (!userAddress) {
        throw new Error('No user address available');
      }

      console.log(`🏆 Claiming certificate for course ${courseId}`);
      
      // Check eligibility first
      const canClaim = await courseManager.canClaimCertificate(userAddress, courseId);
      if (!canClaim) {
        throw new Error('Not eligible to claim certificate. Check coin balance and previous claims.');
      }

      // Use custom URI or get from Pinata CID mapping
      let tokenURI = customTokenURI;
      if (!tokenURI) {
        tokenURI = getTokenURI(courseId);
        if (!tokenURI) {
          throw new Error(`No metadata CID found for course ${courseId}`);
        }
      }

      console.log(`🎯 Using tokenURI: ${tokenURI}`);

      // Call smart contract
      const tx = await courseManager.claimCertificate(courseId, tokenURI);
      if (!tx || typeof tx.wait !== 'function') {
        throw new Error('Invalid transaction response from claimCertificate');
      }
      
      console.log('Certificate claim transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Certificate claim transaction confirmed:', receipt);
      
      // Log certificate minted event if present
      try {
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
          console.log(`🎉 NFT Certificate minted! Token ID: ${event.args.tokenId.toString()}`);
          console.log(`🖼️ Token URI: ${tokenURI}`);
        }
      } catch (eventError) {
        console.log('Could not parse certificate minted event:', eventError);
      }
      
      return receipt;
    } catch (err) {
      console.error('Error claiming certificate:', err);
      const errorMessage = err.reason || err.message || 'Failed to claim certificate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [courseManager, isConnected, userAddress]);

  // Auto-claim certificate if eligible - Using Pinata CIDs
  const autoClaimCertificateIfEligible = useCallback(async (courseId) => {
    try {
      setError(null);
      
      if (!courseManager || !userAddress) {
        console.log('Missing dependencies for auto-claim:', { 
          courseManager: !!courseManager, 
          userAddress: !!userAddress 
        });
        return false;
      }

      console.log(`🔍 Checking certificate eligibility for course ${courseId}...`);
      
      // Get detailed status for debugging
      const [userCoins, hasReceived, courseInfo] = await Promise.all([
        getUserCoins(userAddress, courseId),
        hasReceivedCertificate(userAddress, courseId), 
        getCourseInfo(courseId)
      ]);

      console.log('Certificate eligibility check:', {
        userCoins,
        hasReceived,
        minRequired: courseInfo?.minCoinsRequired,
        courseExists: courseInfo?.exists
      });

      // Check eligibility
      const eligible = await canClaimCertificate(userAddress, courseId);
      console.log(`Eligibility result: ${eligible}`);
      
      if (!eligible) {
        if (hasReceived) {
          console.log('Certificate already claimed for this course');
        } else if (userCoins < courseInfo?.minCoinsRequired) {
          console.log(`Insufficient coins: ${userCoins}/${courseInfo?.minCoinsRequired}`);
        } else {
          console.log('Other eligibility issue detected');
        }
        return false;
      }
      
      console.log(`🏆 User is eligible for certificate in course ${courseId}, claiming with Pinata metadata...`);
      
      // Claim certificate (will use Pinata CID automatically)
      await claimCertificate(courseId);
      console.log('🎉 Certificate auto-claimed successfully with Pinata metadata!');
      return true;
      
    } catch (err) {
      console.error('Error auto-claiming certificate:', err);
      const errorMessage = err.reason || err.message || 'Failed to auto-claim certificate';
      setError(errorMessage);
      return false;
    }
  }, [courseManager, userAddress, canClaimCertificate, claimCertificate, getUserCoins, hasReceivedCertificate, getCourseInfo]);

  // Get user's NFT certificates and fetch metadata from Pinata
  const getUserCertificates = useCallback(async () => {
    try {
      setError(null);
      if (!certificateNFT || !userAddress) return [];
      
      const balance = await certificateNFT.balanceOf(userAddress);
      const certificates = [];
      
      for (let i = 0; i < parseInt(balance.toString()); i++) {
        try {
          const tokenId = await certificateNFT.tokenOfOwnerByIndex(userAddress, i);
          const tokenURI = await certificateNFT.tokenURI(tokenId);
          
          let metadata = null;
          let imageUrl = null;
          
          // Fetch metadata from IPFS if it's an IPFS URL
          if (tokenURI.startsWith('ipfs://')) {
            try {
              const ipfsHash = tokenURI.replace('ipfs://', '');
              const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
              
              console.log(`Fetching metadata for token ${tokenId} from: ${gatewayUrl}`);
              
              const response = await fetch(gatewayUrl);
              if (response.ok) {
                metadata = await response.json();
                console.log(`Metadata for token ${tokenId}:`, metadata);
                
                // Extract image URL from metadata
                if (metadata.image) {
                  if (metadata.image.startsWith('ipfs://')) {
                    // Convert IPFS image URL to Pinata gateway URL
                    const imageHash = metadata.image.replace('ipfs://', '');
                    imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;
                  } else if (metadata.image.startsWith('bafyb') || metadata.image.startsWith('Qm')) {
                    // Handle raw CID
                    imageUrl = `https://gateway.pinata.cloud/ipfs/${metadata.image}`;
                  } else {
                    // Use as-is if it's already a full URL
                    imageUrl = metadata.image;
                  }
                  console.log(`Image URL for token ${tokenId}:`, imageUrl);
                }
              } else {
                console.warn(`Failed to fetch metadata for token ${tokenId}:`, response.status);
              }
            } catch (metadataError) {
              console.warn(`Could not fetch metadata for token ${tokenId}:`, metadataError);
            }
          }
          
          certificates.push({
            tokenId: parseInt(tokenId.toString()),
            tokenURI: tokenURI,
            metadata: metadata,
            imageUrl: imageUrl,
            name: metadata?.name || `Certificate #${tokenId}`,
            description: metadata?.description || 'Course completion certificate',
            attributes: metadata?.attributes || []
          });
        } catch (err) {
          console.warn(`Error getting token at index ${i}:`, err);
        }
      }
      
      console.log(`User has ${certificates.length} NFT certificates with Pinata metadata`);
      return certificates;
    } catch (err) {
      console.error('Error getting user certificates:', err);
      setError(err.message);
      return [];
    }
  }, [certificateNFT, userAddress]);

  // Get multiple user stats at once - FIXED PARAMETER ORDER
  const getUserStats = useCallback(async (courseIds) => {
    try {
      setError(null);
      if (!courseManager || !userAddress) return {};
      
      const stats = {};
      
      for (const courseId of courseIds) {
        try {
          const [coins, canClaim, hasReceived] = await Promise.all([
            getUserCoins(userAddress, courseId),
            canClaimCertificate(userAddress, courseId),
            hasReceivedCertificate(userAddress, courseId)
          ]);
          
          stats[courseId] = {
            coins,
            canClaim,
            hasReceived
          };
        } catch (err) {
          console.warn(`Error getting stats for course ${courseId}:`, err);
          stats[courseId] = {
            coins: 0,
            canClaim: false,
            hasReceived: false
          };
        }
      }
      
      return stats;
    } catch (err) {
      console.error('Error getting user stats:', err);
      setError(err.message);
      return {};
    }
  }, [courseManager, userAddress, getUserCoins, canClaimCertificate, hasReceivedCertificate]);

  // Listen for contract events
  const setupEventListeners = useCallback(() => {
    if (!courseManager) return;

    try {
      // Listen for coin rewards
      courseManager.on('CoinRewarded', (user, courseId, newCoinCount) => {
        if (user.toLowerCase() === userAddress?.toLowerCase()) {
          console.log('🪙 Coin rewarded event:', { 
            user, 
            courseId: courseId.toString(), 
            newCoinCount: newCoinCount.toString() 
          });
          window.dispatchEvent(new CustomEvent('coinRewarded', {
            detail: { 
              courseId: parseInt(courseId.toString()), 
              newCoinCount: parseInt(newCoinCount.toString()) 
            }
          }));
        }
      });

      // Listen for certificate minting
      courseManager.on('CertificateMinted', (user, courseId, tokenId) => {
        if (user.toLowerCase() === userAddress?.toLowerCase()) {
          console.log('🏆 Certificate minted event:', { 
            user, 
            courseId: courseId.toString(), 
            tokenId: tokenId.toString() 
          });
          window.dispatchEvent(new CustomEvent('certificateMinted', {
            detail: { 
              courseId: parseInt(courseId.toString()), 
              tokenId: parseInt(tokenId.toString()) 
            }
          }));
        }
      });

    } catch (err) {
      console.error('Error setting up event listeners:', err);
    }
  }, [courseManager, userAddress]);

  // Cleanup event listeners
  const cleanupEventListeners = useCallback(() => {
    if (courseManager) {
      try {
        courseManager.removeAllListeners();
        console.log('Event listeners cleaned up');
      } catch (err) {
        console.error('Error cleaning up event listeners:', err);
      }
    }
  }, [courseManager]);

  return {
    loading,
    error,
    isConnected,
    clearError,
    getUserCoins,
    canClaimCertificate,
    hasReceivedCertificate,
    getCourseInfo,
    claimCertificate,
    rewardCoin,
    autoClaimCertificateIfEligible,
    getUserCertificates,
    getUserStats,
    setupEventListeners,
    cleanupEventListeners
  };
};