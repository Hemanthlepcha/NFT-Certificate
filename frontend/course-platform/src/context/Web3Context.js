// src/context/Web3Context.js

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  CONTRACT_ADDRESSES, 
  COURSE_MANAGER_ABI, 
  CERTIFICATE_NFT_ABI 
} from '../constants/contracts';

// Initial state
const initialState = {
  // Connection state
  isConnected: false,
  isConnecting: false,
  
  // Web3 objects
  provider: null,
  signer: null,
  userAddress: '',
  
  // Contracts
  courseManager: null,
  certificateNFT: null,
  
  // Network info
  network: null,
  chainId: null,
  
  // Error handling
  error: null
};

// Action types
const actionTypes = {
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ERROR: 'SET_ERROR',
  SET_NETWORK: 'SET_NETWORK',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const web3Reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_CONNECTING:
      return {
        ...state,
        isConnecting: true,
        error: null
      };
      
    case actionTypes.SET_CONNECTED:
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        provider: action.payload.provider,
        signer: action.payload.signer,
        userAddress: action.payload.userAddress,
        courseManager: action.payload.courseManager,
        certificateNFT: action.payload.certificateNFT,
        error: null
      };
      
    case actionTypes.SET_DISCONNECTED:
      return {
        ...initialState
      };
      
    case actionTypes.SET_ERROR:
      return {
        ...state,
        isConnecting: false,
        error: action.payload
      };
      
    case actionTypes.SET_NETWORK:
      return {
        ...state,
        network: action.payload.network,
        chainId: action.payload.chainId
      };
      
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
      
    default:
      return state;
  }
};

// Create context
const Web3Context = createContext();

// Web3 Provider component
export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      dispatch({ type: actionTypes.SET_CONNECTING });

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      // Get signer and address
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // Get network info
      const network = await provider.getNetwork();
      
      // Initialize contracts
      const courseManager = new ethers.Contract(
        CONTRACT_ADDRESSES.courseManager,
        COURSE_MANAGER_ABI,
        signer
      );
      
      const certificateNFT = new ethers.Contract(
        CONTRACT_ADDRESSES.certificateNFT,
        CERTIFICATE_NFT_ABI,
        signer
      );

      // Update state
      dispatch({
        type: actionTypes.SET_CONNECTED,
        payload: {
          provider,
          signer,
          userAddress,
          courseManager,
          certificateNFT
        }
      });

      dispatch({
        type: actionTypes.SET_NETWORK,
        payload: {
          network: network.name,
          chainId: network.chainId
        }
      });

      console.log('Wallet connected successfully:', userAddress);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error.message
      });
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch({ type: actionTypes.SET_DISCONNECTED });
    console.log('Wallet disconnected');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum && window.ethereum.selectedAddress) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.userAddress) {
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [state.userAddress]);

  // Context value
  const value = {
    ...state,
    connectWallet,
    disconnectWallet,
    clearError
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// Custom hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;