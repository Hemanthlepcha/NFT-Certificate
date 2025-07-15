// src/components/CourseList/CourseList.js

import React, { useState, useMemo } from 'react';
import { useCourseData } from '../../hooks/useCourseData';
import { useWeb3 } from '../../context/Web3Context';
import CourseCard from '../CourseCard/CourseCard';
import LoadingSpinner from '../Common/LoadingSpinner';
import Button from '../Common/Button';
import { debounce } from '../../utils/web3Utils';
import './CourseList.css';

const CourseList = ({ onSelectCourse, setCurrentPage }) => {
  const { isConnected } = useWeb3();
  const {
    courses,
    loading,
    selectedCategory,
    setSelectedCategory,
    categories,
    totalStats,
    getNextRecommendedCourse,
    searchCourses
  } = useCourseData();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showCompleted, setShowCompleted] = useState(true);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query) => setSearchQuery(query), 300),
    []
  );

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = searchQuery ? searchCourses(searchQuery) : courses;

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(course => !course.hasReceived);
    }

    // Sort courses
    switch (sortBy) {
      case 'progress':
        return filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        return filtered.sort((a, b) => 
          difficultyOrder[a.category] - difficultyOrder[b.category]
        );
      case 'coins':
        return filtered.sort((a, b) => a.minCoinsRequired - b.minCoinsRequired);
      case 'alphabetical':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [courses, searchQuery, searchCourses, sortBy, showCompleted]);

  const handleEnrollCourse = (course) => {
    onSelectCourse(course);
    setCurrentPage('course-detail');
  };

  const handleViewDetails = (course) => {
    onSelectCourse(course);
    setCurrentPage('course-detail');
  };

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const nextRecommended = getNextRecommendedCourse();

  if (loading) {
    return (
      <div className="course-list-loading">
        <LoadingSpinner size="large" text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="course-list">
      {/* Header Section */}
      <div className="course-list-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">📚</span>
            Course Library
          </h1>
          <p className="page-subtitle">
            Master blockchain technology through our comprehensive courses
          </p>
        </div>

        {/* Stats Overview */}
        {isConnected && (
          <div className="stats-overview">
            <div className="stat-item">
              <span className="stat-value">{totalStats.totalCoins}</span>
              <span className="stat-label">Coins Earned</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalStats.completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalStats.inProgressCount}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{Math.round(totalStats.completionRate)}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Course */}
      {isConnected && nextRecommended && (
        <div className="recommended-section">
          <h2 className="section-title">
            <span className="title-icon">⭐</span>
            Recommended for You
          </h2>
          <div className="recommended-card">
            <CourseCard
              course={nextRecommended}
              onEnroll={handleEnrollCourse}
              onViewDetails={handleViewDetails}
              showProgress={true}
            />
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search courses..."
              className="search-input"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="filter-controls">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category:</label>
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <label className="filter-label">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="default">Default</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="difficulty">Difficulty</option>
              <option value="progress">Progress</option>
              <option value="coins">Required Coins</option>
            </select>
          </div>

          {/* Show Completed Toggle */}
          {isConnected && (
            <div className="filter-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">Show Completed</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="courses-section">
        {filteredAndSortedCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3 className="empty-title">No courses found</h3>
            <p className="empty-description">
              {searchQuery 
                ? `No courses match "${searchQuery}". Try adjusting your search.`
                : 'No courses match your current filters.'
              }
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  document.querySelector('.search-input').value = '';
                }}
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="courses-header">
              <h2 className="section-title">
                Available Courses
                <span className="course-count">({filteredAndSortedCourses.length})</span>
              </h2>
            </div>
            
            <div className="courses-grid">
              {filteredAndSortedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnrollCourse}
                  onViewDetails={handleViewDetails}
                  showProgress={isConnected}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Connect Wallet CTA */}
      {!isConnected && (
        <div className="connect-cta">
          <div className="cta-content">
            <h3 className="cta-title">🔗 Connect Your Wallet</h3>
            <p className="cta-description">
              Connect your wallet to track progress, earn coins, and claim certificates!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseList;