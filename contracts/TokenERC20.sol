// contracts/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TokenERC20 is ERC20, Ownable {
    constructor(string memory name_, string memory symbol_, uint256 initialSupply) ERC20(name_, symbol_) {
        _mint(_msgSender(), initialSupply);
    }

    function mint(uint256 amount) external onlyOwner {
        _mint(_msgSender(), amount);
    }
}