// src/hooks/useCourseData.js

import { useState, useEffect, useCallback, useMemo } from 'react';
import { COURSES_DATA, COURSE_CATEGORIES, ACHIEVEMENT_LEVELS } from '../constants/courseData';
import { useContracts } from './useContracts';
import { useWeb3 } from '../context/Web3Context';

export const useCourseData = () => {
  const { isConnected, userAddress } = useWeb3();
  const { getUserStats } = useContracts();
  
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get all course IDs
  const courseIds = useMemo(() => COURSES_DATA.map(course => course.id), []);

  // Load user progress for all courses
  const loadUserProgress = useCallback(async () => {
    if (!isConnected || !userAddress) {
      setUserProgress({});
      return;
    }

    try {
      setLoading(true);
      const stats = await getUserStats(courseIds);
      setUserProgress(stats);
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setLoading(false);
    }
  }, [isConnected, userAddress, getUserStats, courseIds]);

  // Load progress on mount and when user connects
  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);

  // Listen for blockchain events to refresh progress
  useEffect(() => {
    const handleCertificateClaimed = () => {
      loadUserProgress();
    };

    const handleCoinRewarded = () => {
      loadUserProgress();
    };

    window.addEventListener('certificateClaimed', handleCertificateClaimed);
    window.addEventListener('coinRewarded', handleCoinRewarded);

    return () => {
      window.removeEventListener('certificateClaimed', handleCertificateClaimed);
      window.removeEventListener('coinRewarded', handleCoinRewarded);
    };
  }, [loadUserProgress]);

  // Get filtered courses based on selected category
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'All') {
      return COURSES_DATA;
    }
    return COURSES_DATA.filter(course => course.category === selectedCategory);
  }, [selectedCategory]);

  // Get courses with user progress data
  const coursesWithProgress = useMemo(() => {
    return filteredCourses.map(course => ({
      ...course,
      userCoins: userProgress[course.id]?.coins || 0,
      canClaim: userProgress[course.id]?.canClaim || false,
      hasReceived: userProgress[course.id]?.hasReceived || false,
      progressPercentage: Math.min(100, ((userProgress[course.id]?.coins || 0) / course.minCoinsRequired) * 100)
    }));
  }, [filteredCourses, userProgress]);

  // Get completed courses
  const completedCourses = useMemo(() => {
    return coursesWithProgress.filter(course => course.hasReceived);
  }, [coursesWithProgress]);

  // Get courses in progress (has some coins but not completed)
  const inProgressCourses = useMemo(() => {
    return coursesWithProgress.filter(course => 
      course.userCoins > 0 && !course.hasReceived
    );
  }, [coursesWithProgress]);

  // Get total statistics
  const totalStats = useMemo(() => {
    const totalCoins = Object.values(userProgress).reduce((sum, progress) => sum + (progress.coins || 0), 0);
    const totalCourses = COURSES_DATA.length;
    const completedCount = completedCourses.length;
    const inProgressCount = inProgressCourses.length;

    return {
      totalCoins,
      totalCourses,
      completedCount,
      inProgressCount,
      completionRate: totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0
    };
  }, [userProgress, completedCourses.length, inProgressCourses.length]);

  // Get user achievement level
  const achievementLevel = useMemo(() => {
    const completedCount = completedCourses.length;
    
    for (const [key, level] of Object.entries(ACHIEVEMENT_LEVELS)) {
      if (completedCount >= level.min && completedCount <= level.max) {
        return { key, ...level };
      }
    }
    
    // If more than max, return highest level
    return { key: 'EXPERT', ...ACHIEVEMENT_LEVELS.EXPERT };
  }, [completedCourses.length]);

  // Get course by ID
  const getCourseById = useCallback((courseId) => {
    const course = COURSES_DATA.find(c => c.id === parseInt(courseId));
    if (!course) return null;

    return {
      ...course,
      userCoins: userProgress[course.id]?.coins || 0,
      canClaim: userProgress[course.id]?.canClaim || false,
      hasReceived: userProgress[course.id]?.hasReceived || false,
      progressPercentage: Math.min(100, ((userProgress[course.id]?.coins || 0) / course.minCoinsRequired) * 100)
    };
  }, [userProgress]);

  // Get next recommended course
  const getNextRecommendedCourse = useCallback(() => {
    // Find first course that's not completed
    const notCompleted = coursesWithProgress.filter(course => !course.hasReceived);
    
    if (notCompleted.length === 0) return null;
    
    // Sort by category difficulty and progress
    const sorted = notCompleted.sort((a, b) => {
      const categoryOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
      const aOrder = categoryOrder[a.category] || 4;
      const bOrder = categoryOrder[b.category] || 4;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.userCoins - a.userCoins; // Prefer courses with more progress
    });
    
    return sorted[0];
  }, [coursesWithProgress]);

  // Search courses
  const searchCourses = useCallback((query) => {
    if (!query.trim()) return coursesWithProgress;
    
    const searchTerm = query.toLowerCase();
    return coursesWithProgress.filter(course => 
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.category.toLowerCase().includes(searchTerm)
    );
  }, [coursesWithProgress]);

  return {
    // Data
    courses: coursesWithProgress,
    completedCourses,
    inProgressCourses,
    totalStats,
    achievementLevel,
    
    // Filters
    selectedCategory,
    setSelectedCategory,
    categories: COURSE_CATEGORIES,
    
    // State
    loading,
    userProgress,
    
    // Actions
    loadUserProgress,
    getCourseById,
    getNextRecommendedCourse,
    searchCourses,
    
    // Raw data
    allCourses: COURSES_DATA
  };
};