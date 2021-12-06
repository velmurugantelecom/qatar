import { Component, OnInit,Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormControlDirective, FormControlName } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert'
import { CoreService } from '../../core/services/core.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-manageprofile',
  templateUrl: './manageprofile.component.html',
  styleUrls: ['./manageprofile.component.scss']
})
export class ManageprofileComponent implements OnInit {
  profileForm: FormGroup;
  inputData: any = [];
  validation_messages: any = {};
  options: any = [];
  emailRequired: any;
  validEmail: any;
  mobileNumberRequired:any;
  mobileCodeRequired: any;
  public language: any;


  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private postService: CoreService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private service: CoreService) { }

  ngOnInit() {
    this.spinner.show();
    this.profileForm = this.formBuilder.group({
      firstName: [''],
      middleName: [''],
      lastName: [''],
      mobileCode: ['', [Validators.required]],
      mobileNo: ['', [Validators.required, Validators.minLength(7),
        Validators.maxLength(7), Validators.pattern(/^[0-9-+() ]*$/)]],
        email: ['', [Validators.required, Validators.email,Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });
    this.service.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
    });
    
    this.postService.getInputsDbsync(`insured/findByUserId`, '').subscribe((data: any) => {
      // this.postService.getInputs(`dbsync/user/find`, '').subscribe((data: any) => {
      this.inputData = data;
      this.profileForm.patchValue({
        firstName:  this.inputData.firstName,
        mobileCode: this.inputData.mobileCode,
        middleName: this.inputData.middleName,
        lastName: this.inputData.lastName,
        mobileNo: this.inputData.mobileNo,
        email: this.inputData.email
       
      });
     
    });
 //  
 this.spinner.hide();
  // this.translate.get('Required.EmailRequired') .subscribe(value => { 
  //   this.emailRequired = value; 
  // } );
  this.translate.get('Required.ValidEmail') .subscribe(value => { 
    this.validEmail = value; 
  } );
  this.translate.get('Required.MobileNumberRequired') .subscribe(value => { 
    this.mobileNumberRequired = value; 
  } );
  this.translate.get('Required.MobileCodeRequired') .subscribe(value => { 
    this.mobileCodeRequired = value; 
  } );
  this.language = localStorage.getItem("language");

  // this.validation_messages = {
  //   "email": [{ type: 'required', message:  this.emailRequired },
  //   { type: 'pattern', message: this.validEmail }],
  //   "mobileNo": [{ type: 'required', message: this.mobileNumberRequired }],
  //   "mobileCode": [{type: 'required', message: this.mobileCodeRequired}]
  // };
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  onSaveProfile() {
    if (this.profileForm.invalid) {
      return;
    }
    this.profileForm.value['email']=this.profileForm.value['email'].trim().toLowerCase();
    let dialogRef = this.dialog.open(ProfileUpdateDialog, {
      width: '450',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
      data: { data: this.profileForm.value, type: 'update profile' }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  onCancel() {
    this.router.navigate(['/User/dashboard']);
  }



}

  // dialoguecomponent
@Component({
  selector: 'ProfileUpdateDialog',
  templateUrl: './profileupdatedialog.html',
  styles: [`
 
.closeicon_css {
  position: relative;
  
  cursor: pointer;
}
  `]
})
export class ProfileUpdateDialog {
  dialogeDetails: any;
  public quoteForm: FormGroup;
  OtpForm: FormGroup;
  token: any;
  public minutes = 2;
  public profileUpdated:any;
  public seconds = 0;
  public totalMs;
  public doTimeout: boolean = false;
  public title = '';
  public otpInterval;

  constructor(
    private service: CoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ProfileUpdateDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private builder: FormBuilder,
  ) { }

  ngOnInit() {
    if (this.data.type === 'update profile') {
      this.translate.get('ProfileUpdate').subscribe(val => {
        this.title = val;
      });
    this.sendemail();
    } else {
      this.translate.get('ChangePassword').subscribe(val => {
        this.title = val;
      });
      this.changePasswordEmail()
    }
    this.OtpForm = this.builder.group({
      otp: ['', Validators.required]
    });
  }

  changePasswordEmail() {
    this.service.postInputs5('user/initPasswordChange', '').subscribe(response => {
      if (response) {
        this.token = response;
        this.minutes = 2;
        this.seconds = 0;
        this.totalMs = 120000;
        this.showTimer();
      }
    });
  }

  sendemail(){
    this.service.getInputs1(`user/confirmProfileUpdate`, '').subscribe(response => {
      if (response) {
        this.token = response;
        this.minutes = 2;
        this.seconds = 0;
        this.totalMs = 120000;
        this.showTimer();
      }
    });

  }

  verifyOtp() {
    if (this.OtpForm.status === 'INVALID')
    return;
    if (this.data.type === 'update profile') {
      
      this.service.getInputs3(`user/validateProfileOtp?token=${this.token}&otp=${this.OtpForm.value['otp']}`, '','').subscribe(response => {
        this.spinner.show();
        if (response == 'true') {
          this.dialogRef.close();
            let obj = {};
          obj = this.data.data;
          this.translate.get('ProfileUpdated') .subscribe(value => { 
            this.profileUpdated = value; 
          } );
          this.service.postInputs2('insured/update', obj, {}).subscribe((result: any) => {
            this.spinner.hide();
            swal(
              '', this.profileUpdated, 'success'
            );
            this.router.navigate(['/User/dashboard']);
          }, err => {
            this.spinner.hide();
          });
        } else if (response === 'false'){
          this.spinner.hide();
          swal('', 'Invalid OTP', 'error').then(val => {
            this.OtpForm.patchValue({
              'otp': ''
            });
          });

        } else {
          this.dialogRef.close(undefined);
        }
      });
    } else {
      this.spinner.show();
      this.service.getInputs3(`user/validateOtp?token=${this.token}&otp=${this.OtpForm.value['otp']}`, '','').subscribe(response => {
        this.spinner.hide();
        if (response === 'true') {
          this.dialogRef.close(this.token);
        } else if (response === 'false') {
          swal('', 'Invalid OTP', 'error').then(val => {
            this.OtpForm.patchValue({
              'otp': ''
            });
          });
        } else {
          this.dialogRef.close(undefined);
        }
      })
    }
  }

  showTimer() {
    this.otpInterval = setInterval(() => {
      if (this.totalMs >= 0) {
        this.minutes = Math.floor((this.totalMs % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((this.totalMs % (1000 * 60)) / 1000);
      }
      this.totalMs = this.totalMs - 1000;
      if (this.totalMs === 0) {
        this.doTimeout = true;
      }
    }, 1000)
  }

  stopTimer() {
    this.doTimeout = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  reSendOTP() {
    clearInterval(this.otpInterval);
    this.minutes = 2;
    this.seconds = 0;
    this.OtpForm.patchValue({
      otp: ''
    })
    if (this.data.type == 'update password') {
      this.changePasswordEmail();
    } else {
      this.sendemail();
    }
  }
}
