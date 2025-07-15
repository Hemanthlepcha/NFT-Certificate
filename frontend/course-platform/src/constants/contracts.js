export const CONTRACT_ADDRESSES = {
  courseManager: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  certificateNFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
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
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function owner() view returns (address)",
  "function totalSupply() view returns (uint256)",
  
  // Write functions
  "function mintCertificate(address recipient, string tokenURI) external returns (uint256)",
  "function transferOwnership(address newOwner) external",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
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