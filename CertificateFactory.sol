// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CertificateNFT.sol";
import "./IssuerManager.sol";

contract CertificateFactory is IssuerManager {
    CertificateNFT public certificateNFT;

    constructor(address _certificateNFTAddress) {
    certificateNFT = CertificateNFT(_certificateNFTAddress);
    authorizedIssuers[msg.sender] = true;
    }

    function issueCertificate(address student, string memory uri) external onlyIssuer {
        certificateNFT.mintCertificate(student, uri);
    }

    function verifyCertificate(uint256 tokenId) public view returns (
        address currentOwner,
        string memory metadataURI,
        address originalRecipient
    ) {
        currentOwner = certificateNFT.ownerOf(tokenId);
        metadataURI = certificateNFT.tokenURI(tokenId);
        originalRecipient = certificateNFT.getIssuedTo(tokenId);
    }

    function transferCertificate(uint256 tokenId, address newOwner) external {
        require(certificateNFT.ownerOf(tokenId) == msg.sender, "Not certificate owner");
        certificateNFT.transferFrom(msg.sender, newOwner, tokenId);
    }
}