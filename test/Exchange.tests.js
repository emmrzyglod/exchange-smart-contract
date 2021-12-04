const { assert } = require('chai');

var utils = web3.utils;
const TokenERC20 = artifacts.require("TokenERC20");
const Exchange = artifacts.require("Exchange");

require('truffle-test-utils').init();

require('chai').should();

contract('Exchange contract', accounts => {

    const totalSupplyA = utils.toBN(utils.toWei("180000000", 'ether'));
    const totalSupplyB = utils.toBN(utils.toWei("360000000", 'ether'));

    const initialPrice = utils.toBN(10);

    let tokenAContract;
    let tokenBContract;
    let exchangeContract;

    beforeEach(async function () {
      tokenAContract = await TokenERC20.new("TokenA", "TKA", totalSupplyA);
      tokenBContract = await TokenERC20.new("TokenB", "TKB", totalSupplyB);
      exchangeContract = await Exchange.new(tokenAContract.address, tokenBContract.address, initialPrice);
    });

    describe('Exchange tokens', async () => {

      it("should abort update price by user", async () => {
    
        const user = accounts[1];
        const newPrice = utils.toBN(20);
        
        try {
            await exchangeContract.updatePrice(newPrice, {from: user});
            throw "succeeded";
        }
        catch (error) {
            error.reason.should.equal("Ownable: caller is not the owner");
        }
      });

      it("should abort deposit by user", async () => {
    
        const user = accounts[1];
        const depositAmount = utils.toBN(20);
        
        try {
            await exchangeContract.deposit(tokenAContract.address, depositAmount, {from: user});
            throw "succeeded";
        }
        catch (error) {
            error.reason.should.equal("Ownable: caller is not the owner");
        }
      });

      it("should abort deposit when not enough allowed tokens", async () => {
        const depositAmount = utils.toBN(100000);
        const allowanceAmount = utils.toBN(99000);
        
        await tokenAContract.approve(exchangeContract.address, allowanceAmount);

        try {
            await exchangeContract.deposit(tokenAContract.address, depositAmount);
            throw "succeeded";
        } 
        catch (error) {
            error.reason.should.equal("Insufficient balance");
        }
      });

      it("should abort deposit for invalid token address", async () => {
        const depositAmount = utils.toBN(100000);
        
        const otherTokenContract = await TokenERC20.new("TokenC", "TKC", depositAmount);

        try {
            await exchangeContract.deposit(otherTokenContract.address, depositAmount);
            throw "succeeded";
        } 
        catch (error) {
            error.reason.should.equal("Unpermitted token");
        }
      });

      it("should abort exchange for invalid token address", async () => {
        const depositAmount = utils.toBN(100000);
        
        const otherTokenContract = await TokenERC20.new("TokenC", "TKC", depositAmount);

        try {
            await exchangeContract.exchange(otherTokenContract.address, depositAmount);
            throw "succeeded";
        } 
        catch (error) {
            error.reason.should.equal("Unpermitted token");
        }
      });

      it("should assign deposited tokens to contract address", async () => {

        const depositAmount = utils.toBN(100000);
        
        await tokenAContract.approve(exchangeContract.address, depositAmount);
        await exchangeContract.deposit(tokenAContract.address, depositAmount);

        var depositedBalance = await tokenAContract.balanceOf(exchangeContract.address);
        assert.isTrue(depositedBalance.eq(depositAmount));
      });

      it("should transfer to user proper value of tokens", async () => {
        
        const user = accounts[1];
        const res = await tokenAContract.approve(exchangeContract.address, totalSupplyA.div(utils.toBN(2)));
        
        await tokenBContract.approve(exchangeContract.address, totalSupplyB.div(utils.toBN(2)));

        await exchangeContract.deposit(tokenBContract.address, totalSupplyB.div(utils.toBN(4)));

        await tokenAContract.transfer(user, totalSupplyA.div(utils.toBN(4)));

        const userApprove = utils.toBN(1000);

        await tokenAContract.approve(exchangeContract.address, userApprove, {from: user});

        await exchangeContract.exchange(tokenAContract.address, userApprove, {from: user});
        const tokenBalance = await tokenBContract.balanceOf(user);
        
        assert.isTrue(tokenBalance.eq(utils.toBN(100)));
      });

      it("should update price by owner", async () => {
        
        const newPrice = utils.toBN(20);
        const priceBeforeChange = await exchangeContract.price();
        
        await exchangeContract.updatePrice(newPrice);
        
        const priceAfterChange = await exchangeContract.price();

        assert.isTrue(priceBeforeChange.eq(initialPrice));
        assert.isTrue(priceAfterChange.eq(newPrice));
      });

    });

});