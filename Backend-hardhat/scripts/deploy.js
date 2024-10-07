const hre = require("hardhat");

async function main() {
  console.log("Deploying BuyMeACoffee contract...");

  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  await buyMeACoffee.waitForDeployment();

  console.log("BuyMeACoffee deployed to:", await buyMeACoffee.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });