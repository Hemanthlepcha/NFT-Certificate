// src/components/CourseDetail/CourseDetail.js

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useContracts } from '../../hooks/useContracts';
import Quiz from '../Quiz/Quiz';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatPercentage, formatAddress } from '../../utils/web3Utils';
import './CourseDetail.css';

const CourseDetail = ({ course, onBack, onCourseComplete }) => {
  const { isConnected, userAddress } = useWeb3();
  const { 
    getUserCoins, 
    canClaimCertificate, 
    hasReceivedCertificate,
    claimCertificate,
    loading: contractLoading,
    error: contractError,
    clearError
  } = useContracts();

  // Component state
  const [currentStep, setCurrentStep] = useState('overview'); // overview, content, quiz, completed
  const [userCoins, setUserCoins] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [isClaimingCertificate, setIsClaimingCertificate] = useState(false);
  const [enrollTime] = useState(Date.now());
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Load user progress
  useEffect(() => {
    if (isConnected && course) {
      loadUserProgress();
    }
  }, [isConnected, course, userAddress]);

  // Listen for blockchain events
  useEffect(() => {
    const handleCertificateClaimed = (event) => {
      if (event.detail.courseId === course.id) {
        loadUserProgress();
      }
    };

    const handleCoinRewarded = (event) => {
      if (event.detail.courseId === course.id) {
        loadUserProgress();
      }
    };

    window.addEventListener('certificateClaimed', handleCertificateClaimed);
    window.addEventListener('coinRewarded', handleCoinRewarded);

    return () => {
      window.removeEventListener('certificateClaimed', handleCertificateClaimed);
      window.removeEventListener('coinRewarded', handleCoinRewarded);
    };
  }, [course.id]);

  const loadUserProgress = async () => {
    try {
      const [coins, eligible, hasReceived] = await Promise.all([
        getUserCoins(course.id),
        canClaimCertificate(course.id),
        hasReceivedCertificate(course.id)
      ]);

      setUserCoins(coins);
      setCanClaim(eligible);
      setHasCertificate(hasReceived);

      // Auto-set step based on progress
      if (hasReceived) {
        setCurrentStep('completed');
      } else if (coins > 0) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    setCurrentStep('content');
  };

  const handleStartQuiz = () => {
    setCurrentStep('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentStep('completed');
    loadUserProgress(); // Refresh progress after quiz
  };

  const handleQuizExit = () => {
    setCurrentStep('content');
  };

  const handleClaimCertificate = async () => {
    if (!canClaim) return;

    setIsClaimingCertificate(true);
    clearError();

    try {
      await claimCertificate(course.id);
      await loadUserProgress();
      
      if (onCourseComplete) {
        onCourseComplete(course);
      }
    } catch (error) {
      console.error('Error claiming certificate:', error);
    } finally {
      setIsClaimingCertificate(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Beginner': '🌱',
      'Intermediate': '🚀',
      'Advanced': '⚡'
    };
    return icons[category] || '📚';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Beginner': '#4caf50',
      'Intermediate': '#ff9800',
      'Advanced': '#f44336'
    };
    return colors[category] || '#6c757d';
  };

  const progressPercentage = course.minCoinsRequired > 0 ? 
    Math.min(100, (userCoins / course.minCoinsRequired) * 100) : 0;

  // Quiz Component
  if (currentStep === 'quiz') {
    return (
      <Quiz
        course={course}
        onComplete={handleQuizComplete}
        onExit={handleQuizExit}
      />
    );
  }

  return (
    <div className="course-detail">
      {/* Navigation Header */}
      <div className="course-nav">
        <Button
          variant="ghost"
          onClick={onBack}
          icon="←"
        >
          Back to Courses
        </Button>
      </div>

      {/* Course Hero Section */}
      <div className="course-hero">
        <div className="hero-content">
          <div className="course-meta">
            <div 
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(course.category) }}
            >
              <span className="category-icon">{getCategoryIcon(course.category)}</span>
              <span className="category-text">{course.category}</span>
            </div>
            <div className="course-details">
              <span className="duration">⏱️ {course.duration}</span>
              <span className="questions">❓ {course.totalQuestions} questions</span>
            </div>
          </div>

          <h1 className="course-title">{course.title}</h1>
          <p className="course-description">{course.description}</p>

          {/* Progress Section */}
          {isConnected && isEnrolled && (
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Your Progress</span>
                <span className="progress-value">
                  {userCoins} / {course.minCoinsRequired} coins ({formatPercentage(progressPercentage)})
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="status-section">
            {hasCertificate && (
              <div className="status-badge completed">
                <span className="badge-icon">🏆</span>
                <span className="badge-text">Certificate Earned!</span>
              </div>
            )}
            {canClaim && !hasCertificate && (
              <div className="status-badge ready">
                <span className="badge-icon">✨</span>
                <span className="badge-text">Ready to Claim Certificate</span>
              </div>
            )}
            {isEnrolled && !hasCertificate && !canClaim && (
              <div className="status-badge enrolled">
                <span className="badge-icon">📖</span>
                <span className="badge-text">Enrolled</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="course-content">
        {/* Overview Step */}
        {currentStep === 'overview' && (
          <div className="content-step overview-step">
            <div className="step-content">
              <h2 className="step-title">Course Overview</h2>
              
              <div className="course-info">
                <div className="info-section">
                  <h3 className="info-title">What You'll Learn</h3>
                  <p className="info-description">{course.content.overview}</p>
                  
                  <h4 className="topics-title">Course Topics:</h4>
                  <ul className="topics-list">
                    {course.content.topics.map((topic, index) => (
                      <li key={index} className="topic-item">
                        <span className="topic-icon">📝</span>
                        <span className="topic-text">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="requirements-section">
                  <h3 className="info-title">Requirements</h3>
                  <div className="requirement-item">
                    <span className="requirement-icon">🪙</span>
                    <span className="requirement-text">
                      Earn {course.minCoinsRequired} coins to claim certificate
                    </span>
                  </div>
                  <div className="requirement-item">
                    <span className="requirement-icon">📱</span>
                    <span className="requirement-text">
                      Connect your wallet to track progress
                    </span>
                  </div>
                </div>
              </div>

              <div className="step-actions">
                {!isConnected ? (
                  <div className="connect-prompt">
                    <p>Connect your wallet to enroll in this course and track your progress.</p>
                  </div>
                ) : isEnrolled ? (
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={() => setCurrentStep('content')}
                    icon="📚"
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleEnroll}
                    icon="🚀"
                  >
                    Enroll in Course
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Step */}
        {currentStep === 'content' && (
          <div className="content-step study-step">
            <div className="step-content">
              <h2 className="step-title">Study Materials</h2>
              
              <div className="study-content">
                <div className="pdf-section">
                  <h3 className="section-title">📄 Course Document</h3>
                  <div className="pdf-viewer">
                    <div className="pdf-placeholder">
                      <div className="pdf-icon">📋</div>
                      <h4>Course Materials</h4>
                      <p>Access the comprehensive study guide for this course.</p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(course.pdfUrl, '_blank')}
                        icon="🔗"
                      >
                        Open PDF Document
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="study-tips">
                  <h3 className="section-title">💡 Study Tips</h3>
                  <ul className="tips-list">
                    <li>Take your time to read through all materials</li>
                    <li>Take notes on key concepts and definitions</li>
                    <li>You can retake the quiz multiple times</li>
                    <li>Each correct answer earns you 1 coin</li>
                  </ul>
                </div>
              </div>

              <div className="step-actions">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep('overview')}
                  icon="←"
                >
                  Back to Overview
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStartQuiz}
                  icon="📝"
                >
                  Take Quiz
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Completed Step */}
        {currentStep === 'completed' && (
          <div className="content-step completed-step">
            <div className="step-content">
              <h2 className="step-title">Course Progress</h2>
              
              <div className="completion-summary">
                <div className="summary-stats">
                  <div className="stat-card">
                    <div className="stat-value">{userCoins}</div>
                    <div className="stat-label">Coins Earned</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{formatPercentage(progressPercentage)}</div>
                    <div className="stat-label">Progress</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{course.minCoinsRequired}</div>
                    <div className="stat-label">Required</div>
                  </div>
                </div>

                <div className="certificate-section">
                  {hasCertificate ? (
                    <div className="certificate-earned">
                      <div className="certificate-icon">🏆</div>
                      <h3>Congratulations!</h3>
                      <p>You have successfully completed this course and earned your NFT certificate!</p>
                      <div className="certificate-info">
                        <div className="cert-detail">
                          <span className="cert-label">Earned by:</span>
                          <span className="cert-value">{formatAddress(userAddress)}</span>
                        </div>
                        <div className="cert-detail">
                          <span className="cert-label">Course:</span>
                          <span className="cert-value">{course.title}</span>
                        </div>
                      </div>
                    </div>
                  ) : canClaim ? (
                    <div className="certificate-ready">
                      <div className="ready-icon">✨</div>
                      <h3>Ready to Claim!</h3>
                      <p>You've earned enough coins to claim your NFT certificate!</p>
                      <Button
                        variant="warning"
                        size="large"
                        loading={isClaimingCertificate}
                        disabled={contractLoading}
                        onClick={handleClaimCertificate}
                        icon={!isClaimingCertificate ? "🏆" : null}
                      >
                        {isClaimingCertificate ? 'Claiming Certificate...' : 'Claim NFT Certificate'}
                      </Button>
                      {contractError && (
                        <div className="error-message">
                          <span className="error-text">{contractError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="certificate-pending">
                      <div className="pending-icon">📚</div>
                      <h3>Keep Learning!</h3>
                      <p>You need {course.minCoinsRequired - userCoins} more coins to earn your certificate.</p>
                      <Button
                        variant="primary"
                        onClick={handleStartQuiz}
                        icon="📝"
                      >
                        Retake Quiz
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="step-actions">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep('content')}
                  icon="📚"
                >
                  Review Materials
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack}
                  icon="←"
                >
                  Back to Courses
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;