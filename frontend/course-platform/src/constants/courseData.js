// src/constants/courseData.js

export const COURSES_DATA = [
  {
    id: 1,
    title: "Blockchain Fundamentals",
    description: "Learn the core concepts of blockchain technology, cryptocurrency, and decentralized systems.",
    category: "Beginner",
    duration: "2 hours",
    pdfUrl: "https://www.ibm.com/think/topics/blockchain#:~:text=Blockchain%20is%20a%20shared%2C%20immutable,making%20it%20resistant%20to%20tampering.",
    minCoinsRequired: 5,
    totalQuestions: 5,
    content: {
      overview: "This course introduces you to the revolutionary world of blockchain technology. You'll learn about distributed ledgers, consensus mechanisms, and the foundational concepts that power cryptocurrencies and smart contracts.",
      topics: [
        "What is Blockchain?",
        "Decentralization vs Centralization", 
        "Cryptographic Hashing",
        "Consensus Mechanisms",
        "Real-world Applications"
      ]
    },
    quiz: [
      {
        id: 1,
        question: "What is a blockchain?",
        options: [
          "A traditional database stored on one server",
          "A distributed ledger maintained by a network of computers",
          "A type of cryptocurrency",
          "A programming language"
        ],
        correct: 1,
        explanation: "A blockchain is a distributed ledger that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography."
      },
      {
        id: 2,
        question: "Who created Bitcoin, the first successful cryptocurrency?",
        options: [
          "Vitalik Buterin",
          "Satoshi Nakamoto", 
          "Bill Gates",
          "Elon Musk"
        ],
        correct: 1,
        explanation: "Bitcoin was created by an anonymous person or group of people using the name Satoshi Nakamoto."
      },
      {
        id: 3,
        question: "What is the primary purpose of mining in blockchain networks?",
        options: [
          "To create new cryptocurrencies from nothing",
          "To validate transactions and secure the network",
          "To store data on the internet",
          "To trade cryptocurrencies"
        ],
        correct: 1,
        explanation: "Mining involves using computational power to validate transactions, secure the network, and maintain the blockchain's integrity."
      },
      {
        id: 4,
        question: "What is a smart contract?",
        options: [
          "A legal document written by lawyers",
          "Self-executing code with terms directly written into code",
          "A mobile application for trading",
          "A type of cryptocurrency wallet"
        ],
        correct: 1,
        explanation: "Smart contracts are self-executing contracts where the terms of agreement are directly written into lines of code."
      },
      {
        id: 5,
        question: "What does DeFi stand for?",
        options: [
          "Digital Finance",
          "Decentralized Finance",
          "Definite Finance", 
          "Default Finance"
        ],
        correct: 1,
        explanation: "DeFi stands for Decentralized Finance, which refers to financial services built on blockchain technology."
      }
    ]
  },
  {
    id: 2,
    title: "Smart Contracts Development",
    description: "Deep dive into smart contract development using Solidity and Ethereum ecosystem.",
    category: "Intermediate",
    duration: "4 hours",
    pdfUrl: "https://www.coursera.org/learn/smarter-contracts/paidmedia?utm_medium=sem&utm_source=gg&utm_campaign=b2c_apac_x_multi_ftcof_career-academy_cx_dr_bau_gg_pmax_pr_s4_en_m_hyb_25-04_x&campaignid=22414226136&adgroupid=&device=c&keyword=&matchtype=&network=x&devicemodel=&creativeid=&assetgroupid=6566457651&targetid=&extensionid=&placement=&gad_source=1&gad_campaignid=22424344717&gbraid=0AAAAADdKX6b1XYBgSPtWshNBvPzX-5tGB&gclid=Cj0KCQjw1JjDBhDjARIsABlM2Sv5hBBcun9zn79uAsFdoQQovOvH08ZK7nxcdTq2i9d2g9GmGPUeveQaAhZsEALw_wcB",
    minCoinsRequired: 8,
    totalQuestions: 8,
    content: {
      overview: "Master the art of smart contract development. This course covers Solidity programming, deployment strategies, security best practices, and interaction with decentralized applications.",
      topics: [
        "Solidity Basics",
        "Contract Structure",
        "State Variables and Functions",
        "Events and Modifiers",
        "Security Best Practices",
        "Testing and Deployment",
        "Gas Optimization",
        "DApp Integration"
      ]
    },
    quiz: [
      {
        id: 1,
        question: "Which programming language is primarily used for Ethereum smart contracts?",
        options: [
          "JavaScript",
          "Python",
          "Solidity",
          "Java"
        ],
        correct: 2,
        explanation: "Solidity is the primary programming language for writing smart contracts on the Ethereum blockchain."
      },
      {
        id: 2,
        question: "Who created Ethereum?",
        options: [
          "Satoshi Nakamoto",
          "Vitalik Buterin",
          "Charlie Lee",
          "Roger Ver"
        ],
        correct: 1,
        explanation: "Ethereum was proposed by Vitalik Buterin in 2013 and development began in 2014."
      },
      {
        id: 3,
        question: "What is gas in the context of Ethereum?",
        options: [
          "A type of cryptocurrency",
          "The fee required to execute transactions and smart contracts",
          "A consensus algorithm",
          "A type of wallet"
        ],
        correct: 1,
        explanation: "Gas is the fee required to conduct a transaction or execute a smart contract on the Ethereum blockchain."
      },
      {
        id: 4,
        question: "Which keyword is used to declare a state variable that cannot be changed?",
        options: [
          "constant",
          "immutable",
          "final", 
          "static"
        ],
        correct: 1,
        explanation: "The 'immutable' keyword is used for state variables that can be assigned once during construction and cannot be changed afterward."
      },
      {
        id: 5,
        question: "What is the purpose of the 'require' statement in Solidity?",
        options: [
          "To import external libraries",
          "To validate conditions and revert if they fail",
          "To declare variables",
          "To emit events"
        ],
        correct: 1,
        explanation: "The 'require' statement is used to validate conditions and automatically revert the transaction if the condition fails."
      },
      {
        id: 6,
        question: "Which modifier restricts function access to the contract owner only?",
        options: [
          "onlyOwner",
          "private",
          "internal",
          "restricted"
        ],
        correct: 0,
        explanation: "The 'onlyOwner' modifier is commonly used to restrict function access to the contract owner only."
      },
      {
        id: 7,
        question: "What is the maximum size limit for smart contracts on Ethereum?",
        options: [
          "24 KB",
          "32 KB", 
          "48 KB",
          "64 KB"
        ],
        correct: 0,
        explanation: "Smart contracts on Ethereum have a size limit of 24 KB (24,576 bytes) after EIP-170."
      },
      {
        id: 8,
        question: "Which tool is commonly used for testing smart contracts?",
        options: [
          "Truffle",
          "Hardhat",
          "Ganache",
          "All of the above"
        ],
        correct: 3,
        explanation: "Truffle, Hardhat, and Ganache are all popular tools used in the smart contract development and testing ecosystem."
      }
    ]
  },
  {
    id: 3,
    title: "DeFi Protocols & Yield Farming",
    description: "Explore decentralized finance protocols, liquidity provision, and yield farming strategies.",
    category: "Advanced", 
    duration: "3 hours",
    pdfUrl: "https://cryptomus.com/blog/what-is-defi-staking?gad_source=1&gad_campaignid=22686502681&gbraid=0AAAAA-VBmJlxbV2XDP1al3r70viigG5kJ&gclid=Cj0KCQjw1JjDBhDjARIsABlM2SvN8Vfm1Dfgq5WT4xC8sB8vEAJQF7P5qto0bIo7WMnYej0Ssk7rHSwaAi0uEALw_wcB",
    minCoinsRequired: 10,
    totalQuestions: 6,
    content: {
      overview: "Dive deep into the DeFi ecosystem. Learn about automated market makers, liquidity pools, yield farming, and the risks and opportunities in decentralized finance.",
      topics: [
        "AMM Protocols (Uniswap, SushiSwap)",
        "Lending Protocols (Aave, Compound)",
        "Liquidity Mining",
        "Yield Farming Strategies",
        "Impermanent Loss",
        "Risk Management in DeFi"
      ]
    },
    quiz: [
      {
        id: 1,
        question: "What does AMM stand for in DeFi?",
        options: [
          "Automated Money Machine",
          "Automated Market Maker",
          "Advanced Mining Mechanism",
          "Automated Monetary Management"
        ],
        correct: 1,
        explanation: "AMM stands for Automated Market Maker, which are smart contracts that create liquidity pools for decentralized trading."
      },
      {
        id: 2,
        question: "What is impermanent loss?",
        options: [
          "A permanent loss of funds in DeFi protocols",
          "The difference in value between holding tokens vs providing liquidity",
          "Transaction fees on the blockchain", 
          "A type of smart contract bug"
        ],
        correct: 1,
        explanation: "Impermanent loss is the temporary loss of funds experienced by liquidity providers due to volatility in the trading pair."
      },
      {
        id: 3,
        question: "Which protocol pioneered the AMM model?",
        options: [
          "SushiSwap",
          "PancakeSwap",
          "Uniswap",
          "Balancer"
        ],
        correct: 2,
        explanation: "Uniswap was the first major protocol to successfully implement the AMM model for decentralized trading."
      },
      {
        id: 4,
        question: "What is yield farming?",
        options: [
          "Growing crops using blockchain technology",
          "Providing liquidity to earn rewards and incentives",
          "Mining cryptocurrency with farming equipment",
          "A type of NFT marketplace"
        ],
        correct: 1,
        explanation: "Yield farming involves providing liquidity to DeFi protocols in exchange for rewards, often in the form of additional tokens."
      },
      {
        id: 5,
        question: "What is TVL in DeFi?",
        options: [
          "Total Value Lost",
          "Total Volume Locked",
          "Total Value Locked",
          "Total Volatile Leverage"
        ],
        correct: 2,
        explanation: "TVL stands for Total Value Locked, which measures the total amount of assets deposited in a DeFi protocol."
      },
      {
        id: 6,
        question: "Which token standard is most commonly used for DeFi tokens on Ethereum?",
        options: [
          "ERC-721",
          "ERC-20",
          "ERC-1155",
          "ERC-777"
        ],
        correct: 1,
        explanation: "ERC-20 is the standard for fungible tokens and is most commonly used for DeFi tokens on Ethereum."
      }
    ]
  }
];

// Course categories for filtering
export const COURSE_CATEGORIES = [
  "All",
  "Beginner", 
  "Intermediate",
  "Advanced"
];

// Achievement levels based on completed courses
export const ACHIEVEMENT_LEVELS = {
  NEWCOMER: { min: 0, max: 0, title: "Newcomer", icon: "🌱" },
  LEARNER: { min: 1, max: 1, title: "Blockchain Learner", icon: "📚" },
  DEVELOPER: { min: 2, max: 2, title: "Smart Contract Developer", icon: "💻" },
  EXPERT: { min: 3, max: 3, title: "DeFi Expert", icon: "🏆" }
};