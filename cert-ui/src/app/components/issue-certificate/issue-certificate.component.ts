import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { EthereumService } from '../../services/ethereum.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-issue-certificate',
  templateUrl: './issue-certificate.component.html',
  styleUrls: ['./issue-certificate.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class IssueCertificateComponent {
  certificateForm: FormGroup;
  isSubmitting = false;
  
  constructor(
    private fb: FormBuilder,
    private ethereumService: EthereumService,
    private snackBar: MatSnackBar
  ) {
    this.certificateForm = this.fb.group({
      recipientAddress: ['', [Validators.required, Validators.pattern(/^0x[a-fA-F0-9]{40}$/)]],
      name: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: [''],
      attributes: this.fb.array([])
    });
  }
  
  get attributesArray() {
    return this.certificateForm.get('attributes') as FormArray;
  }
  
  addAttribute() {
    const attributeGroup = this.fb.group({
      trait_type: ['', Validators.required],
      value: ['', Validators.required]
    });
    
    this.attributesArray.push(attributeGroup);
  }
  
  removeAttribute(index: number) {
    this.attributesArray.removeAt(index);
  }
  
  async onSubmit() {
    if (this.certificateForm.invalid) return;
    
    this.isSubmitting = true;
    
    try {
      const formValue = this.certificateForm.value;
      
      // Create metadata object
      const metadata = {
        name: formValue.name,
        description: formValue.description,
        image: formValue.imageUrl,
        attributes: formValue.attributes,
        issuedTo: formValue.recipientAddress,
        issuedBy: this.ethereumService.accountAddress.value,
        issuedDate: new Date().toISOString()
      };
      
      // Issue certificate directly with metadata
      const success = await this.ethereumService.issueCertificate(
        formValue.recipientAddress,
        metadata
      );
      
      if (success) {
        this.snackBar.open('Certificate issued successfully!', 'Close', { duration: 3000 });
        this.certificateForm.reset();
      } else {
        this.snackBar.open('2Failed to issue certificate', 'Close', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      this.snackBar.open('An error occurred', 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting = false;
    }
  }
}