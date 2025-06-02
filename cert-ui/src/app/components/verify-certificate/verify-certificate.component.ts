// src/app/components/verify-certificate/verify-certificate.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EthereumService } from '../../services/ethereum.service';
import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatInputModule, MatLabel } from '@angular/material/input';
import { ethers } from 'ethers';

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormField,
    MatLabel,
    MatError,
    ReactiveFormsModule,
    MatInputModule ]
})
export class VerifyCertificateComponent {
  verifyForm: FormGroup;
  isVerifying = false;
  certificate: any = null;
  hasSubmitted: boolean = false
  isInvalid: boolean = false
  
  constructor(
    private fb: FormBuilder,
    private ethereumService: EthereumService
  ) {
    this.verifyForm = this.fb.group({
      tokenId: ['', Validators.required]
    });
  }
  
  async onSubmit() {
    if (this.verifyForm.invalid) return;
  
    this.isVerifying = true;
    this.certificate = null;
    this.hasSubmitted = true;
    this.isInvalid = false;
  
    try {
      const certId = this.verifyForm.value.tokenId.toString();
      const result = await this.ethereumService.verifyCertificate(certId);
  
      if (result) {
        this.certificate = result;
        this.isInvalid = false; // Valid cert
      } else {
        this.isInvalid = true; // Cert not found
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      this.isInvalid = true; // Error = invalid
    } finally {
      this.isVerifying = false;
    }
  }
}