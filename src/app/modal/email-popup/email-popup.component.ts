import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CoreService } from 'src/app/core/services/core.service';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert';

@Component({
  selector: 'app-email-popup',
  templateUrl: './email-popup.component.html',
  styleUrls: ['./email-popup.component.scss']
})
export class EmailPopupComponent implements OnInit {

  emailForm: FormGroup;
  emailSuccessAlert: any;
  emailFailureAlert: any;

  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<any>,
    private coreService: CoreService,
    private translate: TranslateService) {

  }

  ngOnInit() {
    this.emailForm = this.formBuilder.group({
      email: [{ value: '', disabled: true }],
      radio: ['DFLT', Validators.required]
    });
  }

  sendMail() {
    if (this.emailForm.invalid) {
      return;
    } else {
      let emailId = this.emailForm.value.radio === 'OTHERS' ? this.emailForm.value.email.trim().toLowerCase() : this.data.mailId;
      let url;
      
      if (this.data.transactionType == 'P') {
        url = 'document/sendPolicyDoc?docs=' + this.data.selectedDocs + '&policyNo=' + this.data.docNo + '&toEmailAddr=' + emailId;
      } else if (this.data.transactionType == 'policysuccess') {
        url = 'document/emailPolicyDocs?policyId=' + this.data.policyId + '&policyNo=' + this.data.docNo + '&toEmailAddr=' + emailId;
      } else {
        url = 'quotes/sendquotes?quoteNumber=' + this.data.docNo + '&toEmailAddr=' + emailId;
      }
      this.translate.get('EmailSuccessAlert') .subscribe(value => { 
        this.emailSuccessAlert = value; 
      } );
      this.translate.get('EmailFailureAlert') .subscribe(value => { 
        this.emailFailureAlert = value; 
      } );

      this.coreService.getOptions(url).subscribe((result: any) => {
        if (result) {
          this.dialogRef.close();
          swal(
            '', this.emailSuccessAlert, 'success'
          );
        }
        else{
          this.dialogRef.close();
          swal(
            '', this.emailFailureAlert, 'error'
          );
        }
      });
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  selectOption(value) {
    if (value === 'DFLT') {
      this.emailForm.get('email').disable();
      this.emailForm.get('email').clearValidators();
      this.emailForm.patchValue({ 'email': '' });
      this.emailForm.get('email').updateValueAndValidity();
    } else {
      this.emailForm.get('email').enable();
      this.emailForm.get('email').setValidators([Validators.required, Validators.email, Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]);
      this.emailForm.get('email').updateValueAndValidity();
    }
  }
}
