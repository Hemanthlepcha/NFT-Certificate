// src/components/Header/Header.js

import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { formatAddress, getNetworkName, copyToClipboard } from '../../utils/web3Utils';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Header.css';

const Header = ({ currentPage, setCurrentPage }) => {
  const { 
    isConnected, 
    isConnecting, 
    userAddress, 
    chainId, 
    connectWallet, 
    disconnectWallet,
    error 
  } = useWeb3();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(userAddress);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
  };

  const navigationItems = [
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ];

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo and Title */}
        <div className="header-brand">
          <div className="brand-icon">🎓</div>
          <h1 className="brand-title">Course Platform</h1>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Wallet Section */}
        <div className="header-wallet">
          {!isConnected ? (
            <div className="wallet-connect">
              {error && (
                <div className="error-message">
                  <span className="error-text">{error}</span>
                </div>
              )}
              <Button
                onClick={connectWallet}
                loading={isConnecting}
                disabled={isConnecting}
                variant="success"
                size="medium"
                icon={!isConnecting ? '🔗' : null}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>
          ) : (
            <div className="wallet-connected">
              {/* Network Info */}
              <div className="network-info">
                <div className="network-indicator">
                  <span className="network-dot"></span>
                  <span className="network-name">
                    {chainId ? getNetworkName(Number(chainId)) : 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Account Dropdown */}
              <div className="account-dropdown">
                <button
                  className="account-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="account-avatar">
                    {userAddress ? userAddress.slice(2, 4).toUpperCase() : '??'}
                  </div>
                  <span className="account-address">
                    {formatAddress(userAddress)}
                  </span>
                  <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>
                    ▼
                  </span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="account-info">
                        <div className="full-address">{userAddress}</div>
                        <button
                          className="copy-button"
                          onClick={handleCopyAddress}
                        >
                          {copySuccess ? '✅ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button
                      className="dropdown-item disconnect"
                      onClick={handleDisconnect}
                    >
                      <span>🔌</span>
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="mobile-nav">
        {navigationItems.map(item => (
          <button
            key={item.id}
            className={`mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Backdrop for dropdown */}
      {showDropdown && (
        <div 
          className="dropdown-backdrop"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default Header;