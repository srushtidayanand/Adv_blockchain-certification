// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IssuerManager {
    address public owner;
    mapping(address => bool) public authorizedIssuers;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    function authorizeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = true;
    }

    function revokeIssuer(address issuer) external onlyOwner {
        authorizedIssuers[issuer] = false;
    }

    function isAuthorized(address issuer) public view returns (bool) {
        return authorizedIssuers[issuer];
    }
}
