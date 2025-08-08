
import './AchievementStyle.css';// Assuming you have a CSS file for styles
export const AchievementBadge = ({ certificate, course, isEarned = false, size = "medium" }) => {
    const getBadgeStyle = () => {
        if (!isEarned) return "achievement-badge locked";

        const categoryStyles = {
            'Beginner': 'achievement-badge earned bronze',
            'Intermediate': 'achievement-badge earned silver',
            'Advanced': 'achievement-badge earned gold'
        };

        return categoryStyles[course?.category] || 'achievement-badge earned';
    };

    return (
        <div className={`${getBadgeStyle()} ${size}`}>
            <div className="badge-icon">
                {isEarned ? (
                    course?.category === 'Advanced' ? '🏆' :
                        course?.category === 'Intermediate' ? '🥈' : '🥉'
                ) : '🔒'}
            </div>
            <div className="badge-content">
                <h4 className="badge-title">
                    {isEarned ? course?.title : 'Locked'}
                </h4>
                <p className="badge-subtitle">
                    {isEarned ? 'NFT Certificate Earned' : 'Complete course to unlock'}
                </p>
                {isEarned && certificate && (
                    <div className="badge-details">
                        <span className="token-id">Token #{certificate.tokenId}</span>
                        <span className="earned-date">Earned recently</span>
                    </div>
                )}
            </div>
            {isEarned && (
                <div className="badge-checkmark">✓</div>
            )}
        </div>
    );
};
export const AchievementMilestones = ({ certificates, courses, courseStatuses }) => {
    const earnedCount = Object.values(courseStatuses).filter(status => status.hasReceived).length;

    const milestones = [
        {
            id: 'first_steps',
            title: 'First Steps',
            description: 'Earn your first NFT certificate',
            requirement: 1,
            icon: '🌱',
            color: 'green'
        },
        {
            id: 'getting_serious',
            title: 'Getting Serious',
            description: 'Earn 2 NFT certificates',
            requirement: 2,
            icon: '🚀',
            color: 'blue'
        },
        {
            id: 'master_learner',
            title: 'Master Learner',
            description: 'Earn all available NFT certificates',
            requirement: courses.length,
            icon: '👑',
            color: 'gold'
        }
    ];

    return (
        <div className="achievement-milestones">
            <h3 className="milestones-title">🎯 Learning Milestones</h3>
            <div className="milestones-track">
                {milestones.map((milestone, index) => {
                    const isAchieved = earnedCount >= milestone.requirement;
                    const isNext = !isAchieved && (index === 0 || earnedCount >= milestones[index - 1].requirement);

                    return (
                        <div
                            key={milestone.id}
                            className={`milestone ${isAchieved ? 'achieved' : ''} ${isNext ? 'next' : ''}`}
                        >
                            <div className="milestone-icon" style={{ backgroundColor: isAchieved ? milestone.color : '#ccc' }}>
                                {milestone.icon}
                            </div>
                            <div className="milestone-content">
                                <h4 className="milestone-title">{milestone.title}</h4>
                                <p className="milestone-description">{milestone.description}</p>
                                <div className="milestone-progress">
                                    {earnedCount}/{milestone.requirement} NFTs
                                </div>
                            </div>
                            {isAchieved && (
                                <div className="milestone-badge">✅</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export const AchievementGallery = ({ certificates, courses, courseStatuses }) => {
    const earnedCertificates = certificates || [];

    // Create achievement data combining course info with certificate data
    const achievements = courses.map(course => {
        const status = courseStatuses[course.id] || {};
        const certificate = earnedCertificates.find(cert => {
            // Match by course metadata if available, fallback to token ID pattern
            return cert.metadata?.attributes?.some(attr =>
                attr.trait_type === 'Course ID' && attr.value === course.id.toString()
            ) || (course.id <= earnedCertificates.length);
        });

        return {
            course,
            certificate,
            isEarned: status.hasReceived || false,
            canEarn: status.canClaim || false,
            progress: status.userCoins || 0
        };
    });

    const earnedCount = achievements.filter(a => a.isEarned).length;
    const totalCount = achievements.length;

    return (
        <div className="achievement-gallery">
            <div className="gallery-header">
                <h3 className="gallery-title">🏆 Your Achievement Collection</h3>
                <div className="gallery-stats">
                    <span className="earned-count">{earnedCount}/{totalCount} Unlocked</span>
                    <div className="progress-indicator">
                        <div
                            className="progress-fill"
                            style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="achievements-grid">
                {achievements.map(({ course, certificate, isEarned, canEarn, progress }) => (
                    <div key={course.id} className="achievement-item">
                        <AchievementBadge
                            certificate={certificate}
                            course={course}
                            isEarned={isEarned}
                            size="large"
                        />

                        {isEarned && certificate?.imageUrl && (
                            <div className="nft-preview">
                                <img
                                    src={certificate.imageUrl}
                                    alt={`${course.title} NFT`}
                                    className="nft-image"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}

                        <div className="achievement-actions">
                            {isEarned ? (
                                <div className="achievement-earned">
                                    <span className="earned-text">🎉 Achievement Unlocked!</span>
                                    {certificate && (
                                        <button
                                            className="view-nft-btn"
                                            onClick={() => {
                                                // Open NFT details or external marketplace
                                                window.open(`https://opensea.io/assets/ethereum/${certificateNFT?.address}/${certificate.tokenId}`, '_blank');
                                            }}
                                        >
                                            View NFT 📱
                                        </button>
                                    )}
                                </div>
                            ) : canEarn ? (
                                <div className="achievement-ready">
                                    <span className="ready-text">🎯 Ready to Claim!</span>
                                    <button
                                        className="claim-achievement-btn"
                                        onClick={() => handleClaimCertificate(course.id)}
                                    >
                                        Unlock Achievement 🏆
                                    </button>
                                </div>
                            ) : (
                                <div className="achievement-locked">
                                    <span className="locked-text">Complete course to unlock</span>
                                    <div className="progress-hint">
                                        {progress}/{course.minCoinsRequired} coins earned
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const RecentAchievements = ({ certificates }) => {
    // Sort certificates by most recent (you might want to add timestamps)
    const recentCerts = certificates.slice(0, 3);

    if (recentCerts.length === 0) return null;

    return (
        <div className="recent-achievements">
            <h3 className="recent-title">🆕 Recent Achievements</h3>
            <div className="recent-list">
                {recentCerts.map((cert, index) => (
                    <div key={cert.tokenId} className="recent-item">
                        <div className="recent-icon">🏆</div>
                        <div className="recent-content">
                            <h4 className="recent-course">
                                {cert.metadata?.name || `Course Certificate #${cert.tokenId}`}
                            </h4>
                            <p className="recent-description">
                                {cert.metadata?.description || 'NFT Certificate earned'}
                            </p>
                            <span className="recent-time">Token #{cert.tokenId}</span>
                        </div>
                        <div className="recent-badge">
                            <span className="new-badge">NEW</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};