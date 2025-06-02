// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CertificateNFT is ERC721URIStorage {
    uint256 public nextTokenId;

    // Mapping token ID to original recipient
    mapping(uint256 => address) public issuedTo;

    constructor() ERC721("Decentralized Certificate", "DCERT") {}

    event CertificateMinted(address to, uint256 tokenId);

    function mintCertificate(address to, string memory tokenURI) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        issuedTo[tokenId] = to;
        nextTokenId++;
        emit CertificateMinted(to, tokenId);
        return tokenId;
    }

    function getIssuedTo(uint256 tokenId) external view returns (address) {
        return issuedTo[tokenId];
    }
}
