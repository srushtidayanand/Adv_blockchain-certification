// src/app/components/wallet-connector/wallet-connector.component.ts
import { Component } from '@angular/core';
import { EthereumService } from '../../services/ethereum.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


@Component({
  selector: 'app-wallet-connector',
  templateUrl: './wallet-connector.component.html',
  styleUrls: ['./wallet-connector.component.css'],
  imports: [CommonModule, MatIconModule]
})
export class WalletConnectorComponent {
  isConnected$!: Observable<boolean>;
  accountAddress$!: Observable<string>;
  
  constructor(private ethereumService: EthereumService, private router: Router) {
    this.isConnected$ = this.ethereumService.isConnected;
    this.accountAddress$ = this.ethereumService.accountAddress;
  }

  async connectWallet() {
    await this.ethereumService.connectWallet();
  }

  async disconnectWallet() {
    await this.ethereumService.disconnectWallet();
  }

  async redirect() {
    this.router.navigate(["/my-certificates"])
  }
}