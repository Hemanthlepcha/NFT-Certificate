// src/hooks/useQuizSimulation.js
// This simulates coin rewards locally when smart contract is owner-only

import { useState, useCallback } from 'react';
import { useContracts } from './useContracts';

export const useQuizSimulation = () => {
  const { claimCertificate, canClaimCertificate } = useContracts();
  const [localCoins, setLocalCoins] = useState({});
  const [isRewarding, setIsRewarding] = useState(false);

  // Simulate coin reward (stores locally)
  const simulateRewardCoin = useCallback(async (userAddress, courseId) => {
    setIsRewarding(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add coin locally
      setLocalCoins(prev => ({
        ...prev,
        [`${userAddress}-${courseId}`]: (prev[`${userAddress}-${courseId}`] || 0) + 1
      }));
      
      console.log('🪙 Simulated coin reward! (Local storage)');
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('coinRewarded', {
        detail: { courseId, userAddress, isSimulated: true }
      }));
      
      return true;
    } catch (error) {
      console.error('Error simulating coin reward:', error);
      throw error;
    } finally {
      setIsRewarding(false);
    }
  }, []);

  // Get simulated coins for user
  const getSimulatedCoins = useCallback((userAddress, courseId) => {
    return localCoins[`${userAddress}-${courseId}`] || 0;
  }, [localCoins]);

  // Try to claim certificate with simulated coins
  const tryClaimWithSimulatedCoins = useCallback(async (courseId, userAddress, requiredCoins) => {
    const simulatedCoins = getSimulatedCoins(userAddress, courseId);
    
    if (simulatedCoins >= requiredCoins) {
      try {
        // Check if actually eligible on blockchain
        const eligible = await canClaimCertificate(courseId);
        
        if (eligible) {
          // Can claim normally
          await claimCertificate(courseId);
          return { success: true, method: 'blockchain' };
        } else {
          // Show that user would be eligible with simulated coins
          return { 
            success: false, 
            method: 'simulation',
            message: `You earned ${simulatedCoins} coins! In production, you would automatically receive your certificate.`
          };
        }
      } catch (error) {
        return { 
          success: false, 
          method: 'error',
          message: 'Error claiming certificate: ' + error.message
        };
      }
    }
    
    return { 
      success: false, 
      method: 'insufficient',
      message: `Need ${requiredCoins - simulatedCoins} more coins`
    };
  }, [getSimulatedCoins, canClaimCertificate, claimCertificate]);

  // Clear simulated coins (for testing)
  const clearSimulatedCoins = useCallback(() => {
    setLocalCoins({});
  }, []);

  return {
    simulateRewardCoin,
    getSimulatedCoins,
    tryClaimWithSimulatedCoins,
    clearSimulatedCoins,
    isRewarding,
    localCoins
  };
};