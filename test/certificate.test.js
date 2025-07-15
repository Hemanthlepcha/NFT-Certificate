const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateNFT and CourseManager", function() {
    let certificateNFT;
    let courseManager;
    let owner;
    let user1;
    let user2;
    let user3;

    beforeEach(async function() {
        [owner, user1, user2, user3] = await ethers.getSigners();

        // Deploy CertificateNFT
        const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
        certificateNFT = await CertificateNFT.deploy(owner.address);
        await certificateNFT.waitForDeployment();

        // Deploy CourseManager
        const CourseManager = await ethers.getContractFactory("CourseManager");
        courseManager = await CourseManager.deploy(await certificateNFT.getAddress());
        await courseManager.waitForDeployment();
    });

    describe("CertificateNFT", function() {
        describe("Deployment", function() {
            it("Should set the right owner", async function() {
                expect(await certificateNFT.owner()).to.equal(owner.address);
            });

            it("Should set the correct name and symbol", async function() {
                expect(await certificateNFT.name()).to.equal("CourseCertificate");
                expect(await certificateNFT.symbol()).to.equal("CERT");
            });
        });

        describe("Minting", function() {
            it("Should mint certificate successfully by owner", async function() {
                const tokenURI = "https://example.com/certificate/1";
                
                await expect(certificateNFT.mintCertificate(user1.address, tokenURI))
                    .to.emit(certificateNFT, "Transfer")
                    .withArgs(ethers.ZeroAddress, user1.address, 0);

                expect(await certificateNFT.ownerOf(0)).to.equal(user1.address);
                expect(await certificateNFT.tokenURI(0)).to.equal(tokenURI);
            });

            it("Should increment token ID counter", async function() {
                await certificateNFT.mintCertificate(user1.address, "uri1");
                await certificateNFT.mintCertificate(user2.address, "uri2");

                expect(await certificateNFT.ownerOf(0)).to.equal(user1.address);
                expect(await certificateNFT.ownerOf(1)).to.equal(user2.address);
            });

            it("Should fail when non-owner tries to mint", async function() {
                await expect(
                    certificateNFT.connect(user1).mintCertificate(user2.address, "uri")
                ).to.be.revertedWithCustomError(certificateNFT, "OwnableUnauthorizedAccount");
            });

            it("Should return correct token ID", async function() {
                const tokenId = await certificateNFT.mintCertificate.staticCall(user1.address, "uri");
                expect(tokenId).to.equal(0);
            });
        });
    });

    describe("CourseManager", function() {
        describe("Deployment", function() {
            it("Should set the right owner", async function() {
                expect(await courseManager.owner()).to.equal(owner.address);
            });

            it("Should set the correct certificate contract address", async function() {
                expect(await courseManager.certificate()).to.equal(await certificateNFT.getAddress());
            });
        });

        describe("Course Management", function() {
            it("Should add a course successfully", async function() {
                const courseId = 1;
                const minCoins = 10;

                await expect(courseManager.addCourse(courseId, minCoins))
                    .to.emit(courseManager, "CourseAdded")
                    .withArgs(courseId, minCoins);

                const course = await courseManager.courses(courseId);
                expect(course.minCoinsRequired).to.equal(minCoins);
                expect(course.exists).to.equal(true);
                expect(course.currentIndex).to.equal(0);
            });

            it("Should fail to add duplicate course", async function() {
                const courseId = 1;
                await courseManager.addCourse(courseId, 10);

                await expect(courseManager.addCourse(courseId, 20))
                    .to.be.revertedWith("Course already exists");
            });

            it("Should fail when non-owner tries to add course", async function() {
                await expect(
                    courseManager.connect(user1).addCourse(1, 10)
                ).to.be.revertedWithCustomError(courseManager, "OwnableUnauthorizedAccount");
            });
        });

        describe("Coin Rewarding", function() {
            beforeEach(async function() {
                await courseManager.addCourse(1, 10);
            });

            it("Should reward coins successfully", async function() {
                await expect(courseManager.rewardCoin(user1.address, 1))
                    .to.emit(courseManager, "CoinRewarded")
                    .withArgs(user1.address, 1, 1);

                expect(await courseManager.getUserCoins(user1.address, 1)).to.equal(1);
            });

            it("Should increment coin count on multiple rewards", async function() {
                await courseManager.rewardCoin(user1.address, 1);
                await courseManager.rewardCoin(user1.address, 1);
                await courseManager.rewardCoin(user1.address, 1);

                expect(await courseManager.getUserCoins(user1.address, 1)).to.equal(3);
            });

            it("Should fail to reward coins for invalid course", async function() {
                await expect(courseManager.rewardCoin(user1.address, 99))
                    .to.be.revertedWith("Invalid course");
            });

            it("Should fail when non-owner tries to reward coins", async function() {
                await expect(
                    courseManager.connect(user1).rewardCoin(user2.address, 1)
                ).to.be.revertedWithCustomError(courseManager, "OwnableUnauthorizedAccount");
            });
        });

        describe("Certificate Management", function() {
            beforeEach(async function() {
                await courseManager.addCourse(1, 5);
            });

            it("Should add certificate to course successfully", async function() {
                // First mint some certificates
                await certificateNFT.mintCertificate(owner.address, "uri1");
                await certificateNFT.mintCertificate(owner.address, "uri2");

                await courseManager.addCertificateToCourse(1, 0);
                await courseManager.addCertificateToCourse(1, 1);

                // Test that we can claim certificates (indirect way to verify they were added)
                // Give user enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                }

                // Approve courseManager to transfer certificates
                await certificateNFT.setApprovalForAll(await courseManager.getAddress(), true);

                // Should be able to claim certificate
                expect(await courseManager.canClaimCertificate(user1.address, 1)).to.equal(true);
            });

            it("Should fail to add certificate to invalid course", async function() {
                await expect(courseManager.addCertificateToCourse(99, 0))
                    .to.be.revertedWith("Invalid course");
            });

            it("Should fail when non-owner tries to add certificate", async function() {
                await expect(
                    courseManager.connect(user1).addCertificateToCourse(1, 0)
                ).to.be.revertedWithCustomError(courseManager, "OwnableUnauthorizedAccount");
            });
        });

        describe("Certificate Claiming", function() {
            beforeEach(async function() {
                // Setup course
                await courseManager.addCourse(1, 5);
                
                // Mint certificates and add to course
                await certificateNFT.mintCertificate(owner.address, "uri1");
                await certificateNFT.mintCertificate(owner.address, "uri2");
                await courseManager.addCertificateToCourse(1, 0);
                await courseManager.addCertificateToCourse(1, 1);

                // Approve courseManager to transfer certificates
                await certificateNFT.setApprovalForAll(await courseManager.getAddress(), true);
            });

            it("Should claim certificate successfully", async function() {
                // Give user enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                }

                await expect(courseManager.connect(user1).claimCertificate(1))
                    .to.emit(courseManager, "CertificateClaimed")
                    .withArgs(user1.address, 1, 0);

                expect(await certificateNFT.ownerOf(0)).to.equal(user1.address);
                expect(await courseManager.hasReceivedCertificate(user1.address, 1)).to.equal(true);
            });

            it("Should fail to claim certificate for invalid course", async function() {
                await expect(courseManager.connect(user1).claimCertificate(99))
                    .to.be.revertedWith("Invalid course");
            });

            it("Should fail to claim certificate without enough coins", async function() {
                // Give user insufficient coins
                await courseManager.rewardCoin(user1.address, 1);
                await courseManager.rewardCoin(user1.address, 1);

                await expect(courseManager.connect(user1).claimCertificate(1))
                    .to.be.revertedWith("Not enough coins");
            });

            it("Should fail to claim certificate twice", async function() {
                // Give user enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                }

                await courseManager.connect(user1).claimCertificate(1);

                await expect(courseManager.connect(user1).claimCertificate(1))
                    .to.be.revertedWith("Already received");
            });

            it("Should fail when no certificates are left", async function() {
                // Give both users enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                    await courseManager.rewardCoin(user2.address, 1);
                    await courseManager.rewardCoin(user3.address, 1);
                }

                // Claim all available certificates
                await courseManager.connect(user1).claimCertificate(1);
                await courseManager.connect(user2).claimCertificate(1);

                // Third user should fail
                await expect(courseManager.connect(user3).claimCertificate(1))
                    .to.be.revertedWith("No certificate left");
            });

            it("Should update currentIndex correctly", async function() {
                // Give users enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                    await courseManager.rewardCoin(user2.address, 1);
                }

                let course = await courseManager.courses(1);
                expect(course.currentIndex).to.equal(0);

                await courseManager.connect(user1).claimCertificate(1);
                course = await courseManager.courses(1);
                expect(course.currentIndex).to.equal(1);

                await courseManager.connect(user2).claimCertificate(1);
                course = await courseManager.courses(1);
                expect(course.currentIndex).to.equal(2);
            });
        });

        describe("View Functions", function() {
            beforeEach(async function() {
                await courseManager.addCourse(1, 5);
                await certificateNFT.mintCertificate(owner.address, "uri1");
                await courseManager.addCertificateToCourse(1, 0);
                await certificateNFT.setApprovalForAll(await courseManager.getAddress(), true);
            });

            it("Should return correct user coins", async function() {
                expect(await courseManager.getUserCoins(user1.address, 1)).to.equal(0);
                
                await courseManager.rewardCoin(user1.address, 1);
                expect(await courseManager.getUserCoins(user1.address, 1)).to.equal(1);
            });

            it("Should return correct canClaimCertificate status", async function() {
                // Initially false - not enough coins
                expect(await courseManager.canClaimCertificate(user1.address, 1)).to.equal(false);

                // Give enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                }
                expect(await courseManager.canClaimCertificate(user1.address, 1)).to.equal(true);

                // After claiming, should be false
                await courseManager.connect(user1).claimCertificate(1);
                expect(await courseManager.canClaimCertificate(user1.address, 1)).to.equal(false);
            });

            it("Should return false for non-existent course", async function() {
                expect(await courseManager.canClaimCertificate(user1.address, 99)).to.equal(false);
            });

            it("Should return false when no certificates left", async function() {
                // Give user enough coins
                for (let i = 0; i < 5; i++) {
                    await courseManager.rewardCoin(user1.address, 1);
                    await courseManager.rewardCoin(user2.address, 1);
                }

                // First user claims the only certificate
                await courseManager.connect(user1).claimCertificate(1);

                // Second user should not be able to claim
                expect(await courseManager.canClaimCertificate(user2.address, 1)).to.equal(false);
            });
        });

        describe("Edge Cases", function() {
            it("Should handle course with zero minimum coins", async function() {
                await courseManager.addCourse(1, 0);
                await certificateNFT.mintCertificate(owner.address, "uri");
                await courseManager.addCertificateToCourse(1, 0);
                await certificateNFT.setApprovalForAll(await courseManager.getAddress(), true);

                // Should be able to claim immediately
                expect(await courseManager.canClaimCertificate(user1.address, 1)).to.equal(true);
                await courseManager.connect(user1).claimCertificate(1);
                expect(await certificateNFT.ownerOf(0)).to.equal(user1.address);
            });

            it("Should handle multiple courses independently", async function() {
                await courseManager.addCourse(1, 5);
                await courseManager.addCourse(2, 10);

                await courseManager.rewardCoin(user1.address, 1);
                await courseManager.rewardCoin(user1.address, 2);

                expect(await courseManager.getUserCoins(user1.address, 1)).to.equal(1);
                expect(await courseManager.getUserCoins(user1.address, 2)).to.equal(1);
            });

            it("Should handle large course IDs", async function() {
                const largeCourseId = 999999;
                await courseManager.addCourse(largeCourseId, 1);
                await courseManager.rewardCoin(user1.address, largeCourseId);

                expect(await courseManager.getUserCoins(user1.address, largeCourseId)).to.equal(1);
            });
        });
    });
});