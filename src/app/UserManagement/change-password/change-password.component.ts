import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '../../core/services/core.service';
import swal from 'sweetalert'
import { HeaderComponent } from '../../shared/header/header.component';
import { TranslateService } from '@ngx-translate/core';
import { ProfileUpdateDialog } from '../manageprofile/manageprofile.component';
import { NgxSpinnerService } from 'ngx-spinner';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control.dirty || control.touched);
    return (invalidCtrl);
  }
}

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  providers:[HeaderComponent],
})
export class ChangePasswordComponent implements OnInit {

  changePassword: FormGroup;
  validation_messages: any;
  isSubmitted: boolean;
  newPasswordIsRequired: any;
  confirmPasswordIsRequired: any;
  public language: any;
  public PwdSopList = [];

  matcher = new MyErrorStateMatcher();
  userName: string = localStorage.getItem('Username');
  errors: any[];
  isFirstLogin: Boolean = false;
  passwordChanged='';
  checkPasswords(group: FormGroup) {
    let pass = group.controls.newpassword.value;
    let confirmPass = group.controls.confirmpassword.value;
    return pass === confirmPass ? null : { notSame: true }
  }

  constructor(private formBuilder: FormBuilder,
   public router: Router,
   public postService: CoreService,
   public actRoute: ActivatedRoute,
   private translate: TranslateService,
   private dialog: MatDialog,
   private spinner: NgxSpinnerService,
   private header : HeaderComponent) { }

  ngOnInit() {
    this.changePassword = this.formBuilder.group({
      username: [''],
      newpassword: ['', Validators.compose([
        Validators.required,
        //Validators.pattern('^[a-zA-Z0-9]*$')
      ])],
      confirmpassword: ['', Validators.compose([
        Validators.required,
        //Validators.pattern('^[a-zA-Z0-9]*$')
      ])]
    }, { validator: this.checkPasswords });
    this.translate.get('Required.NewPasswordIsRequired') .subscribe(value => { 
      this.newPasswordIsRequired = value; 
    } );
    this.translate.get('Required.ConfirmPasswordIsRequired') .subscribe(value => { 
      this.confirmPasswordIsRequired = value; 
    } );

    this.validation_messages = {
      "newpassword": [
        { type: 'required', message: this.newPasswordIsRequired }
        //{ type: 'pattern', message: 'Enter a valid new password' }
      ],
      "confirmpassword": [
        { type: 'required', message:  this.confirmPasswordIsRequired }
        //{ type: 'pattern', message: 'Enter a valid Password' }
      ]
    }
    this.changePassword.patchValue({ username: this.userName });
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  onSavePassword() {
    this.isSubmitted = true;
    if (this.changePassword.invalid) {
      return;
    }
    let data = {
      password: this.changePassword.value.confirmpassword,
      token: ''
    }
    this.spinner.show();
    this.PwdSopList = [];
    this.postService.postInputs4('login/validatePassword', data, null).subscribe(res => {
      this.spinner.hide();
      if (res.status === 'P') {
        
        let dialogRef = this.dialog.open(ProfileUpdateDialog, {
          width: '450',
          direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
          data: { type: 'update password' }
        });
        dialogRef.afterClosed().subscribe(token => {
          if (token) {
            let params = {
              password: this.changePassword.value.newpassword,
              token: token
            }
            this.translate.get('PasswordChanged').subscribe(value => {
              this.passwordChanged= value
            })
            this.spinner.show();
            this.postService.postInputs4('login/resetPassword', params, '').subscribe(response => {
              this.spinner.hide();
              if (response.status === 'P') {
                swal('', this.passwordChanged, 'success').then(() => {
                this.header.LogOut();
                })
              }
            })
          }
        });
      } else {
        this.PwdSopList = res.errorMessages
      }
    }, err => {
      this.spinner.hide();
    })


    // this.postService.postInputs4('login/changePassword', params, '').subscribe(result => {
    //   if (result.status === 406) {
    //     this.errors = result.data;
    //     this.changePassword.patchValue({newpassword: '', confirmpassword: ''});
    //   }
    //   else if(result.status === 404){
    //     swal(
    //       '', result.message, 'error'
    //     );
    //   }
    //   else if (result.status === 200) {        
    //      swal(
    //       '', result.message, 'success'
    //     ); 
    //      this.header.LogOut();
    //   }
    // }, err => {
    //   alert("Network Error");
    // });
  }

  onReset() {
    this.PwdSopList = [];
    this.changePassword.patchValue({
      newpassword: '',
      confirmpassword: ''
    });
  }
}
