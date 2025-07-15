import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useContracts } from '../../hooks/useContracts';
import Button from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatPercentage } from '../../utils/web3Utils';
import './Quiz.css';

const Quiz = ({ 
  course, 
  onComplete, 
  onExit 
}) => {
  const { isConnected, userAddress } = useWeb3();
  const { 
    rewardCoin,
    autoClaimCertificateIfEligible,
    getUserCoins,
    loading: contractLoading,
    error: contractError,
    clearError
  } = useContracts();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [coinRewardStatus, setCoinRewardStatus] = useState(null);

  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [autoClaimingCertificate, setAutoClaimingCertificate] = useState(false);
  const [autoClaimedCertificate, setAutoClaimedCertificate] = useState(false);
  const [blockchainError, setBlockchainError] = useState('');

  const currentQuestion = course.quiz[currentQuestionIndex];
  const totalQuestions = course.quiz.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setCoinRewardStatus(null);
    setBlockchainError('');
    clearError();
  }, [currentQuestionIndex, clearError]);

  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    setIsSubmitting(true);
    const questionTime = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.correct;

    const answerData = {
      questionId: currentQuestion.id,
      selectedAnswer,
      correctAnswer: currentQuestion.correct,
      isCorrect,
      timeSpent: questionTime
    };

    setUserAnswers(prev => [...prev, answerData]);

    // Reward coin on blockchain for correct answers
    if (isCorrect && isConnected) {
      try {
        setCoinRewardStatus('pending');
        console.log(`🪙 Rewarding coin on blockchain for user ${userAddress} in course ${course.id}`);
        
        const tx = await rewardCoin(userAddress, course.id, true);
        console.log('✅ Coin reward transaction confirmed:', tx.hash);
        setCoinRewardStatus('success');
      } catch (error) {
        console.error('❌ Error rewarding coin on blockchain:', error);
        setCoinRewardStatus('error');
        setBlockchainError(error.message || 'Failed to reward coin on blockchain');
      }
    }

    setShowExplanation(true);
    setIsSubmitting(false);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      completeQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCoinRewardStatus(null);
      setBlockchainError('');
    }
  };

  const completeQuiz = async () => {
    const totalTime = Date.now() - quizStartTime;
    const correct = userAnswers.filter(answer => answer.isCorrect).length;
    // + (selectedAnswer === currentQuestion.correct ? 1 : 0);
    const score = Math.round((correct / totalQuestions) * 100);

    setCorrectAnswers(correct);
    setFinalScore(score);
    setTimeSpent(totalTime);
    setIsQuizComplete(true);

    // Auto-claim certificate if user has enough coins
    if (isConnected && correct >= course.minCoinsRequired) {
      try {
        setAutoClaimingCertificate(true);
        console.log('🏆 User earned enough coins, starting certificate claiming process...');
        
        // Wait longer for blockchain confirmations
        setTimeout(async () => {
          try {
            console.log('🔍 Checking blockchain coin balance for certificate eligibility...');
            
            // Get current coin count from blockchain
            const currentCoins = await getUserCoins(userAddress, course.id);
            console.log(`📊 Final blockchain coins: ${currentCoins}, Required: ${course.minCoinsRequired}`);
            
            if (currentCoins >= course.minCoinsRequired) {
              console.log('✅ User has enough coins, attempting to claim NFT certificate...');
              const claimed = await autoClaimCertificateIfEligible(course.id);
              
              if (claimed) {
                setAutoClaimedCertificate(true);
                console.log('🎉 NFT Certificate auto-claimed successfully!');
              } else {
                console.log('❌ Certificate auto-claim failed');
                setBlockchainError('Certificate claiming failed. You can try manually from achievements section.');
              }
            } else {
              console.log('⏳ Not enough coins yet, some transactions may still be pending');
              setBlockchainError(`Need ${course.minCoinsRequired} coins, currently have ${currentCoins}. Some coin transactions may still be confirming.`);
            }
          } catch (error) {
            console.error('❌ Error during certificate claiming:', error);
            setBlockchainError(`Certificate claiming error: ${error.message}. You can try manually from achievements.`);
          } finally {
            setAutoClaimingCertificate(false);
          }
        }, 8000); // Wait 8 seconds for all blockchain confirmations
      } catch (error) {
        console.error('Error initiating certificate claiming:', error);
        setAutoClaimingCertificate(false);
        setBlockchainError('Error starting certificate claiming process.');
      }
    } else if (isConnected) {
      console.log(`📝 Quiz complete but not enough coins for certificate (${correct}/${course.minCoinsRequired})`);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowExplanation(false);
    setIsQuizComplete(false);
    setFinalScore(0);
    setCorrectAnswers(0);
    setTimeSpent(0);
    setCoinRewardStatus(null);
    setAutoClaimedCertificate(false);
    setAutoClaimingCertificate(false);
    setBlockchainError('');
    clearError();
  };

  const handleExitQuiz = () => {
    if (window.confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
      onExit();
    }
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return 'Excellent work! 🌟';
    if (score >= 80) return 'Great job! 👍';
    if (score >= 70) return 'Good effort! 👏';
    if (score >= 60) return 'Not bad! Keep learning! 📚';
    return 'Keep practicing! You\'ve got this! 💪';
  };

  // Show connection warning if not connected
  if (!isConnected) {
    return (
      <div className="quiz-container">
        <div className="quiz-complete">
          <div className="completion-header">
            <div className="completion-icon">⚠️</div>
            <h2 className="completion-title">Wallet Not Connected</h2>
            <p className="completion-message">
              Please connect your wallet to take the quiz and earn blockchain rewards.
            </p>
          </div>
          <div className="completion-actions">
            <Button variant="primary" onClick={onExit} icon="🔙">
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    return (
      <div className="quiz-container">
        <div className="quiz-complete">
          <div className="completion-header">
            <div className="completion-icon">
              {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👏' : '📚'}
            </div>
            <h2 className="completion-title">Quiz Complete!</h2>
            <p className="completion-message">{getPerformanceMessage(finalScore)}</p>
          </div>

          <div className="score-display">
            <div 
              className="score-circle"
              style={{ borderColor: getScoreColor(finalScore) }}
            >
              <span 
                className="score-value"
                style={{ color: getScoreColor(finalScore) }}
              >
                {finalScore}%
              </span>
            </div>
          </div>

          <div className="quiz-stats">
            <div className="stat-row">
              <span className="stat-label">Correct Answers:</span>
              <span className="stat-value">{correctAnswers} / {totalQuestions}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Time Spent:</span>
              <span className="stat-value">{formatTime(timeSpent)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label"> LearnCoin Earned:</span>
              <span className="stat-value">{correctAnswers} 🪙</span>
            </div>
            {correctAnswers >= course.minCoinsRequired && (
              <div className="stat-row certificate-status">
                <span className="stat-label">NFT Certificate Status:</span>
                {autoClaimedCertificate ? (
                  <span className="stat-value success">🏆 Claimed!</span>
                ) : autoClaimingCertificate ? (
                  <span className="stat-value loading">
                    <LoadingSpinner size="small" />
                    Processing...
                  </span>
                ) : (
                  <span className="stat-value eligible">✅ Eligible</span>
                )}
              </div>
            )}
          </div>

          {autoClaimingCertificate && (
            <div className="auto-claim-status">
              <LoadingSpinner size="medium" />
              <p>🏆 Claiming your NFT certificate...</p>
              <small>Processing blockchain transaction - this may take a moment</small>
            </div>
          )}

          {autoClaimedCertificate && (
            <div className="auto-claim-success">
              <div className="success-icon">🎉</div>
              <h3>NFT Certificate Claimed!</h3>
              <p>Your blockchain certificate has been minted to your wallet!</p>
              <small>Check your achievements section or wallet to view your NFT certificate</small>
            </div>
          )}

          {blockchainError && !autoClaimingCertificate && (
            <div className="blockchain-error">
              <div className="error-icon">⚠️</div>
              <h3>Certificate Status</h3>
              <p>{blockchainError}</p>
              <small>You can try claiming manually from the achievements section</small>
            </div>
          )}

          <div className="completion-actions">
            <Button
              variant="outline"
              onClick={handleRestartQuiz}
              icon="🔄"
            >
              Retake Quiz
            </Button>
            <Button
              variant="primary"
              onClick={onComplete}
              icon="✅"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-progress">
          <div className="progress-info">
            <span className="question-counter">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="progress-percentage">
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

        <button 
          className="exit-button"
          onClick={handleExitQuiz}
          title="Exit Quiz"
        >
          ✕
        </button>
      </div>

      <div className="question-card">
        <div className="question-header">
          <h3 className="question-text">{currentQuestion.question}</h3>
        </div>

        <div className="answer-options">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct;
            const isWrong = showExplanation && isSelected && !isCorrect;
            
            let buttonClass = 'answer-option';
            if (isSelected && !showExplanation) buttonClass += ' selected';
            if (showExplanation && isCorrect) buttonClass += ' correct';
            if (isWrong) buttonClass += ' wrong';
            if (showExplanation && !isSelected && !isCorrect) buttonClass += ' disabled';

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
                {showExplanation && isCorrect && (
                  <span className="option-icon correct-icon">✓</span>
                )}
                {isWrong && (
                  <span className="option-icon wrong-icon">✗</span>
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="explanation-section">
            <div className="explanation-header">
              <span className="explanation-icon">💡</span>
              <h4 className="explanation-title">Explanation</h4>
            </div>
            <p className="explanation-text">{currentQuestion.explanation}</p>
            
            {selectedAnswer === currentQuestion.correct && (
              <div className="reward-feedback">
                {coinRewardStatus === 'success' && (
                  <div className="coin-reward-success">
                    <span className="reward-icon">🪙</span>
                    <span className="reward-text">+1 LearnCoin Earned!</span>
                  </div>
                )}
                {coinRewardStatus === 'error' && (
                  <div className="coin-reward-error">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">
                      {blockchainError || 'Failed to reward coin on blockchain'}
                    </span>
                  </div>
                )}
                {coinRewardStatus === 'pending' && (
                  <div className="coin-reward-loading">
                    <LoadingSpinner size="small" />
                    <span>Rewarding coin on blockchain...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="quiz-actions">
          {!showExplanation ? (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isSubmitting}
              loading={isSubmitting}
              icon={!isSubmitting ? "📝" : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={handleNextQuestion}
              icon={isLastQuestion ? "🏁" : "➡️"}
            >
              {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>

      <div className="quiz-footer">
        <div className="course-info">
          <span className="course-title">{course.title}</span>
          <span className="coins-info">🪙 1 LearnCoin per correct answer</span>
        </div>
      </div>
    </div>
  );
};

export default Quiz;