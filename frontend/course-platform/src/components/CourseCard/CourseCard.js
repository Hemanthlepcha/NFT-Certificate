// src/components/CourseCard/CourseCard.js

import React from 'react';
import Button from '../Common/Button';
import { formatPercentage } from '../../utils/web3Utils';
import './CourseCard.css';

const CourseCard = ({ 
  course, 
  onEnroll, 
  onViewDetails, 
  showProgress = true 
}) => {
  const {
    id,
    title,
    description,
    category,
    duration,
    minCoinsRequired,
    totalQuestions,
    userCoins = 0,
    canClaim = false,
    hasReceived = false,
    progressPercentage = 0
  } = course;

  const getCategoryColor = (category) => {
    const colors = {
      'Beginner': '#4caf50',
      'Intermediate': '#ff9800', 
      'Advanced': '#f44336'
    };
    return colors[category] || '#6c757d';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Beginner': '🌱',
      'Intermediate': '🚀',
      'Advanced': '⚡'
    };
    return icons[category] || '📚';
  };

  const getStatusBadge = () => {
    if (hasReceived) {
      return (
        <div className="status-badge completed">
          <span className="badge-icon">🏆</span>
          <span className="badge-text">Certified</span>
        </div>
      );
    }
    
    if (canClaim) {
      return (
        <div className="status-badge ready-to-claim">
          <span className="badge-icon">✨</span>
          <span className="badge-text">Ready to Claim</span>
        </div>
      );
    }
    
    if (userCoins > 0) {
      return (
        <div className="status-badge in-progress">
          <span className="badge-icon">📖</span>
          <span className="badge-text">In Progress</span>
        </div>
      );
    }
    
    return null;
  };

  const handleAction = () => {
    if (hasReceived || userCoins > 0) {
      onViewDetails(course);
    } else {
      onEnroll(course);
    }
  };

  const getActionButtonText = () => {
    if (hasReceived) return 'View Certificate';
    if (userCoins > 0) return 'Continue Learning';
    return 'Start Course';
  };

  const getActionButtonVariant = () => {
    if (hasReceived) return 'success';
    if (canClaim) return 'warning';
    if (userCoins > 0) return 'primary';
    return 'outline';
  };

  return (
    <div className={`course-card ${hasReceived ? 'completed' : ''}`}>
      {/* Status Badge */}
      {getStatusBadge()}

      {/* Course Header */}
      <div className="course-header">
        <div 
          className="category-badge"
          style={{ backgroundColor: getCategoryColor(category) }}
        >
          <span className="category-icon">{getCategoryIcon(category)}</span>
          <span className="category-text">{category}</span>
        </div>
        
        <div className="course-meta">
          <span className="duration">⏱️ {duration}</span>
          <span className="questions">❓ {totalQuestions} questions</span>
        </div>
      </div>

      {/* Course Content */}
      <div className="course-content">
        <h3 className="course-title">{title}</h3>
        <p className="course-description">{description}</p>
      </div>

      {/* Progress Section */}
      {showProgress && (
        <div className="progress-section">
          <div className="coins-info">
            <div className="coins-earned">
              <span className="coins-icon">🪙</span>
              <span className="coins-text">
                {userCoins} / {minCoinsRequired} coins
              </span>
            </div>
            <div className="progress-percentage">
              {formatPercentage(progressPercentage)}
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {progressPercentage > 0 && (
            <div className="progress-milestones">
              <div className={`milestone ${progressPercentage >= 25 ? 'completed' : ''}`}>
                <div className="milestone-dot"></div>
                <span className="milestone-label">25%</span>
              </div>
              <div className={`milestone ${progressPercentage >= 50 ? 'completed' : ''}`}>
                <div className="milestone-dot"></div>
                <span className="milestone-label">50%</span>
              </div>
              <div className={`milestone ${progressPercentage >= 75 ? 'completed' : ''}`}>
                <div className="milestone-dot"></div>
                <span className="milestone-label">75%</span>
              </div>
              <div className={`milestone ${progressPercentage >= 100 ? 'completed' : ''}`}>
                <div className="milestone-dot"></div>
                <span className="milestone-label">100%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Footer */}
      <div className="course-footer">
        <div className="requirements">
          <span className="requirement-label">Required:</span>
          <span className="requirement-value">{minCoinsRequired} coins</span>
        </div>
        
        <Button
          variant={getActionButtonVariant()}
          size="medium"
          fullWidth
          onClick={handleAction}
          icon={hasReceived ? '🏆' : userCoins > 0 ? '📚' : '🚀'}
        >
          {getActionButtonText()}
        </Button>
      </div>

      {/* Achievement Glow Effect */}
      {hasReceived && <div className="achievement-glow"></div>}
      {canClaim && <div className="ready-glow"></div>}
    </div>
  );
};

export default CourseCard;