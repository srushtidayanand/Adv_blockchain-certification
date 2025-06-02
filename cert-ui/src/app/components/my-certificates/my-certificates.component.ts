import { Component, OnInit } from '@angular/core';
import { EthereumService } from '../../services/ethereum.service';
import { Certificate } from '../../models/certificate.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-my-certificates',
  templateUrl: './my-certificates.component.html',
  styleUrls: ['./my-certificates.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatIconModule
]
})
export class MyCertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  loading = true;
  showTransferForm = false;
  selectedCertificate: Certificate | null = null;
  transferForm: FormGroup;
  isTransferring = false;
  totalCertificates: number = 0;

  constructor(
    private ethereumService: EthereumService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.transferForm = this.fb.group({
      newOwner: ['', [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)]]
    });
  }

  ngOnInit() {
    this.loadCertificates();

    // Reload certificates when wallet changes
    this.ethereumService.accountAddress.subscribe(() => {
      this.loadCertificates();
    });

    this.totalCertificates = this.certificates.length
  }

  copyToClipboard(tokenId: string) {
    navigator.clipboard.writeText(tokenId).then(() => {
      this.snackBar.open('Certificate ID Copied to Clipboard!', 'Close', { duration: 3000 });
    });
  }
  

  async loadCertificates() {
    if (!this.ethereumService.isConnected.value) {
      this.certificates = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    try {
      const signerAddress = await this.ethereumService.getCurrentAddress();
      console.log(signerAddress)
      const allCertificates: Certificate[] = await this.ethereumService.getUserCertificates();
      this.certificates = allCertificates.filter(cert =>
        cert.issuedBy.toLowerCase() === signerAddress.toLowerCase()
      );
      console.log(this.certificates)
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      this.loading = false;
    }
  }
}