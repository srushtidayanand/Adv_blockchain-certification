import { Routes } from '@angular/router';
import { WalletConnectorComponent } from './components/wallet-connector/wallet-connector.component';
import { VerifyCertificateComponent } from './components/verify-certificate/verify-certificate.component';
import { MyCertificatesComponent } from './components/my-certificates/my-certificates.component';
import { IssueCertificateComponent } from './components/issue-certificate/issue-certificate.component';

export const routes: Routes = [
    { path: '', component: WalletConnectorComponent }, // entry point
    { path: 'verify', component: VerifyCertificateComponent },
    { path: 'my-certificates', component: MyCertificatesComponent },
    { path: 'issue', component: IssueCertificateComponent },
    { path: '**', redirectTo: '' } // Wildcard route for a 404 page
  ];