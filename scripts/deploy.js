// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
//vrfCoordinatorFamtom = 0xbd13f08b8352A3635218ab9418E340c60d6Eb418
//keyhash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
const hre = require("hardhat");
require("dotenv").config();

const PERCENT = 1;
const REWARD_AMOUNT = 1;
const gameSecretKey = ethers.utils.formatBytes32String(
  process.env.GAME_SECRET_KEY
);

const VRF_COORDINATOR_ADDRESS = process.env.MUMBAI_VRF_COORDINATOR;
const KEYHASH = process.env.MUMBAI_KEY_HASH;
const SUBSCRIPTION_ID = process.env.SUBSCRIPTION_ID;

async function main() {
  const StakingToken = await ethers.getContractFactory("TLCToken");
  const stakingToken = await StakingToken.deploy();
  console.log(
    "STAKING TOKEN HAS BEEN DEPLOYED TO ________",
    stakingToken.address
  );

  const StakingContract = await ethers.getContractFactory("Staking");
  const stakingContract = await StakingContract.deploy(stakingToken.address);
  console.log(
    "STAKING CONTRACT HAS BEEN DEPLOYED TO ________",
    stakingContract.address
  );

  const GameContract = await ethers.getContractFactory("GameContract");
  const gameContract = await GameContract.deploy(
    PERCENT,
    REWARD_AMOUNT,
    stakingToken.address,
    stakingContract.address,
    gameSecretKey
  );
  console.log(
    "GAME CONTRACT HAS BEEN DEPLOYED TO ________",
    gameContract.address
  );

  //we also want to give the game contract 95% of the token
  const send95PercentTo = await stakingToken.send95PercentTo(
    gameContract.address
  );
  console.log(
    "SUCCESSFULLY SENT 95 PERCENT , TXN HASH IS _____",
    send95PercentTo.hash
  );

  //optional : deployssss , deploy mock coordinator

  // const VrfCoordinatorV2Mock = await ethers.getContractFactory(
  //   "VRFCoordinatorV2Mock"
  // );
  // const vrfCoordinatorV2Mock = await VrfCoordinatorV2Mock.deploy(
  //   BASE_FEE,
  //   GAS_PRICE_LINK
  // );
  // //CREATE SUBSCRIPTION HERE
  // const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
  // const transactionReceipt = await transactionResponse.wait(1);
  // const subscriptionId = transactionReceipt.events[0].args.subId;

  // console.log("SuBSCription ID is __---", subscriptionId);

  // await vrfCoordinatorV2Mock.fundSubscription(
  //   subscriptionId,
  //   VRF_SUB_FUND_AMOUNT
  // );

  const VRFD20Contract = await ethers.getContractFactory("VRFD20");
  const vrfd20Contract = await VRFD20Contract.deploy(
    SUBSCRIPTION_ID,
    gameSecretKey,
    VRF_COORDINATOR_ADDRESS,
    KEYHASH
  );

  console.log(
    "vrfd20Contract was successfully deployed to _______",
    vrfd20Contract.address
  );

  // await vrfCoordinatorV2Mock.addConsumer(
  //   subscriptionId,
  //   vrfd20Contract.address
  // );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
