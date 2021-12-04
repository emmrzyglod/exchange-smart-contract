pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

//TODO contract variables convention
// External calls at the end of functions
// Events for functions?
// Użyj safe math lib
contract Exchange is Ownable {

    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public price;

    using SafeMath for uint256;

    constructor(IERC20 tokenA_, IERC20 tokenB_, uint256 price_) {
        require(address(tokenA_) != address(0) && address(tokenB_) != address(0), "Token address cannot be zero address");
        updatePrice(price_);
        tokenA = tokenA_;
        tokenB = tokenB_;
    }

    function updatePrice(uint256 price_) public onlyOwner {
        require(price_ > 0, "Price have to be higher than 0");
        price = price_;
    }

    function deposit(IERC20 tokenAddress, uint256 amount) external onlyOwner {
        require(IERC20(tokenAddress).allowance(_msgSender(), address(this)) >= amount, "Insufficient balance");
        tokenAddress.transferFrom(_msgSender(), address(this), amount);
    }

    function exchange(IERC20 tokenAddress, uint256 amount) external {
        require(tokenAddress == tokenA || tokenAddress == tokenB, "Unpermitted token");
        
        IERC20 secondToken;
        uint256 exchangedAmount;

        if (tokenAddress == tokenA) {
            secondToken = tokenB;
            exchangedAmount = amount.div(price);
        } else {
            secondToken = tokenA;
            exchangedAmount = amount.mul(price);
        }

        require(tokenAddress.allowance(_msgSender(), address(this)) >= amount, "Invalid allowance balance");
        require(secondToken.balanceOf(address(this)) >= exchangedAmount, "Invalid contract balance");

        tokenAddress.transferFrom(_msgSender(), address(this), amount);
        secondToken.transfer(_msgSender(), exchangedAmount);
    }
}