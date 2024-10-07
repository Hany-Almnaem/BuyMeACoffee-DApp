/*
const { ethers } = require("hardhat");

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();
  
  // Replace with your deployed contract's address.
  const contractAddress = "0x48F1b7876257e5026Ee9B95aCF0a06bE51a76904";
  const BuyMeACoffee = await ethers.getContractAt("BuyMeACoffee", contractAddress);

  const addresses = [owner.address, tipper.address, BuyMeACoffee.address];
  console.log("== start ==");
  await printBalances(addresses);

  const tip = { value: ethers.utils.parseEther("1") };
  await BuyMeACoffee.connect(tipper).buyCoffee("Carolina", "You're the best!", tip);
  await BuyMeACoffee.connect(tipper2).buyCoffee("Vitto", "Amazing teacher", tip);
  await BuyMeACoffee.connect(tipper3).buyCoffee("Kay", "I love my Proof of Knowledge", tip);

  console.log("== bought coffee ==");
  await printBalances(addresses);

  await BuyMeACoffee.connect(owner).withdrawFunds();

  console.log("== withdrawFunds ==");
  await printBalances(addresses);

  const memos = await BuyMeACoffee.getMemos();
  console.log("== memos ==");
  printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
  */
  const { ethers } = require("hardhat");

async function main() {
  // Get the list of test accounts
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();

  // Deploy the BuyMeACoffee contract
  const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");

  console.log("Deploying BuyMeACoffee contract...");

  // Deploy the contract
  const buyMeACoffee = await BuyMeACoffee.deploy();

  // Wait for the contract to be deployed and get its address
  await buyMeACoffee.waitForDeployment();
  const contractAddress = await buyMeACoffee.getAddress();

  console.log("BuyMeACoffee deployed to:", contractAddress);

  // Check balances before the coffee purchase
  const addresses = [owner.address, tipper.address, contractAddress];
  console.log("== start ==");
  await printBalances(addresses);

  // Buy a few coffees
  const tip = { value: ethers.parseEther("1") };
  await buyMeACoffee.connect(tipper).buyCoffee("Carolina", "You're the best!", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Vitto", "Amazing teacher", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Kay", "I love my Proof of Knowledge", tip);

  // Check balances after coffee purchase
  console.log("== bought coffee ==");
  await printBalances(addresses);

  // Withdraw funds
  await buyMeACoffee.connect(owner).withdrawFunds();

  // Check balances after withdrawal
  console.log("== withdrawFunds ==");
  await printBalances(addresses);

  // Read all the memos left for the owner
  console.log("== memos ==");
  try {
    const memos = await buyMeACoffee.getAllMemos();
    printMemos(memos);
  } catch (error) {
    console.error("Error getting memos:", error.message);
    console.log("Please check your contract for the correct function to retrieve memos.");
  }
}


// Helper functions
async function printBalances(addresses) {
  for (const address of addresses) {
    const balance = await ethers.provider.getBalance(address);
    console.log(`${address} balance: ${ethers.formatEther(balance)}`);
  }
}

function printMemos(memos) {
  for (const memo of memos) {
    console.log(`At ${memo.timestamp}, ${memo.name} (${memo.from}) said: "${memo.message}"`);
  }
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });