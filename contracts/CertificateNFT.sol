// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    constructor(address initialOwner) ERC721("CourseCertificate", "CERT") Ownable(initialOwner) {}

    function mintCertificate(address recipient, string memory tokenURI)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;

        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }
}