# NFT-Certificate

This project demostrates the usage of blockchain to manage the online course and rewarding the NFT based certificate after the completion of course

Try running some of the following tasks:
### For frontend DApp:
```shell
git clone <repo url>
cd NFT-Certificate/frontend/course-plateform
npm install
```
### For blockchain part(locally  deploy it in localhost/ can use testnet too):
#### Deploy locally
```shell
npx hardhat node 
```
##### 🔍 What it does:
  1. Starts a local in-memory blockchain (similar to Ganache).
  2. Automatically generates accounts (usually 20) with pre-funded ETH (usually 10,000 ETH each).
  3. Provides a local JSON-RPC endpoint (usually at http://127.0.0.1:8545) that your smart contracts and dApps can connect to.
  4. Logs all transactions, blocks, and events in the terminal.

```shell
npx hardhat run scripts/deploy.js --network localhost
```
Here the deploy.js file contains all the deployment logics and here I chose localhost to deploy (--network)

```shell
npx hardhat run scripts/quickSetup.js --network localhost
```
This sets up the all courses and rules

