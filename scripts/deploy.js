const hre = require("hardhat");

async function main() {
    // 1. Deploy CertificateNFT
    const CertificateNFT = await hre.ethers.getContractFactory("CertificateNFT");
    const certificateNFT = await CertificateNFT.deploy();
    await certificateNFT.deployed();
    console.log(`CertificateNFT deployed at: ${certificateNFT.address}`);

    // 2. Deploy IssuerManager
    const IssuerManager = await hre.ethers.getContractFactory("IssuerManager");
    const issuerManager = await IssuerManager.deploy();
    await issuerManager.deployed();
    console.log(`IssuerManager deployed at: ${issuerManager.address}`);

    // 3. Deploy CertificateFactory with CertificateNFT address
    const CertificateFactory = await hre.ethers.getContractFactory("CertificateFactory");
    const certificateFactory = await CertificateFactory.deploy(certificateNFT.address);
    await certificateFactory.deployed();
    console.log(`CertificateFactory deployed at: ${certificateFactory.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
