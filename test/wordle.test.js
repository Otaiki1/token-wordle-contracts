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

  async function deployAllContracts() {
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

    //we also want to give the staking contract 95% of the token
    const send95PercentTo = await stakingToken.send95PercentTo(
      stakingContract.address
    );
    console.log(
      "SUCCESSFULLY SENT 95 PERCENT , TXN HASH IS _____",
      send95PercentTo.hash
    );

    return { gameContract, stakingContract, stakingToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("All deployments should work the right way ", async function () {
      await loadFixture(deployAllContracts);
    });
  });

  describe("Staking Functionalities", async () => {
    it("should ensure staking contract has all state variables initialized properly", async () => {
      const { stakingContract, stakingToken, owner, otherAccount } =
        await loadFixture(deployAllContracts);

      const stakingContractBalance = await stakingToken.balanceOf(
        stakingContract.address
      );
      expect(stakingContractBalance).to.eq(95000000);
      console.log("the stake contract has 95% of total token supply");
      expect(await stakingContract.s_totalSupply()).to.eq(0);
      console.log("Staking contract has 0 balance");
      expect(await stakingContract.getStaked(owner.address)).to.eq(0);
      console.log("users balances are initialized properly");
    });

    it("should allow user stake ", async () => {
      const { stakingContract, stakingToken, owner, otherAccount } =
        await loadFixture(deployAllContracts);

      const ownerBalanceBeforeStaking = await stakingToken.balanceOf(
        owner.address
      );
      //   console.log(ownerBalanceBeforeStaking);
      //approve allowance
      await stakingToken.approve(stakingContract.address, 10);
      await stakingContract.stake(10);
      const ownerBalanceAfterStaking = await stakingToken.balanceOf(
        owner.address
      );
      expect(ownerBalanceAfterStaking.toNumber()).to.be.lt(
        ownerBalanceBeforeStaking.toNumber()
      );
      console.log("user balance changed successfully");

      expect(await stakingContract.getStaked(owner.address)).to.eq(10);
      console.log("user balance updated in state variable");

      expect(await stakingContract.s_totalSupply()).to.eq(10);
      console.log("total supply updated successfully");

      //   console.log(ownerBalanceAfterStaking);
    });

    it("should allow user withdraw stake", async () => {
      const { stakingContract, stakingToken, owner, otherAccount } =
        await loadFixture(deployAllContracts);

      const ownerBalanceBeforeStaking = await stakingToken.balanceOf(
        owner.address
      );
      //approve allowance
      await stakingToken.approve(stakingContract.address, 10);
      await stakingContract.stake(10);
      // withdraw staked
      await stakingContract.withdrawStaked(10);

      const ownerBalanceAfterWithdrawing = await stakingToken.balanceOf(
        owner.address
      );

      expect(ownerBalanceAfterWithdrawing.toNumber()).to.eq(
        ownerBalanceBeforeStaking.toNumber()
      );
      console.log("Withdraw Successful");

      expect(await stakingContract.getStaked(owner.address)).to.eq(0);
      console.log("user balance updated in state variable");

      expect(await stakingContract.s_totalSupply()).to.eq(0);
      console.log("total supply updated successfully");

      //   console.log(ownerBalanceAfterStaking);
    });
    it("Should emit the right events for all stake cases", async () => {
      const { stakingContract, stakingToken, owner, otherAccount } =
        await loadFixture(deployAllContracts);

      //approve allowance
      await stakingToken.approve(stakingContract.address, 10);
      expect(await stakingContract.stake(10))
        .to.emit(stakingContract, "Staked")
        .withArgs(owner.address, 10);
      // withdraw staked
      expect(await stakingContract.withdrawStaked(10))
        .to.emit(stakingContract, "StakeWithdrawn")
        .withArgs(owner.address, 10);
    });
  });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployAllContracts
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
  //         deployAllContracts
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployAllContracts
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
  //         deployAllContracts
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
