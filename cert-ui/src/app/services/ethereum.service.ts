import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { Certificate } from '../models/certificate.model';

interface ContractAddresses {
  certificateFactory: string;
  certificateNFT: string;
  issuerManager: string;
}

interface ContractABIs {
  certificateFactory: string[];
  certificateNFT: string[];
  issuerManager: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private certificateFactoryContract: ethers.Contract | null = null;


  private contractAddresses = {
    certificateFactory: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',  // Add your deployed contract address
    certificateNFT: '0x5FbDB2315678afecb367f032d93F642f64180aa3',      // Add your deployed contract address
    issuerManager: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'        // Add your deployed contract address
  };

  private contractABIs = {
    certificateFactory: [
      'function issueCertificate(address student, string memory uri) external',
      'function verifyCertificate(uint256 tokenId) public view returns (address currentOwner, string memory metadataURI, address originalRecipient)',
      'function transferCertificate(uint256 tokenId, address newOwner) external'
    ],
    certificateNFT: [
      'function nextTokenId() public view returns (uint256)',
      'function ownerOf(uint256 tokenId) public view returns (address)',
      'function tokenURI(uint256 tokenId) public view returns (string memory)',
      'function getIssuedTo(uint256 tokenId) external view returns (address)'
    ],
    issuerManager: [
      'function authorizeIssuer(address issuer) external',
      'function revokeIssuer(address issuer) external',
      'function isAuthorized(address issuer) public view returns (bool)',
      'function owner() view returns (address)'
    ]
  };

  public accountAddress = new BehaviorSubject<string>('');
  public isConnected = new BehaviorSubject<boolean>(false);
  public isIssuer = new BehaviorSubject<boolean>(false);
  public isOwner = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkConnection();
  }

  async checkConnection() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await this.connectWallet();
      }
    }
  }

  async connectWallet(): Promise<boolean> {
    if (window.ethereum) {
      try {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.provider.send('eth_requestAccounts', []);
        this.signer = this.provider.getSigner();
        const address = await this.signer.getAddress();
        this.accountAddress.next(address);
        this.isConnected.next(true);

        // Check if user is issuer
        await this.checkIssuerStatus(address);

        // Check if user is owner
        await this.checkOwnerStatus(address);

        return true;
      } catch (error) {
        console.error('Error connecting wallet:', error);
        this.isConnected.next(false);
        return false;
      }
    } else {
      console.log('Ethereum wallet not detected');
      return false;
    }
  }

  async disconnectWallet() {
    this.provider = null;
    this.signer = null;
    this.accountAddress.next('');
    this.isConnected.next(false);
    this.isIssuer.next(false);
    this.isOwner.next(false);
  }

  private async checkIssuerStatus(address: string) {
    try {
      const issuerManagerContract = new ethers.Contract(
        this.contractAddresses.issuerManager,
        this.contractABIs.issuerManager,
        this.provider!
      );
      const isIssuer = await issuerManagerContract.isAuthorized(address);
      this.isIssuer.next(isIssuer);
    } catch (error) {
      console.error('Error checking issuer status:', error);
      this.isIssuer.next(false);
    }
  }

  private async checkOwnerStatus(address: string) {
    try {
      const issuerManagerContract = new ethers.Contract(
        this.contractAddresses.issuerManager,
        this.contractABIs.issuerManager,
        this.provider!
      );
      const owner = await issuerManagerContract.owner();
      this.isOwner.next(address.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error('Error checking owner status:', error);
      this.isOwner.next(false);
    }
  }

  async issueCertificate(studentAddress: string, metadata: any): Promise<boolean> {
    if (!this.signer) return false;

    metadata.issuedTo = studentAddress;
    try {
      const metadataString = JSON.stringify(metadata);

      if (!this.certificateFactoryContract) {
        this.certificateFactoryContract = new ethers.Contract(
          this.contractAddresses.certificateFactory,
          this.contractABIs.certificateFactory,
          this.signer!
        );
      }
      const simulatedUri = `certificate:${Date.now()}`;

      const tx = await this.certificateFactoryContract.issueCertificate(studentAddress, simulatedUri);
      await tx.wait();
      console.log("String", metadataString)

      const response = await fetch('http://localhost:3001/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: metadataString
      });

      const data = await response.json();
      console.log('Saved metadata after transaction confirmation:', data);

      return true;

    } catch (error) {
      console.error('Failed to issue certificate:', error);
      return false;
    }
  }


  async verifyCertificate(certId: string): Promise<any> {
    const metadataUrl = `http://localhost:3001/api/certificates/${certId}`;
    const all_certificates_url = "http://localhost:3001/api/certificates"
  
    try {
      // 1. Fetch metadata from backend
      const metadataRes = await fetch(metadataUrl);
      if (!metadataRes.ok) {
        throw new Error('Certificate not found on backend');
      }
      const metadata = await metadataRes.json();
      console.log(metadata)

      const allCertRes = await fetch(all_certificates_url)
      if (!allCertRes.ok) {
        throw new Error('Certificates List not Found')
      }
      const allCertificates = await allCertRes.json()
  
      const matchingCert = allCertificates.find((cert: any) => cert.certId === certId);
      if (!matchingCert) {
        throw new Error('Certificate ID not found in certificates list');
      }
      // 4. Compare values
      const isValid =
        metadata.issuedTo.toLowerCase() === matchingCert.issuedTo.toLowerCase() &&
        metadata.issuedBy.toLowerCase() === matchingCert.issuedBy.toLowerCase();

      return {
        certId,
        isValid,
        metadata,
        expected: {
          issuedTo: matchingCert.issuedTo,
          issuedBy: matchingCert.issuedBy,
        },
      };
  
    } catch (err) {
      console.error('Error verifying certificate:', err);
      return null;
    }
  }
  
  async getCurrentAddress(): Promise<string> {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    return address;
  }


  async getUserCertificates(): Promise<Certificate[]> {

    if (!this.provider || !this.accountAddress.value) return [];

    try {
      const response = await fetch('http://localhost:3001/api/certificates');
      const certificates = await response.json();
      return certificates;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }

  async authorizeIssuer(issuerAddress: string): Promise<boolean> {
    if (!this.signer) return false;

    try {
      const issuerManagerContract = new ethers.Contract(
        this.contractAddresses.issuerManager,
        this.contractABIs.issuerManager,
        this.signer
      );

      const tx = await issuerManagerContract.authorizeIssuer(issuerAddress);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error authorizing issuer:', error);
      return false;
    }
  }

  async revokeIssuer(issuerAddress: string): Promise<boolean> {
    if (!this.signer) return false;

    try {
      const issuerManagerContract = new ethers.Contract(
        this.contractAddresses.issuerManager,
        this.contractABIs.issuerManager,
        this.signer
      );

      const tx = await issuerManagerContract.revokeIssuer(issuerAddress);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error revoking issuer:', error);
      return false;
    }
  }
}