const { assert } = require('chai');

var utils = web3.utils;
const TokenERC20 = artifacts.require("TokenERC20");

require('truffle-test-utils').init();

require('chai').should();

contract('Exchange contract', accounts => {

    const totalSupply = utils.toBN(utils.toWei("2000", 'ether'));

    let tokenContract;

    beforeEach(async function () {
      tokenContract = await TokenERC20.new("Token", "TKN", totalSupply);
    });

    describe('Mintability', async () => {

      it("should abort when user is not owner", async () => {
    
        const user = accounts[1];
        const amount = utils.toBN(utils.toWei("50", 'ether'));
        
        try {
            await tokenContract.mint(amount, {from: user});
            throw "succeeded";
        }
        catch (error) {
            error.reason.should.equal("Ownable: caller is not the owner");
        }
      });

      it("should mint tokens, increase supply and assign tokens to owner account", async () => {

        const totalSupplyBeforeMint = await tokenContract.totalSupply();
        const amount = utils.toBN(utils.toWei("50", 'ether'));
        const supplyAfterMint = utils.toBN(utils.toWei("2050", 'ether'));

        await tokenContract.mint(amount);

        var totalSupplyAfterMint = await tokenContract.totalSupply();
        var ownerBalance = await tokenContract.balanceOf(accounts[0]);
        
        assert.isTrue(totalSupplyBeforeMint.eq(totalSupply));
        assert.isTrue(totalSupplyAfterMint.eq(supplyAfterMint));
        assert.isTrue(ownerBalance.eq(supplyAfterMint));
      });


    });

});