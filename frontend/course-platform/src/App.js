// src/App.js

import React, { useState, useEffect } from 'react';
import { Web3Provider } from './context/Web3Context';
import Header from './components/Header/Header';
import CourseList from './components/CourseList/CourseList';
import CourseDetail from './components/CourseDetail/CourseDetail';
import Achievements from './components/Achievements/Achievements';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { useCourseData } from './hooks/useCourseData';
import { debugContract } from './utils/debugContract';
import './App.css';

// Main App Component wrapped with Web3Provider
function AppContent() {
  const [currentPage, setCurrentPage] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loadUserProgress } = useCourseData();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate initial loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Run debug in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Running contract debug...');
          setTimeout(() => {
            debugContract();
          }, 2000); // Wait for wallet connection
        }
        
        // Load any initial data
        await loadUserProgress();
        
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadUserProgress]);

  // Handle course selection
  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
  };

  // Handle course completion
  const handleCourseComplete = (course) => {
    console.log('Course completed:', course.title);
    // Could trigger notifications, analytics, etc.
  };

  // Handle page navigation
  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    // Clear selected course when navigating away from course detail
    if (page !== 'course-detail') {
      setSelectedCourse(null);
    }
  };

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-icon">🎓</span>
            <h1 className="logo-text">Course Platform</h1>
          </div>
          <LoadingSpinner size="large" text="Loading your learning environment..." />
          <div className="loading-features">
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span className="feature-text">Interactive Courses</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🪙</span>
              <span className="feature-text">Earn Coins</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">NFT Certificates</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Header Navigation */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Course List Page */}
        {currentPage === 'courses' && (
          <CourseList
            onSelectCourse={handleSelectCourse}
            setCurrentPage={handlePageChange}
          />
        )}

        {/* Course Detail Page */}
        {currentPage === 'course-detail' && selectedCourse && (
          <CourseDetail
            course={selectedCourse}
            onBack={() => handlePageChange('courses')}
            onCourseComplete={handleCourseComplete}
          />
        )}

        {/* Achievements Page */}
        {currentPage === 'achievements' && (
          <Achievements
            onSelectCourse={handleSelectCourse}
            setCurrentPage={handlePageChange}
          />
        )}

        {/* Error State - if somehow we end up in an invalid state */}
        {currentPage === 'course-detail' && !selectedCourse && (
          <div className="error-state">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h2 className="error-title">Course Not Found</h2>
              <p className="error-description">
                The course you're looking for couldn't be found. 
                Please go back to the course list and try again.
              </p>
              <button 
                className="error-button"
                onClick={() => handlePageChange('courses')}
              >
                Back to Courses
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">🎓 Course Platform</h3>
            <p className="footer-description">
              Learn blockchain technology and earn NFT certificates
            </p>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Features</h4>
            <ul className="footer-links">
              <li>Interactive Courses</li>
              <li>Progress Tracking</li>
              <li>NFT Certificates</li>
              <li>Achievement System</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Getting Started</h4>
            <ul className="footer-links">
              <li>Connect Wallet</li>
              <li>Browse Courses</li>
              <li>Earn Coins</li>
              <li>Claim Certificates</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <div className="footer-social">
              <span className="social-note">
                Built with ❤️ for the blockchain community
              </span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <span className="copyright">
              © 2024 Course Platform. Built for learning and growth.
            </span>
            <div className="footer-tech">
              <span className="tech-item">⚡ React</span>
              <span className="tech-item">🔗 Ethereum</span>
              <span className="tech-item">💎 Web3</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main App Component with Providers
function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;