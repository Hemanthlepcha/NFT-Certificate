// src/components/Achievements/Achievements.js

import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useCourseData } from '../../hooks/useCourseData';
import { useContracts } from '../../hooks/useContracts';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { formatAddress, formatPercentage } from '../../utils/web3Utils';
import './Achievements.css';

const Achievements = ({ onSelectCourse, setCurrentPage }) => {
  const { isConnected, userAddress } = useWeb3();
  const {
    courses,
    completedCourses,
    inProgressCourses,
    totalStats,
    achievementLevel,
    loading: courseLoading
  } = useCourseData();
  const {
    getUserCertificates,
    getUserCoins,
    canClaimCertificate,
    hasReceivedCertificate,
    claimCertificate,
    loading: contractLoading,
    error: contractError,
    clearError
  } = useContracts();

  const [certificates, setCertificates] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [courseStatuses, setCourseStatuses] = useState({});
  const [claimingCourse, setClaimingCourse] = useState(null);

  // Load user certificates and course statuses
  useEffect(() => {
    if (isConnected && userAddress) {
      loadCertificatesAndStatuses();
    }
  }, [isConnected, userAddress]);

  const loadCertificatesAndStatuses = async () => {
    setCertificatesLoading(true);
    try {
      // Load actual NFT certificates
      const userCerts = await getUserCertificates();
      console.log('📜 Loaded user certificates:', userCerts);
      setCertificates(userCerts);

      // Load course statuses for all courses
      const statuses = {};
      for (const course of courses) {
        try {
          const [userCoins, canClaim, hasReceived] = await Promise.all([
            getUserCoins(course.id),
            canClaimCertificate(course.id),
            hasReceivedCertificate(course.id)
          ]);

          statuses[course.id] = {
            userCoins,
            canClaim,
            hasReceived,
            isEligible: userCoins >= course.minCoinsRequired
          };
        } catch (error) {
          console.error(`Error loading status for course ${course.id}:`, error);
          statuses[course.id] = {
            userCoins: 0,
            canClaim: false,
            hasReceived: false,
            isEligible: false
          };
        }
      }
      setCourseStatuses(statuses);
    } catch (error) {
      console.error('Error loading certificates and statuses:', error);
    } finally {
      setCertificatesLoading(false);
    }
  };

  const handleClaimCertificate = async (courseId) => {
    if (!courseStatuses[courseId]?.canClaim || claimingCourse) return;

    setClaimingCourse(courseId);
    clearError();

    try {
      const timestamp = Date.now();
      const courseNames = {
        1: 'beginner',
        2: 'intermediate',
        3: 'advanced'
      };
      const courseName = courseNames[courseId] || `course-${courseId}`;
      const tokenURI = `https://api.courseplatform.com/certificates/${courseName}/${userAddress}/${timestamp}.json`;

      console.log(`🏆 Manually claiming certificate for course ${courseId}`);
      await claimCertificate(courseId, tokenURI);

      console.log('🎉 Certificate claimed successfully!');

      // Refresh statuses after claiming
      await loadCertificatesAndStatuses();
    } catch (error) {
      console.error('Error claiming certificate:', error);
    } finally {
      setClaimingCourse(null);
    }
  };

  const getNextAchievementLevel = () => {
    const levels = [
      { key: 'NEWCOMER', min: 0, max: 0, title: 'Newcomer', icon: '🌱' },
      { key: 'LEARNER', min: 1, max: 1, title: 'Blockchain Learner', icon: '📚' },
      { key: 'DEVELOPER', min: 2, max: 2, title: 'Smart Contract Developer', icon: '💻' },
      { key: 'EXPERT', min: 3, max: 3, title: 'DeFi Expert', icon: '🏆' }
    ];

    const currentIndex = levels.findIndex(level => level.key === achievementLevel.key);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getStreakInfo = () => {
    // This would typically come from backend tracking
    // For demo, we'll simulate based on completed courses
    const actualCertificates = Object.values(courseStatuses).filter(status => status.hasReceived).length;
    const streak = Math.min(actualCertificates * 3, 21); // Max 21 day streak
    const lastActive = actualCertificates > 0 ? 'Today' : 'Never';

    return { streak, lastActive };
  };

  const streakInfo = getStreakInfo();
  const nextLevel = getNextAchievementLevel();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'certificates', label: 'NFT Certificates', icon: '🏆' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'stats', label: 'Statistics', icon: '📋' }
  ];

  if (!isConnected) {
    return (
      <div className="achievements">
        <div className="achievements-header">
          <h1 className="page-title">
            <span className="title-icon">🏆</span>
            Your Achievements
          </h1>
        </div>

        <div className="connect-prompt">
          <div className="prompt-content">
            <div className="prompt-icon">🔗</div>
            <h2>Connect Your Wallet</h2>
            <p>Connect your wallet to view your learning progress, earned certificates, and achievements!</p>
          </div>
        </div>
      </div>
    );
  }

  if (courseLoading) {
    return (
      <div className="achievements-loading">
        <LoadingSpinner size="large" text="Loading your achievements..." />
      </div>
    );
  }

  // Count actual claimed certificates
  const actualCertificatesCount = Object.values(courseStatuses).filter(status => status.hasReceived).length;
  const claimableCertificatesCount = Object.values(courseStatuses).filter(status => status.canClaim).length;

  return (
    <div className="achievements">
      {/* Header */}
      <div className="achievements-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🏆</span>
            Your Achievements

          </h1>
          <div className="user-info">
            <span className="user-address">{formatAddress(userAddress)}</span>
          </div>
        </div>

        {/* Achievement Level */}
        <div className="level-section">
          <div className="current-level">
            <div className="level-icon">{achievementLevel.icon}</div>
            <div className="level-info">
              <h2 className="level-title">{achievementLevel.title}</h2>
              <p className="level-description">
                {actualCertificatesCount} NFT certificate{actualCertificatesCount !== 1 ? 's' : ''} earned
              </p>
            </div>
          </div>

          {nextLevel && actualCertificatesCount < nextLevel.min && (
            <div className="next-level">
              <div className="progress-to-next">
                <div className="next-level-info">
                  <span className="next-label">Next Level:</span>
                  <span className="next-title">{nextLevel.icon} {nextLevel.title}</span>
                </div>
                <div className="courses-needed">
                  {nextLevel.min - actualCertificatesCount} more certificate{nextLevel.min - actualCertificatesCount !== 1 ? 's' : ''} needed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card primary">
          <div className="stat-value">{totalStats.totalCoins}</div>
          <div className="stat-label">🪙 Total Coins</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{actualCertificatesCount}</div>
          <div className="stat-label">🏆 NFT Certificates</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">{claimableCertificatesCount}</div>
          <div className="stat-label">🎯 Ready to Claim</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{streakInfo.streak}</div>
          <div className="stat-label">🔥 Day Streak</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="achievement-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${selectedTab === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              {/* Completion Rate */}
              <div className="overview-card">
                <h3 className="card-title">📊 Completion Rate</h3>
                <div className="completion-circle">
                  <div className="circle-progress">
                    <svg viewBox="0 0 36 36" className="progress-ring">
                      <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle-fill"
                        strokeDasharray={`${totalStats.completionRate}, 100`}
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="progress-text">
                      {Math.round(totalStats.completionRate)}%
                    </div>
                  </div>
                </div>
                <p className="card-description">
                  {actualCertificatesCount} of {totalStats.totalCourses} courses completed
                </p>
              </div>

              {/* Recent Activity */}
              <div className="overview-card">
                <h3 className="card-title">⚡ Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">🔥</span>
                    <div className="activity-text">
                      <span className="activity-title">{streakInfo.streak} day learning streak!</span>
                      <span className="activity-time">Last active: {streakInfo.lastActive}</span>
                    </div>
                  </div>
                  {courses.filter(course => courseStatuses[course.id]?.hasReceived).slice(0, 3).map(course => (
                    <div key={course.id} className="activity-item">
                      <span className="activity-icon">🏆</span>
                      <div className="activity-text">
                        <span className="activity-title">Earned NFT for {course.title}</span>
                        <span className="activity-time">Certificate minted</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div className="overview-card">
                <h3 className="card-title">🎯 Next Steps</h3>
                <div className="next-steps">
                  {claimableCertificatesCount > 0 ? (
                    <div className="step-item">
                      <span className="step-icon">🏆</span>
                      <div className="step-text">
                        <span className="step-title">Claim NFT Certificates</span>
                        <span className="step-description">
                          {claimableCertificatesCount} certificate{claimableCertificatesCount !== 1 ? 's' : ''} ready to claim
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => setSelectedTab('certificates')}
                      >
                        Claim Now
                      </Button>
                    </div>
                  ) : inProgressCourses.length > 0 ? (
                    <div className="step-item">
                      <span className="step-icon">📚</span>
                      <div className="step-text">
                        <span className="step-title">Continue Learning</span>
                        <span className="step-description">
                          {inProgressCourses.length} course{inProgressCourses.length !== 1 ? 's' : ''} in progress
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => setCurrentPage('courses')}
                      >
                        Continue
                      </Button>
                    </div>
                  ) : actualCertificatesCount < totalStats.totalCourses ? (
                    <div className="step-item">
                      <span className="step-icon">🚀</span>
                      <div className="step-text">
                        <span className="step-title">Start New Course</span>
                        <span className="step-description">
                          {totalStats.totalCourses - actualCertificatesCount} course{totalStats.totalCourses - actualCertificatesCount !== 1 ? 's' : ''} available
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => setCurrentPage('courses')}
                      >
                        Explore
                      </Button>
                    </div>
                  ) : (
                    <div className="step-item">
                      <span className="step-icon">🌟</span>
                      <div className="step-text">
                        <span className="step-title">All Courses Completed!</span>
                        <span className="step-description">
                          Congratulations on earning all NFT certificates!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {selectedTab === 'certificates' && (
          <div className="certificates-tab">
            {certificatesLoading ? (
              <div className="loading-container">
                <LoadingSpinner size="medium" />
                <span>Loading NFT certificates...</span>
              </div>
            ) : (
              <>
                {/* Error Display */}
                {contractError && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span>{contractError}</span>
                  </div>
                )}

                {/* Course Certificate Status */}
                <div className="certificates-grid">
                  {courses.map(course => {
                    const status = courseStatuses[course.id] || {};
                    const { userCoins = 0, canClaim = false, hasReceived = false, isEligible = false } = status;

                    return (
                      <div key={course.id} className={`certificate-card ${hasReceived ? 'claimed' : canClaim ? 'claimable' : isEligible ? 'eligible' : 'not-eligible'}`}>
                        <div className="certificate-header">
                          <div className="certificate-icon">
                            {hasReceived ? '🏆' : canClaim ? '🎯' : isEligible ? '⭐' : '⏳'}
                          </div>
                          <div className="certificate-badge">
                            <span className="badge-text">
                              {hasReceived ? 'Claimed' : canClaim ? 'Ready' : isEligible ? 'Eligible' : 'Locked'}
                            </span>
                            {hasReceived && <span className="badge-icon">✓</span>}
                          </div>
                        </div>

                        <div className="certificate-content">
                          <h3 className="certificate-title">{course.title}</h3>
                          <p className="certificate-description">
                            {hasReceived ? 'NFT Certificate Earned' : 'Blockchain Certificate'}
                          </p>

                          <div className="certificate-details">
                            <div className="detail-item">
                              <span className="detail-label">Your Coins:</span>
                              <span className="detail-value">
                                {userCoins} / {course.minCoinsRequired} 🪙
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Category:</span>
                              <span className="detail-value">{course.category}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Status:</span>
                              <span className={`detail-value status-${hasReceived ? 'claimed' : canClaim ? 'ready' : isEligible ? 'eligible' : 'locked'}`}>
                                {hasReceived ? '✅ Claimed' : canClaim ? '🎯 Ready' : isEligible ? '⭐ Eligible' : '⏳ Locked'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="certificate-footer">
                          {hasReceived ? (
                            <div className="claimed-status">
                              <span>🏆 NFT in your wallet!</span>
                            </div>
                          ) : canClaim ? (
                            <Button
                              variant="primary"
                              size="small"
                              fullWidth
                              onClick={() => handleClaimCertificate(course.id)}
                              loading={claimingCourse === course.id}
                              disabled={claimingCourse === course.id}
                              icon="🏆"
                            >
                              {claimingCourse === course.id ? 'Claiming...' : 'Claim NFT Certificate'}
                            </Button>
                          ) : isEligible ? (
                            <div className="not-claimable">
                              <p>Complete all requirements to unlock</p>
                              <small>Check course details for requirements</small>
                            </div>
                          ) : (
                            <div className="not-eligible">
                              <p>Complete quiz to earn {course.minCoinsRequired} coins</p>
                              <small>Need {Math.max(0, course.minCoinsRequired - userCoins)} more coins</small>
                              <Button
                                variant="outline"
                                size="small"
                                fullWidth
                                onClick={() => {
                                  onSelectCourse(course);
                                  setCurrentPage('course-detail');
                                }}
                                icon="📚"
                                style={{ marginTop: '0.5rem' }}
                              >
                                Start Learning
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* NFT Collection Display */}
                {certificates.length > 0 && (
                  <div className="bg-slate-400 mt-4">
                    <h3 className="section-title ">🖼️ Your NFT Collection</h3>
                    <div className="bg-slate-800 p-4 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {certificates.map((cert, index) => (
                        <div key={cert.tokenId} className=" bg-slate-400">
                          <div className="nft-header flex flex-row">

                            <img className="h-8 rounded-md" src={cert.imageUrl} alt={`Certificate ${index + 1}`} />

                            {/* <span className="nft-id mt">#{cert.tokenId}</span> */}
                            {/* <span className="nft-badge">NFT</span> */}
                          </div>
                          <div className="nft-content">
                            <div className="nft-icon">🏆</div>
                            <h4 className="nft-title">Course Certificate</h4>
                            <p className="nft-description">Blockchain verified achievement</p>
                          </div>
                          <div className="nft-footer">
                            <small className="nft-uri">Token ID: {cert.tokenId}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {selectedTab === 'progress' && (
          <div className="progress-tab">
            <div className="progress-overview">
              <h3 className="section-title">Course Progress</h3>
              <div className="progress-list">
                {courses.map(course => {
                  const status = courseStatuses[course.id] || {};
                  const { userCoins = 0, hasReceived = false, canClaim = false } = status;
                  const progressPercentage = Math.min((userCoins / course.minCoinsRequired) * 100, 100);

                  return (
                    <div key={course.id} className="progress-item">
                      <div className="course-info">
                        <h4 className="course-name">{course.title}</h4>
                        <span className="course-category">{course.category}</span>
                      </div>
                      <div className="progress-details">
                        <div className="coins-progress">
                          <span className="coins-text">
                            {userCoins} / {course.minCoinsRequired} coins
                          </span>
                          <span className="percentage">
                            {formatPercentage(progressPercentage)}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="progress-status">
                        {hasReceived ? (
                          <span className="status completed">✅ NFT Earned</span>
                        ) : canClaim ? (
                          <span className="status ready">🏆 Ready to Claim</span>
                        ) : userCoins > 0 ? (
                          <span className="status in-progress">📚 In Progress</span>
                        ) : (
                          <span className="status not-started">⏳ Not Started</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {selectedTab === 'stats' && (
          <div className="stats-tab">
            <div className="stats-grid">
              <div className="stats-card">
                <h3 className="stats-title">📊 Learning Statistics</h3>
                <div className="stats-list">
                  <div className="stat-row">
                    <span className="stat-name">Total Courses Available</span>
                    <span className="stat-number">{totalStats.totalCourses}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-name">NFT Certificates Earned</span>
                    <span className="stat-number">{actualCertificatesCount}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-name">Certificates Ready to Claim</span>
                    <span className="stat-number">{claimableCertificatesCount}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-name">Total Coins Earned</span>
                    <span className="stat-number">{totalStats.totalCoins} 🪙</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-name">Success Rate</span>
                    <span className="stat-number">{formatPercentage((actualCertificatesCount / totalStats.totalCourses) * 100)}</span>
                  </div>
                </div>
              </div>

              <div className="stats-card">
                <h3 className="stats-title">🏆 NFT Achievement Breakdown</h3>
                <div className="achievement-breakdown">
                  <div className="achievement-item">
                    <span className="achievement-icon">🌱</span>
                    <span className="achievement-name">Beginner Certificates</span>
                    <span className="achievement-count">
                      {courses.filter(c => c.category === 'Beginner' && courseStatuses[c.id]?.hasReceived).length}
                    </span>
                  </div>
                  <div className="achievement-item">
                    <span className="achievement-icon">🚀</span>
                    <span className="achievement-name">Intermediate Certificates</span>
                    <span className="achievement-count">
                      {courses.filter(c => c.category === 'Intermediate' && courseStatuses[c.id]?.hasReceived).length}
                    </span>
                  </div>
                  <div className="achievement-item">
                    <span className="achievement-icon">⚡</span>
                    <span className="achievement-name">Advanced Certificates</span>
                    <span className="achievement-count">
                      {courses.filter(c => c.category === 'Advanced' && courseStatuses[c.id]?.hasReceived).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;