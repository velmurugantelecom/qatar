import { Component, OnInit, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { CoreService } from '../core/services/core.service';
import { AuthService } from '../core/services/auth.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import * as _moment from "moment";
const moment = _moment;
import swal from 'sweetalert'
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { MessagePopupComponent } from 'src/app/modal/message-popup/message-popup.component';
import { MatDialog, MatStepper, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from 'src/app/core/services/data.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
import { AppService } from '../core/services/app.service';
import { TranslateService } from '@ngx-translate/core';
import { MediaObserver } from '@angular/flex-layout';
import { ThrowStmt } from '@angular/compiler';

function confirmPassword(control: AbstractControl) {
  if (!control.parent || !control) {
    return;
  }
  if (control.parent.get('password').value !== control.parent.get('confirmPassword').value) {
    return {
      passwordsNotMatch: true
    };
  }
}

@Component({
  selector: 'app-login1',
  templateUrl: './login1.component.html',
  styleUrls: ['./login1.component.scss']
})
export class NewLoginScreen implements OnInit, OnDestroy {

  public formType: string = 'login';
  public LoginForm: FormGroup;
  public infoForm: FormGroup;
  public ForgotForm: FormGroup;
  public OtpForm: FormGroup;
  public PasswordForm: FormGroup
  public showPassword = false;
  public autoDataURL = '';
  public invalidChassisNo: boolean;
  public invalidEmail: boolean;
  public radioError: boolean;
  public options: any = {};
  public isRevisedDetail: boolean;
  public isResetLinkSend: boolean;
  public PwdSopList = [];
  public routerToken: any;
  public routerTokenType: any;
  public minutes = 2;
  public seconds = 0;
  public totalMs = 120000;
  public doTimeout: boolean = false;
  public subscription: Subscription
  public runtimeConfig;
  public captchaIsLoaded = false;
  public captchaSuccess = false;
  public captchaIsExpired = false;
  public captchaResponse?: string;
  public showWindow: any = "guestFlow";
  public email;
  public theme: 'light' | 'dark' = 'light';
  public size: 'compact' | 'normal' = 'normal';
  public lang = 'en';
  public type: 'image' | 'audio';
  public isValidForm: boolean;
  loginFormFilled: boolean;
  captchaChecked: boolean;
  public forgotPWToken;
  public quoteNo = '';
  public language: any;
  public errorMessages = [];
  public otpInterval;
  public guestToken;
  public passwordSavedAlert: any;
  public yourAccountAlreadyExists: any;
  public retrieveQuoteAlert: any;
  public disableProductSel = false;
  public showCaptcha = true;
  public routes = [
    'new-login',
    'new-motor-info',
    'compare-plans',
    'quote-summary',
    'additional-details',
    'payment-succeed',
    'payment-failed',
    'resetPassword',
    'contact-message',
    'forgotPwd',
    'User',
    'Customer360',
    ''
  ]
  public allowAPICall = true;
  constructor(private dropdownservice: DropDownService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private authService: AuthService,
    public dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private appService: AppService,
    private dataService: DataService,
    public runtimeConfigService: RuntimeConfigService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    public media: MediaObserver) {
    router.events.forEach(event => {
      if (event instanceof NavigationEnd) {
        this.formType = event.url.slice(1).split("/")[0];
        if (this.formType.includes('new-login') || this.formType === '') {
          this.allowAPICall = true;
          this.formType = 'new-login';
        }
        if (this.formType.includes('resetPassword')) {
          this.allowAPICall = false;
          this.formType = 'resetPassword';
          if (this.formType === 'resetPassword')
            this.showWindow = 'loginForm';
          this.routerToken = event.url.slice(1).split("/")[1];
          this.routerTokenType = event.url.slice(1).split("/")[2];
        } else if (this.formType.includes('forgotPwd')) {
          this.allowAPICall = false;
          this.showWindow = 'loginForm';
        }
        let res;
        this.routes.filter(val => {
          if (val === this.formType)
            res = true;
        });
        if (!res) {
          this.formType = 'new-login';
        }
      }
    });

    this.route.queryParams
      .subscribe(params => {
        if (params['reviseDetails']) {
          this.isRevisedDetail = true;
        } else {
          localStorage.setItem('isPlanCalculated', 'false');
        }
        if (params['quoteNo']) {
          this.quoteNo = params['quoteNo'];
        }
      });
  }

  patchBasicDetails() {
    this.infoForm.patchValue(this.dataService.getUserDetails())
  }

  ngOnInit() {
    this.runtimeConfig = this.runtimeConfigService.config;
    this.LoginForm = this.formBuilder.group({
      userName: ['', [Validators.required,]],
      password: ['', [Validators.required,]],
      recaptcha: ['', Validators.required]
    });
    this.infoForm = this.formBuilder.group({       
      productType: ['', Validators.required],
      mobileCode: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.minLength(9),
      Validators.maxLength(9), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      email: ['', Validators.compose([Validators.required, Validators.email, Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)])],
    });
    this.ForgotForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email, Validators.pattern(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)])],
      otp: ['', []]
    });
    this.OtpForm = this.formBuilder.group({
      otp: ['', [Validators.required,]],
      email: ['', []]
    });
    this.PasswordForm = this.formBuilder.group({
      userName: [{ value: '', disabled: true }, [Validators.required,]],
      password: ['', [Validators.required,]],
      confirmPassword: ['', [Validators.required, confirmPassword]],
    });
    if (this.routerToken) {
      this.getOtp();
    }
    if (this.allowAPICall)
      this.guestUserCall();
    if (!this.isRevisedDetail) {
      // this.guestUserCall();
    }
    else {
      this.patchBasicDetails();
      this.loadDropdownValues();
    }
    if (this.runtimeConfig.Environment === 'QC') {
      this.LoginForm.get('recaptcha').setValidators([]);
      this.LoginForm.get('recaptcha').updateValueAndValidity();
    }
    this.appService.setDiscountDetails({});
    this.appService.setPlanDetails({})
    this.language = localStorage.getItem("language");
    if (this.dataService.getEmailDetails() != '' && this.formType == "forgotPwd") {
      this.ForgotForm.controls['email'].disable();
      this.isResetLinkSend = true;
      this.ForgotForm.patchValue({
        'email': this.dataService.getEmailDetails()
      })
      this.dataService.setEmailDetails('');
      this.forgotPwd();
    }
    if (localStorage.getItem('isPlanCalculated') === 'true') {
      this.disableProductSel = true;
    }
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
      this.loadDropdownValues();
    }
  }
  guestUserCall() {
    this.spinner.show();
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.setItem('isLoggedIn', 'false');

    this.loadDropdownValues();
    let value = {
      guestUser: true
    }
    this.subscription = this.coreService.postInputs4('login/signIn', value, {}).subscribe(response => {
      this.guestToken = response.data;
      localStorage.setItem('guesttokenDetails', this.guestToken.token);
      localStorage.setItem('isLoggedIn', 'false');
      this.authService.isGuestUser.next(true);
      this.appService._isTokenReady.next(true);
    });
  }

  loadDropdownValues() {
    this.subscription = this.dropdownservice.getInputs('options/product/list', '').subscribe((response: any) => {
      this.options['products'] = response.data;
    });
    this.subscription = this.coreService.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
      this.infoForm.patchValue({
        mobileCode: response['data'][0].value
      });
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
    });
  }

  handleSuccess(event) {
    this.isValidForm = false;
    this.captchaChecked = true;
  }

  handleExpire(){
    this.captchaSuccess = false;
    this.captchaIsExpired = false;
    this.cdr.detectChanges();
  }

  doLoginAfterResetPassword(password, email) {
    this.spinner.show();
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.removeItem('isLoggedIn');
    let value = {
      userName: email,
      password: password
    };
    this.subscription = this.coreService.postInputs4('login/signIn', value, {}).subscribe(response => {
      this.spinner.hide();
      let data = response.data;
      localStorage.setItem('tokenDetails', data.token);
      localStorage.setItem('userId', data['userId'].toString());
      if (data.loggedfirst == "Y") {
        this.dataService.setEmailDetails(data.email);
        this.router.navigate(['/forgotPwd']);
      }
      localStorage.setItem('Username', data.fullName);
      localStorage.setItem('isLoggedIn', 'true');
      this.authService.isUserLoggedIn.next(true);
      this.authService.isGuestUser.next(false);
      this.dataService.setUserDetails({})
      if (data.lastLoggedIn) {
        this.router.navigate([`/User/dashboard`]);
      } else {
        let params = {
          quoteType: 'FQ',
          page: 0,
          pageSize: 1,
        };
        if (localStorage.getItem("isLoggedIn") == "true") {
          this.dropdownservice.getInputs("search/quotes/findAll", params).subscribe((data: any) => {
            if (data.recordsInPage === 0) {
              this.router.navigate([`/User/dashboard`]);
            } else {
              if (data.data[0].statusId === "WIP" || data.data[0].statusId === "MR") {
                this.router.navigate(['/additional-details'], { queryParams: { quoteNo: data.data[0].quoteNo, retrieveQuote: true } });
              } else {
                this.router.navigate([`/User/dashboard`]);
              }
            }
          })
       }
      }
    });
  }

  submitForm() {
    if (this.LoginForm.status == 'INVALID') {
      this.isValidForm = true;
      return
    }
    this.spinner.show();
    localStorage.removeItem('tokenDetails');
    localStorage.removeItem('Username');
    localStorage.removeItem('guesttokenDetails');
    localStorage.removeItem('isLoggedIn');
    this.LoginForm.value['userName'] = this.LoginForm.value['userName'].trim().toLowerCase();
    let value = this.LoginForm.value;
    this.subscription = this.coreService.postInputs4('login/signIn', value, {}).subscribe(response => {
      this.spinner.hide();
      let data = response.data;
      localStorage.setItem('userId', data['userId'].toString());
      localStorage.setItem('tokenDetails', data.token);
      if (data.loggedfirst == "Y") {
        this.dataService.setEmailDetails(data.email);
        this.router.navigate(['/forgotPwd']);
      }
      localStorage.setItem('Username', data.fullName)
      localStorage.setItem('isLoggedIn', 'true');
      this.authService.isUserLoggedIn.next(true);
      this.authService.isGuestUser.next(false);
      this.dataService.setUserDetails({});
      if (localStorage.getItem('accountExists') === value.userName) {
        this.coreService.getInputsDbsync('insured/findByUserId', '').subscribe(res => {
          res['productType'] = this.infoForm.get('productType').value
          this.dataService.setUserDetails(res);
          this.router.navigate(['/new-motor-info']);
        this.spinner.hide();
        });
      } else {
        localStorage.setItem('accountExists', null)
      if (data.lastLoggedIn) {
        this.router.navigate([`/User/dashboard`]);
      } else {
        let params = {
          quoteType: 'FQ',
          page: 0,
          pageSize: 1,
        };
        if (localStorage.getItem("isLoggedIn") == "true") {
        this.dropdownservice.getInputs("search/quotes/findAll", params).subscribe((data: any) => {
          if (data.recordsInPage === 0) {
            this.router.navigate([`/User/dashboard`]);
          } else {
            if (data.data[0].statusId === "WIP" || data.data[0].statusId === "MR") {
              this.router.navigate(['/additional-details'], { queryParams: { quoteNo: data.data[0].quoteNo, retrieveQuote: true } });
            } else {
              this.router.navigate([`/User/dashboard`]);
            }
          }
        })
       } 
      }
      }
    }, err => {
      this.spinner.hide();
      this.guestUserCall();
    });
  }

  get formCtrls() {
    return this.infoForm.controls;
  }

  // getErrorMessage() {
  //   return this.infoForm.controls['mobileNo'].hasError('required') ? this.errorMessages[0] :
  //   this.infoForm.controls['mobileNo'].hasError('minlength') ? this.errorMessages[1] :
  //   this.infoForm.controls['mobileNo'].hasError('pattern') ? this.errorMessages[2] : '';
  // }

  getMotorInfo(): void {
    this.infoForm.value['email'] = this.infoForm.value['email'].trim().toLowerCase();
    let value = {
      emailId: this.infoForm.value['email']
    }
    this.spinner.show();
    this.subscription = this.coreService.getInputs(`user/existsByEmail`, value).subscribe(res => {
      this.spinner.hide();
      if (res == true) {
        localStorage.setItem('accountExists', value.emailId)
        this.invalidEmail = true;
        this.translate.get('YourAccountAlreadyExists').subscribe(value => {
          this.yourAccountAlreadyExists = value;
        });
        let dialogRef = this.dialog.open(MessagePopupComponent, {
          width: '400px',
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
          data: {
            for: 'emailAlreadyExist',
            title: 'Try Login',
            body: this.yourAccountAlreadyExists
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.showWindow = 'loginForm';
          this.LoginForm.get('userName').setValue(this.infoForm.get('email').value.trim().toLowerCase());
          this.LoginForm.get('password').reset();
        });
      } else {
        localStorage.setItem('accountExists', null)
        if (this.infoForm.value.productType === '') {
          this.radioError = true;
        }
        if (this.infoForm.status == 'INVALID') {
          return;
        } else {
          // localStorage.setItem('guesttokenDetails', this.guestToken.token);
          // localStorage.setItem('isLoggedIn', 'false');
          // this.authService.isGuestUser.next(true);
          this.dataService.setUserDetails(this.infoForm.value);
          this.saveAuditData();
          if (this.quoteNo) {
            this.router.navigate(['/new-motor-info'], {
              queryParams: { quoteNo: this.quoteNo }
            })
          }
          else {
            this.router.navigate(['/new-motor-info'])
          }
          // });
          //

        }
      }
    });
  }

  saveAuditData() {
    let body = {
      email: this.infoForm.value['email'].trim().toLowerCase(),
      mobNo: this.infoForm.value['mobileNo'],
      loginSrc: 'CP',
      mobileCode: this.infoForm.value['mobileCode']
    }
    this.subscription = this.coreService.postInputs2('audit/users', body, '').subscribe(res => {
    });
  }

  selectOption(value) {
    this.radioError = false;
    if (value.value === '105') {
      this.autoDataURL = 'ae/findByChassisNoWithPrice';
    } else {
      this.autoDataURL = 'ae/findByChassisNo'
    }
  }

  ForgotNavigate() {
    this.router.navigate(['/forgotPwd'])
  }

  showHidePwd(value) {
    let x: any = document.getElementById(`${value}`);
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }

  retrieveQuote(Type: string, Title: string): void {
    this.translate.get('RetrieveQuote').subscribe(value => {
      this.retrieveQuoteAlert = value;
    });
    let dialogRef = this.dialog.open(QuoteDialog, {
      width: '500px',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
      autoFocus: false,
      data: { QType: this.retrieveQuoteAlert, QTitle: Title }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  forgotPwd() {
    this.ForgotForm.get('otp').setValidators([]);
    this.ForgotForm.get('otp').updateValueAndValidity();
    if (this.ForgotForm.status === 'INVALID') {
      return;
    }
    this.spinner.show();
    this.subscription = this.coreService.postInputs5(`user/forgotPassword?emailId=${this.ForgotForm.value.email.trim().toLowerCase()}`, '').subscribe(res => {
      localStorage.setItem('email', this.ForgotForm.value.email.trim().toLowerCase())
      this.spinner.hide();
      clearInterval(this.otpInterval);
      this.totalMs = 120000;
      this.minutes = 2;
      this.seconds = 0;
      this.showTimer();
      this.isResetLinkSend = true;
      this.email = this.ForgotForm.value.email;
      this.forgotPWToken = res;
      this.ForgotForm.get('otp').setValidators([Validators.required]);
      this.ForgotForm.get('otp').updateValueAndValidity();
    }, err => {
      this.spinner.hide();
    });
  }

  verifyFPOTP() {
    if (this.ForgotForm.status === 'INVALID')
      return;
    this.spinner.show();
    this.subscription = this.coreService.getInputs(`user/validateOtp?token=${this.forgotPWToken}&otp=${this.ForgotForm.value['otp']}`, '').subscribe(res => {
      this.spinner.hide();
      if (res) {
        this.router.navigate(['/resetPassword', this.forgotPWToken, 'FP'])
      }
    }, err => {
      this.spinner.hide();
      this.ForgotForm.get('otp').setValue(null);
      this.ForgotForm.get('otp').updateValueAndValidity();
    })
  }
  resetPwd() {
    if (!this.PasswordForm.valid) {
      return;
    }

    let password = this.PasswordForm.getRawValue().userName.trim().toLowerCase();
    let body = {
      token: this.routerToken,
      password: this.PasswordForm.value['confirmPassword']
    }
    this.subscription = this.coreService.postInputs4(`login/resetPassword`, body, '').subscribe(res => {
      if (res.status == 'F') {
        this.PwdSopList = res.errorMessages;
      }
      else {
        setTimeout(() => {
          this.doLoginAfterResetPassword(body['password'], password)
        }, 2000);
      }
    }, err => {
      swal(
        '', err.error.error, 'error'
      );
    });
  }
  getOtp() {
    if (this.routerTokenType === 'FP') {
      this.showPassword = true;
      this.PasswordForm.get('password').reset();
      this.PasswordForm.patchValue({
        'userName': localStorage.getItem('email'),
      })
    } else {
      this.spinner.show();
      this.subscription = this.coreService.getInputs1(`user/confirmPasswordReset/${this.routerToken}`, '').subscribe(res => {
        this.spinner.hide();
        clearInterval(this.otpInterval);
        this.totalMs = 120000;
        this.minutes = 2;
        this.seconds = 0;
        this.showTimer();
        this.PasswordForm.patchValue({ 'userName': res });
        this.OtpForm.patchValue({ 'email': res })
      }, err => {
        if (err.error === 'Password reset link expired') {
          swal({
            text: 'Your quote expired, please create New Quote',
            icon: "warning",
            dangerMode: true,
            buttons: {
              confirm: {
                text: 'OK',
                value: true,
                visible: true,
                className: "",
                closeModal: true
              },
            }
          }).then(val => {
            this.router.navigate(['/new-login'])
          })
        }
      });
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

  submitOtpForm() {
    if (!this.OtpForm.valid) {
      return;
    }
    this.subscription = this.coreService.getInputs(`user/validateOtp?token=${this.routerToken}&otp=${this.OtpForm.value['otp']}`, '').subscribe(res => {
      if (res)
        this.showPassword = true;
    });
  }

  scrollToFunc(value: string) {
    this.showWindow = value
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
  }
}


// dialoguecomponent
@Component({
  selector: 'Quotedialog',
  templateUrl: './Quotedialog.html',
  styleUrls: ['./Quotedialog.component.scss']
})
export class QuoteDialog {
  dialogeDetails: any;
  public quoteForm: FormGroup;
  OtpForm: FormGroup;
  token: any;
  public minutes;
  public seconds;
  public totalMs;
  public doTimeout: boolean = false;
  public isCompleted: boolean = false;
  public otpInterval;
  public retrieveQuoteCall: boolean;
  public stepper;
  constructor(private service: CoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public dialogRef: MatDialogRef<QuoteDialog>,
    @Inject(MAT_DIALOG_DATA) public data,
    private builder: FormBuilder,
    private appService: AppService,
    private authService: AuthService
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.quoteForm = this.builder.group({
      type: ['', Validators.required],
    });
    this.OtpForm = this.builder.group({
      otp: ['', Validators.required]
    });
    this.authService.isUserLoggedIn.subscribe(value => {
      if (!value) {
        this.retrieveQuoteCall = false;
      }
    })
    this.appService._isTokenReady.subscribe(value => {
      if (value === true && this.retrieveQuoteCall === true) {
        this.retrieveQuote();
      }
    })
  }

  retrieveQuote() {
    this.service.getInputs1(`quotes/confirmQuoteRetrieval?quoteNo=${this.dialogeDetails.trim()}`, '').subscribe(response => {
      if (response) {
        this.OtpForm.reset();
        this.OtpForm.clearValidators();
        clearInterval(this.otpInterval);
        this.isCompleted = true;
        this.goForward(this.stepper)
        this.token = response;
        this.minutes = 2;
        this.seconds = 0;
        this.totalMs = 120000;
        this.showTimer();
      }
      this.spinner.hide();
    });
  }

  sendEmail(stepper) {
    this.stepper = stepper
    this.retrieveQuoteCall = true;
    if (this.quoteForm.status === 'INVALID') {
      return
    }
    this.spinner.show();
    if (localStorage.getItem('guesttokenDetails')) {
      this.retrieveQuote();
    }
  }

  verifyOtp() {
    if (this.OtpForm.status === 'INVALID')
      return;

    this.service.getInputs1(`quotes/validateOtp?token=${this.token}&otp=${this.OtpForm.value['otp']}`, '').subscribe(response => {
      if (response == 'true') {
        this.dialogRef.close();
        this.router.navigate([`/additional-details`], {
          queryParams: {
            quoteNo: this.dialogeDetails.trim(),
            retrieveQuote: true
          }
        });
      }
    });
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
  goForward(stepper: MatStepper) {
    stepper.next();
  }
}
