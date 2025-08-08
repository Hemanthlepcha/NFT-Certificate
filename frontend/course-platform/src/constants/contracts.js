export const CONTRACT_ADDRESSES = {
  courseManager: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  certificateNFT: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
};

export const COURSE_MANAGER_ABI = [
  // View functions
  "function getUserCoins(address user, uint256 courseId) view returns (uint256)",
  "function canClaimCertificate(address user, uint256 courseId) view returns (bool)",
  "function hasReceivedCertificate(address user, uint256 courseId) view returns (bool)",
  "function courses(uint256 courseId) view returns (uint256 minCoinsRequired, bool exists)",
  "function owner() view returns (address)",
  "function certificate() view returns (address)",

  // Write functions
  "function addCourse(uint256 courseId, uint256 minCoinsRequired) external",
  "function rewardCoin(address user, uint256 courseId, bool isCorrect) external",
  "function claimCertificate(uint256 courseId, string tokenURI) external",

  // Events
  "event CourseAdded(uint256 indexed courseId, uint256 minCoinsRequired)",
  "event CoinRewarded(address indexed user, uint256 indexed courseId, uint256 newCoinCount)",
  "event CertificateMinted(address indexed user, uint256 indexed courseId, uint256 tokenId)"
];

export const CERTIFICATE_NFT_ABI = [
  // View functions
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function owner() view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",

  // Write functions
  "function mintCertificate(address recipient, string tokenURI) external returns (uint256)",
  "function transferOwnership(address newOwner) external",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId) external",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data) external",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
];

export const SUPPORTED_NETWORKS = {
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545"
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
  },
  polygon: {
    chainId: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com"
  }
};

export const DEFAULT_NETWORK = "localhost";