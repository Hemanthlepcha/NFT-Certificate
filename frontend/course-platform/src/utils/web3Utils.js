// src/utils/web3Utils.js

import { ethers } from 'ethers';

/**
 * Format wallet address for display
 * @param {string} address - Full wallet address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format large numbers for display
 * @param {number} number - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (number) => {
  if (number === 0) return '0';
  if (number < 1000) return number.toString();
  if (number < 1000000) return `${(number / 1000).toFixed(1)}K`;
  return `${(number / 1000000).toFixed(1)}M`;
};

/**
 * Format percentage for display
 * @param {number} percentage - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (percentage, decimals = 1) => {
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Check if MetaMask is installed
 * @returns {boolean} True if MetaMask is available
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
};

/**
 * Check if address is valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid
 */
export const isValidAddress = (address) => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

/**
 * Get network name from chain ID
 * @param {number} chainId - Chain ID
 * @returns {string} Network name
 */
export const getNetworkName = (chainId) => {
  const networks = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet', 
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    56: 'Binance Smart Chain',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    31337: 'Localhost',
    1337: 'Localhost'
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
};

/**
 * Format gas price for display
 * @param {bigint} gasPrice - Gas price in wei
 * @returns {string} Formatted gas price
 */
export const formatGasPrice = (gasPrice) => {
  try {
    const gwei = ethers.formatUnits(gasPrice, 'gwei');
    return `${parseFloat(gwei).toFixed(2)} Gwei`;
  } catch {
    return 'Unknown';
  }
};

/**
 * Format ETH amount for display
 * @param {bigint|string} wei - Amount in wei
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted ETH amount
 */
export const formatEth = (wei, decimals = 4) => {
  try {
    const eth = ethers.formatEther(wei);
    return `${parseFloat(eth).toFixed(decimals)} ETH`;
  } catch {
    return '0 ETH';
  }
};

/**
 * Parse error message from transaction failure
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const parseError = (error) => {
  if (!error) return 'Unknown error occurred';
  
  // Handle common errors
  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    return 'Transaction was rejected by user';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS' || error.code === -32000) {
    return 'Insufficient funds for transaction';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection';
  }
  
  if (error.message?.includes('execution reverted')) {
    // Extract revert reason
    const match = error.message.match(/execution reverted: (.+)/);
    if (match) {
      return match[1];
    }
    return 'Transaction failed';
  }
  
  if (error.message?.includes('user rejected transaction')) {
    return 'Transaction was rejected by user';
  }
  
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  // Return original message if no specific handling
  return error.message || error.toString();
};

/**
 * Wait for transaction confirmation with timeout
 * @param {object} provider - Ethers provider
 * @param {string} txHash - Transaction hash
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<object>} Transaction receipt
 */
export const waitForTransaction = async (provider, txHash, timeout = 60000) => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Transaction timeout'));
    }, timeout);
    
    provider.waitForTransaction(txHash)
      .then(receipt => {
        clearTimeout(timeoutId);
        resolve(receipt);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

/**
 * Get transaction URL for block explorer
 * @param {string} txHash - Transaction hash
 * @param {number} chainId - Chain ID
 * @returns {string} Block explorer URL
 */
export const getTransactionUrl = (txHash, chainId) => {
  const explorers = {
    1: 'https://etherscan.io',
    3: 'https://ropsten.etherscan.io',
    4: 'https://rinkeby.etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    56: 'https://bscscan.com',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com'
  };
  
  const baseUrl = explorers[chainId];
  if (!baseUrl) return '#';
  
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Debounce function for search and other frequent operations
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};