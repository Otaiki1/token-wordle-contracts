const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const PERCENT = 1;
const PSK = ethers.utils.toUtf8Bytes("playedsecretkey"); //played secret key
const WSK = ethers.utils.toUtf8Bytes("wonsecretkey"); //won secret key

describe("Full Wordle Test", function () {
  //deploy staking token
  //deploy our staking contract and ensure it takes an instance of the staked token
  //mint and transfer a bulk of the staking token to the Staking cntract

  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const StakingToken = await ethers.getContractFactory("TLCToken");
    const stakingToken = await StakingToken.deploy();
    console.log(
      "STAKING TOKEN HAS BEEN DEPLOYED TO ________",
      stakingToken.address
    );

    const GameContract = await ethers.getContractFactory("GameContract");
    const gameContract = await GameContract.deploy(
      PERCENT,
      stakingToken.address,
      PSK,
      WSK
    );
    console.log(
      "GAME CONTRACT HAS BEEN DEPLOYED TO ________",
      gameContract.address
    );

    const StakingContract = await ethers.getContractFactory("Staking");
    const stakingContract = await StakingContract.deploy(
      stakingToken.address,
      gameContract.address
    );
    console.log(
      "STAKING CONTRACT HAS BEEN DEPLOYED TO ________",
      stakingContract.address
    );

    return { gameContract, stakingContract, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right state variables", async function () {
      await loadFixture(deployOneYearLockFixture);
    });

    //   it("Should set the right owner", async function () {
    //     const { lock, owner } = await loadFixture(deployOneYearLockFixture);

    //     expect(await lock.owner()).to.equal(owner.address);
    //   });

    //   it("Should receive and store the funds to lock", async function () {
    //     const { lock, lockedAmount } = await loadFixture(
    //       deployOneYearLockFixture
    //     );

    //     expect(await ethers.provider.getBalance(lock.address)).to.equal(
    //       lockedAmount
    //     );
    //   });

    //   it("Should fail if the unlockTime is not in the future", async function () {
    //     // We don't use the fixture here because we want a different deployment
    //     const latestTime = await time.latest();
    //     const Lock = await ethers.getContractFactory("Lock");
    //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //       "Unlock time should be in the future"
    //     );
    //   });
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
