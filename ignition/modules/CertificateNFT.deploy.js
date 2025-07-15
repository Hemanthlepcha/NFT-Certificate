const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CourseCertificationModule", (m) => {
  const deployer = m.getAccount(0);

  // Deploy CertificateNFT with deployer as initial owner
  const certificateNFT = m.contract("CertificateNFT", [deployer]);

  // Deploy CourseManager with CertificateNFT address
  const courseManager = m.contract("CourseManager", [certificateNFT]);

  // Transfer ownership of CertificateNFT to CourseManager
  m.call(certificateNFT, "transferOwnership", [courseManager]);

  return { certificateNFT, courseManager };
});