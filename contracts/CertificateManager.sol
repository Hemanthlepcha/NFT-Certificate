// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CertificateNFT.sol";

contract CourseManager is Ownable {
    CertificateNFT public certificate;

    struct Course {
        uint256 minCoinsRequired;
        bool exists;
    }

    mapping(uint256 => Course) public courses; // courseId => Course
    mapping(address => mapping(uint256 => uint256)) public userCourseCoins; // user => courseId => coins
    mapping(address => mapping(uint256 => bool)) public hasReceivedCertificate; // user => courseId => bool

    event CourseAdded(uint256 indexed courseId, uint256 minCoinsRequired);
    event CoinRewarded(address indexed user, uint256 indexed courseId, uint256 newCoinCount);
    event CertificateMinted(address indexed user, uint256 indexed courseId, uint256 tokenId);

    constructor(address certificateAddress) Ownable(msg.sender) {
        certificate = CertificateNFT(certificateAddress);
    }

    function addCourse(
        uint256 courseId,
        uint256 minCoinsRequired
    ) external onlyOwner {
        require(!courses[courseId].exists, "Course already exists");
        courses[courseId] = Course(minCoinsRequired, true);
        emit CourseAdded(courseId, minCoinsRequired);
    }

    function rewardCoin(address user, uint256 courseId, bool isCorrect) external {
        require(courses[courseId].exists, "Invalid course");
        require(isCorrect, "Answer must be correct to reward coin");
        userCourseCoins[user][courseId]++;
        emit CoinRewarded(user, courseId, userCourseCoins[user][courseId]);
    }

    function claimCertificate(uint256 courseId, string memory tokenURI) external {
        require(courses[courseId].exists, "Invalid course");
        require(!hasReceivedCertificate[msg.sender][courseId], "Already received");
        require(userCourseCoins[msg.sender][courseId] >= courses[courseId].minCoinsRequired, "Not enough coins");

        // Mint new NFT for the user
        uint256 tokenId = certificate.mintCertificate(msg.sender, tokenURI);

        hasReceivedCertificate[msg.sender][courseId] = true;
        emit CertificateMinted(msg.sender, courseId, tokenId);
    }

    function getUserCoins(address user, uint256 courseId) external view returns (uint256) {
        return userCourseCoins[user][courseId];
    }

    function canClaimCertificate(address user, uint256 courseId) external view returns (bool) {
        Course memory course = courses[courseId];
        return (
            course.exists &&
            !hasReceivedCertificate[user][courseId] &&
            userCourseCoins[user][courseId] >= course.minCoinsRequired
        );
    }
}