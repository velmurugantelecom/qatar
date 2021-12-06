import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CoreService } from '../core/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { DropDownService } from '../core/services/dropdown.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { EmailPopupComponent } from '../modal/email-popup/email-popup.component';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import swal from 'sweetalert'
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { RequestRedirectComponent } from '../shared/request-redirect/request-redirect.component';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
import { AppService } from '../core/services/app.service';

@Component({
  selector: 'app-additional-details',
  templateUrl: './additional-details.component.html',
  styleUrls: ['./additional-details.component.scss'],
  providers: [DatePipe]
})
export class AdditionalDetailsComponent implements OnInit {

  public effDate;
  public isAttachmentArea: boolean;
  public additionalDetails: FormGroup;
  public quoteDetails: any;
  public options: any = {};
  public showBankField: boolean;
  public quoteNo;
  public showHeader = false;
  public mailId: string;
  public isReviseDetails;
  public isOldQuote;
  public fileContainer = [];
  public DocUploadForm: FormGroup;
  public addMoreDoc: boolean;
  public activeStepper;
  public isAttachmentSubmitted: boolean;
  public selectedBank = null;
  public selectedColor = null;
  public selectedPlate = null;
  public selectedNationality = null;
  public selectedOccupation = null;
  
  public policyPopup: any;
  public effetiveDates: any
  public nowTime: any;
  public minTime: any;
  public RegistrationNoRequired: boolean = true;
  public questionnaireStatus: boolean = false;
  public RegistrationMarkRequired: boolean = true;
  public QuestionnaireStatusShow: boolean = false;
  public uploadedDocs = [];
  public mortgagedYNDisabled: boolean = false;
  public residentialStatusYN : any;
  yes: any;
  no: any;
  public language: any;
  public tribeQuesYN: any;
  public tribeQuesValue: any;
  @ViewChild('stepper', { static: false }) private stepper: MatStepper;
  filteredBanks: Observable<string[]>;
  filteredColors: Observable<string[]>;
  filteredPlateCodes: Observable<string[]>;
  filteredNationality: Observable<string[]>;
  filteredOccupation: Observable<string[]>;
  public maxEffectiveDate;
  public today = moment(new Date()).format("YYYY-MM-DD");
  public effectiveDateChanged = false
  public currentEffDate;
  minVDate;
  expiryVDate;
  public subscription: Subscription;
  public goTo = '';
  public notes: any;
  public maxPolicyStartDate: any;
  public invalidFileFormat: any;
  public mandatoryDocuments: any;
  public registeredInDubai: any;
  public firstTimeRegisteredInDubai: any;
  public renewingVehicleInDubai: any;
  public isLoggedInUser: boolean;
  public isContentLoaded: boolean;
  iconDir = localStorage.getItem('language');
 
  
  constructor(private formBuilder: FormBuilder,
    private coreService: CoreService,
    private router: Router, private route: ActivatedRoute,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dropdownservice: DropDownService,
    private translate: TranslateService,
    public runtimeConfigService: RuntimeConfigService,
    private datePipe: DatePipe,
    private appService: AppService) { }

  ngOnInit() {
    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoaded) {
        if (this.stepper.selectedIndex != 2) {
          this.language = localStorage.getItem('language');
          this.init();
        }
      }
    })
    this.init();
  }

  init() {
    console.log('calling init')
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.isLoggedInUser = true;
    } else {
      this.isLoggedInUser = false;
    }
    let date = moment(new Date()).add(1, 'd')
    
    this.additionalDetails = this.formBuilder.group({
      colorId: ['', [Validators.required]],
      noOfDoors: ['', [Validators.required, Validators.min(1), Validators.max(99), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      mortgagedYN: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      
      engineNo: ['', [Validators.required]],
      registrationMark: ['', [Validators.required]],
      effectiveDate: ['', [Validators.required]],
      prefix: ['', [Validators.required]],
      // fullName: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      fullName: ['', [Validators.required, Validators.pattern('[a-zA-Z\u0600-\u06FF ]*')]],
      fullNameBL: ['', []],
      prefixBL: ['', [Validators.required]],
      taxId: ['', []],
      nationality: ['', [Validators.required]],
      address4: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['12', [Validators.required]],
      postBox: ['', [Validators.required]],
      address1: ['', [Validators.required]],
      occupation: ['', [Validators.required]],
      occupationType:['',[]],
      residentialStatusYN:['',[Validators.required]],
      address2: ['', []],
      personalId: ['', [Validators.required, Validators.minLength(15)]],
      licenseExpiryDate:['',[Validators.required]],
      questionnaire: ['', []]

    });
    this.DocUploadForm = this.fb.group({});
    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
        this.isReviseDetails = params['reviseDetails'];
        this.isOldQuote = params['retrieveQuote'];
        this.goTo = params['goTo'];
      });
    this.spinner.show();
    if (this.isReviseDetails || this.isOldQuote) {
      if (this.goTo === '3') {
        this.activeStepper = 'three'
      } else {
        this.activeStepper = 'second';
      }
      this.doContinue('1');
      setTimeout(() => {
        this.goForward();
      }, 1000)
    } else {
      this.loadQuoteDetails();
    }
    this.isContentLoaded = true;
    this.language = localStorage.getItem("language");
    this.notes = [
      {
        name: 'File Type & Size',
        updated: 'JPEG/PNG/PDF/TXT & Max 10 MB',
      }
    ];

    this.translate.get('Invalid.MaxPolicyStartDate').subscribe(value => {
      this.maxPolicyStartDate = value.replace("30", this.runtimeConfigService.config.PolicyStartDateGreaterThan);
    });

    this.translate.get('RegisteredInDubai').subscribe(value => {
      this.registeredInDubai = value;
    });
    this.translate.get('FirstTimeRegisteredInDubai').subscribe(value => {
      this.firstTimeRegisteredInDubai = value;
    });
    this.translate.get('RenewingVehicleInDubai').subscribe(value => {
      this.renewingVehicleInDubai = value;
    });
    this.options['questionnaire'] = [
      {
        label: this.registeredInDubai,
        value: '04'
      }, {
        label: this.firstTimeRegisteredInDubai,
        value: '01'
      }, {
        label: this.renewingVehicleInDubai,
        value: '03'
      }];
    this.coreService.getInputsDbsync('findPolicyStartDate', { quoteNumber: this.quoteNo }).subscribe(res => {
      this.effDate = res;
    });
  
    // let param = {
     
    //   optionType: 'OCCUPATION_TYP',
    //   productId: '*',
    // }
    // this.coreService.listOptions1('options/list',param).subscribe(response => {
    //   this.options['OccupationType'] = response['data'];
    //   this.additionalDetails.patchValue({
       
    //       OccupationType :  response['data'][0].value
    //   });
     
    // });
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
      this.translate.get('Invalid.MaxPolicyStartDate').subscribe(value => {
        this.maxPolicyStartDate = value.replace("30", this.runtimeConfigService.config.PolicyStartDateGreaterThan);
      });

      this.translate.get('RegisteredInDubai').subscribe(value => {
        this.registeredInDubai = value;
      });
      this.translate.get('FirstTimeRegisteredInDubai').subscribe(value => {
        this.firstTimeRegisteredInDubai = value;
      });
      this.translate.get('RenewingVehicleInDubai').subscribe(value => {
        this.renewingVehicleInDubai = value;
      });

      this.options['questionnaire'] = [
        {
          label: this.registeredInDubai,
          value: '04'
        }, {
          label: this.firstTimeRegisteredInDubai,
          value: '01'
        }, {
          label: this.renewingVehicleInDubai,
          value: '03'
        }];
    }
  }

  ngAfterViewInit() {
    if (this.activeStepper === 'second')
      this.stepper.selectedIndex = 1;
    else if (this.goTo === '3') {
      this.isAttachmentArea = true;
      this.stepper.selectedIndex = 2;
    }
    this.cdr.detectChanges();
  }

  private _filter(value, key): string[] {
    const filterValue = value ? value.toLowerCase() : '';

    let c = this.options[key].filter(option => option['label'].toLowerCase().includes(filterValue));
    return c
  }

  changeEffectiveDate() {

  }
  dateConversion(date: any) {
    function formatDate(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;
      return [year, month, day].join('-');
    }
    return formatDate(date);
  }
  updateEffectiveDate() {

  }

  loadQuoteDetails() {
    if (this.quoteNo.startsWith('P')) {
      this.router.navigate(['/User/dashboard']);
      return;
    }
    let url = "quotes/quoteDetailsSummary";
    let params = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, params).subscribe((response) => {
      if (response.data && response.data != null) {
        this.quoteDetails = response.data.quoteSummary;
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
      if (this.quoteDetails.vehicleDetails.mortgagedYN === 'Y') {
        this.showBankField = true;
      }
     
      this.maxEffectiveDate = moment(new Date()).add('days', this.runtimeConfigService.config.PolicyStartDateGreaterThan)['_d'];
      this.getDropDownOptions('bankName', 'BANKNAME', response.data.quoteSummary.productTypeId);
      this.getDropDownOptions('plateCode', 'VEH_REG_MARK', '*');
      this.getDropDownOptions('prefix', 'UCD_PREFIX_NAME');
      this.getDropDownOptions('occupationType','OCCUPATION_TYP');
      this.getUploadedDocs();
      if (this.quoteDetails.vehicleDetails.regStatus === 'N' && this.quoteDetails.vehicleDetails.registeredAt != "1102") {
        this.additionalDetails.get('registrationMark').setValidators([]);
        this.additionalDetails.get('registrationMark').updateValueAndValidity();
        // this.additionalDetails.get('regNo').setValidators([]);
        // this.additionalDetails.get('regNo').updateValueAndValidity();
        this.RegistrationNoRequired = false;
        this.RegistrationMarkRequired = false;
      }
      if (this.quoteDetails.vehicleDetails.regStatus === 'N' && this.quoteDetails.vehicleDetails.registeredAt == "1102") {
        this.questionnaireStatus = false;
        this.RegistrationNoRequired = false;
        this.RegistrationMarkRequired = false;
        this.additionalDetails.get('registrationMark').setValidators([]);
        this.additionalDetails.get('registrationMark').updateValueAndValidity();
        // this.additionalDetails.get('regNo').setValidators([]);
        // this.additionalDetails.get('regNo').updateValueAndValidity();
      }
      else if (this.quoteDetails.vehicleDetails.regStatus === '03' && this.quoteDetails.vehicleDetails.registeredAt == "1102") {
        this.questionnaireStatus = false;
        this.RegistrationNoRequired = true;
        this.RegistrationMarkRequired = true;
        this.additionalDetails.get('registrationMark').setValidators([Validators.required]);
        this.additionalDetails.get('registrationMark').updateValueAndValidity();
        // this.additionalDetails.get('regNo').setValidators([Validators.required]);
        // this.additionalDetails.get('regNo').updateValueAndValidity();
      }
      if (this.quoteDetails.vehicleDetails.registeredAt == "1102") {
        this.QuestionnaireStatusShow = true;
      }
      this.translate.get('Yes').subscribe(value => {
        this.yes = value;
      });
      this.translate.get('No').subscribe(value => {
        this.no = value;
      });
      this.mailId = this.quoteDetails.userDetails.email;
      this.options['financed'] = [
        {
          label: this.no,
          value: 'N'
        }, {
          label: this.yes,
          value: 'Y'
        },];


      if ((this.quoteDetails.vehicleDetails.registeredAt != "1102") || (this.quoteDetails.vehicleDetails.tribeQuesYN == "Y")) {
        this.additionalDetails.patchValue({
          questionnaire: this.quoteDetails.vehicleDetails.regStatus
        });
      }
      if ((!this.isReviseDetails) && (!this.isOldQuote) || (!this.quoteDetails.vehicleDetails.mortgagedYN)) {
        this.additionalDetails.patchValue({
          mortgagedYN: this.options['financed'][0].value
        });
      }
      if (this.quoteDetails.productTypeId == '101') {
        this.mortgagedYNDisabled = true;
      }
      this.translate.get('Yes').subscribe(value => {
        this.yes = value;
      });
      this.translate.get('No').subscribe(value => {
        this.no = value;
      });
     
      this.options['residentialStatusYN'] = [
        {
          label: this.yes,
          value: 'Y'
        }, {
          label: this.no,
          value: 'N'
        },];
        this.additionalDetails.patchValue({
          residentialStatusYN: this.options['residentialStatusYN'][0].value
      });
      this.getDropDownOptions('vehicleColor', 'COLOUR');
      this.getDropDownOptions('country', 'COUNTRY');
      this.getDropDownOptions('nationality', 'NATIONALITY');
      this.getDropDownOptions('motor_emirate', 'MOTOR_EMIRATE');
      this.getDropDownOptions('profession', 'PROFESSION');
      this.getDropDownOptions('occupationType','OCCUPATION_TYP');
      this.patchFormValues();
      this.options['prefixBL'] = [{ "label": "السيد", "value": "Mr" }, { "label": "تصلب متعدد", "value": "Ms" }, { "label": "السيدة", "value": "Mrs" }]
      
     
     
      if (!this.quoteDetails.userDetails.prefixBL) {
        this.additionalDetails.patchValue({
          prefixBL: this.quoteDetails.userDetails.prefix
        });
      } else {
        this.additionalDetails.patchValue({
          prefixBL: this.quoteDetails.userDetails.prefixBL
        });
      }
    }, err => {
      let errorMsg = err.error.text || err.error.error || err.error;
      swal('', errorMsg, 'error');
    });
  }

  addAdditionalDetail(stepper: MatStepper) {
    if (this.additionalDetails.value['mortgagedYN'] === 'N') {
      this.additionalDetails.get('bankName').setValidators([]);
      this.additionalDetails.get('bankName').updateValueAndValidity();
    }
    if (this.additionalDetails.invalid) {
      return;
    }
    this.spinner.show();
    let profession;
    this.options['profession'].forEach(element => {
      if (element.label === this.additionalDetails.value['occupation']) {
        profession = element.value;
      }
    });
    let nationality;
    this.options['nationality'].forEach(element => {
      if (element.label === this.additionalDetails.value['nationality']) {
        nationality = element.value;
      }
    });
    let exp;
    let exp1;
    exp = new Date(this.additionalDetails.value['licenseExpiryDate']);
    exp1 = this.dateConversion(exp);
    this.nowTime = this.dateConversion(new Date());
    this.minTime = this.datePipe.transform(new Date(), 'HH:mm');
    if (exp1 <= this.nowTime) {
      exp1 = exp1.concat('T' + this.minTime + ':00.000Z');
    }
    else {
      exp1 = exp1.concat('T00:00:00.000Z');
    }
    let insuredDetails = {
      quoteId: this.quoteDetails.quoteId,
      quoteNo: this.quoteNo,
      age: this.quoteDetails.userDetails.age,
      address4: this.additionalDetails.value['address4'],
      licenseIssueDate: this.quoteDetails.userDetails.licenseIssueDate,
      email: this.quoteDetails.userDetails.email,
    //  licenseExpiryDate: this.quoteDetails.userDetails.licenseExpiryDate,
      mobileNo: this.quoteDetails.userDetails.mobileNo,
      personalId: this.additionalDetails.value['personalId'],
      licenseExpiryDate : exp1,
      nationality: nationality,
      fullNameBL: this.additionalDetails.value['fullNameBL'],
      fullName: this.additionalDetails.value['fullName'],
      firstNameBL: this.additionalDetails.value['fullNameBL'],
      prefixBL: this.additionalDetails.value['prefixBL'],
      address1: this.additionalDetails.value['address1'],
      address2: this.additionalDetails.value['address2'],
      postBox: this.additionalDetails.value['postBox'],
      prefix: this.additionalDetails.value['prefix'],
      taxId: this.additionalDetails.value['taxId'],
      city: this.additionalDetails.value['city'],
      country: this.additionalDetails.value['country'],
      occupation: profession,
      occupationType:this.additionalDetails.value['occupationType'],
      residentialStatusYN:this.additionalDetails.value['residentialStatusYN'],
      driverSameAsInsured: true
    }
    let bankName;
    this.options['bankName'].forEach(element => {
      if (element.label === this.additionalDetails.value['bankName']) {
        bankName = element.value;
      }
    });
    let color;
    this.options['vehicleColor'].forEach(element => {
      if (element.label === this.additionalDetails.value['colorId']) {
        color = element.value;
      }
    });
    let plateCode;
    this.options['plateCode'].forEach(element => {
      if (element.label === this.additionalDetails.value['registrationMark']) {
        plateCode = element.value;
      }
    });
    if (this.additionalDetails.value['questionnaire']) {
      this.tribeQuesYN = "Y";
      this.tribeQuesValue = this.additionalDetails.value['questionnaire'];
    }
    else {
      this.tribeQuesYN = "N";
      this.tribeQuesValue = this.quoteDetails.vehicleDetails.regStatus;
    }
    let vehicledetails = {
      colorId: color,
      mortgagedYN: this.additionalDetails.value['mortgagedYN'],
      bankName: bankName,
      sgsID: this.quoteDetails.quoteId,
      noOfDoors: this.additionalDetails.value['noOfDoors'],
      registeredAt: this.quoteDetails.vehicleDetails.registeredAt,
      registrationMark: plateCode,
    //  regNo: this.additionalDetails.value['regNo'],
      engineNo: this.additionalDetails.value['engineNo'],
      regStatus: this.tribeQuesValue,
      tribeQuesYN: this.tribeQuesYN,
      trim: this.quoteDetails.vehicleDetails.trim
    }
    if (vehicledetails.mortgagedYN === 'N') {
      delete vehicledetails['bankName'];
    }
    let params = {
      quoteNumber: this.quoteNo
    }
    let effectiveDate;
    effectiveDate = new Date(this.additionalDetails.value['effectiveDate']);
    this.effetiveDates = this.dateConversion(effectiveDate);
    this.nowTime = this.dateConversion(new Date());
    this.minTime = this.datePipe.transform(new Date(), 'HH:mm');
    if (this.effetiveDates <= this.nowTime) {
      this.effetiveDates = this.effetiveDates.concat('T' + this.minTime + ':00.000Z');
    }
    else {
      this.effetiveDates = this.effetiveDates.concat('T00:00:00.000Z');

    }
    let changeStartDateparams = {
      quoteId: this.quoteDetails.quoteId,
      amndVerNo: 0,
      startDate: this.effetiveDates,
      productId: this.quoteDetails.productTypeId
    }
    this.subscription = this.coreService.postInputs2('changeStartDate', '', changeStartDateparams).subscribe(res => {
      this.subscription = this.coreService.postInputs(`vehicledetails/updateVehicleDetails`, [vehicledetails], params).subscribe(response => {
        this.subscription = this.coreService.postInputs(`insuredetails/addinsure`,
          insuredDetails, null).subscribe(response => {
            this.spinner.hide();
            stepper.next();
          }, err => {
            this.spinner.hide();
          });
      });
      this.isAttachmentArea = true;
    }, err => {
      this.subscription = this.coreService.postInputs(`vehicledetails/updateVehicleDetails`, [vehicledetails], params).subscribe(response => {
        this.subscription = this.coreService.postInputs(`insuredetails/addinsure`,
          insuredDetails, null).subscribe(response => {
            this.spinner.hide();
            stepper.next();
          }, err => {
            this.spinner.hide();
          });
      });
      this.isAttachmentArea = true;
    });
    //

  }



  financeStatusChange(value) {
    if (value === 'Y') {
      this.showBankField = true;
    } else {
      this.showBankField = false;
      this.additionalDetails.get('bankName').setValidators([]);
      this.additionalDetails.get('bankName').updateValueAndValidity();
    }
  }

  registrationNoChange(regNoValue) {
    if (regNoValue.target.value.length > 0) {
      this.RegistrationMarkRequired = true;
      this.additionalDetails.get('registrationMark').setValidators(Validators.required);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
    }
    else {
      this.RegistrationMarkRequired = false;
      this.additionalDetails.get('registrationMark').setValidators([]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
    }
  }
  questionnaireStatusChange(value) {
    if (value === '04') {
      this.questionnaireStatus = true;
      this.RegistrationNoRequired = true;
      this.RegistrationMarkRequired = true;
      this.additionalDetails.get('registrationMark').setValidators([Validators.required]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      // this.additionalDetails.get('regNo').setValidators([Validators.required]);
      // this.additionalDetails.get('regNo').updateValueAndValidity();
    } else if (value === '01') {
      this.questionnaireStatus = false;
      this.RegistrationNoRequired = false;
      this.RegistrationMarkRequired = false;
      this.additionalDetails.get('registrationMark').setValidators([]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      // this.additionalDetails.get('regNo').setValidators([]);
      // this.additionalDetails.get('regNo').updateValueAndValidity();
    }
    else if (value === '03') {
      this.questionnaireStatus = false;
      this.RegistrationNoRequired = true;
      this.RegistrationMarkRequired = true;
      this.additionalDetails.get('registrationMark').setValidators([Validators.required]);
      this.additionalDetails.get('registrationMark').updateValueAndValidity();
      // this.additionalDetails.get('regNo').setValidators([Validators.required]);
      // this.additionalDetails.get('regNo').updateValueAndValidity();
    }
  }

  emiratesChange(value) {
    let params = {
      productId: "*",
      filterByValue: value,
      optionType: 'MOTOR_CITY'
    }
    this.subscription = this.coreService.getInputs('options/list', params).subscribe((response) => {
      this.options['city'] = response.data;
      if (this.quoteDetails.userDetails['address4'] == value) {
        this.additionalDetails.patchValue({
          city: this.quoteDetails.userDetails['city'],
        });
      }
      else {
        this.additionalDetails.patchValue({
          city: '',
        });
      }
    });
  }

  getDropDownOptions(key: string, optionId: string, productId = '*') {
    if (optionId === 'UCD_PREFIX_NAME') {
      let object = {
        optionType: optionId,
        productId: productId
      }
      this.subscription = this.dropdownservice.getInputs('options/list', object).subscribe((response: any) => {
        this.options[key] = response.data;
      });
      return;
    }
    if(optionId === 'OCCUPATION_TYP'){
      let param = {
     optionType: optionId,
     productId: productId,
   }
   this.coreService.listOptions1('options/list',param).subscribe(response => {
     this.options['occupationType'] = response['data'];
     this.additionalDetails.patchValue({
         occupationType :  response['data'][0].value
     });
    
   });
  
   }
    this.subscription = this.coreService.listOptions(optionId, productId).subscribe((response: any) => {
      if (key === 'plateCode' && !this.RegistrationMarkRequired) {
        this.options[key] = [
          { label: '', value: null },
          ...response.data
        ]
      } else {
        this.options[key] = response.data;
      }
      // this.options[key] = response.data;
      if (key === 'bankName') {
        this.filteredBanks = this.additionalDetails['controls']['bankName'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      } else if (key === 'vehicleColor') {
        this.filteredColors = this.additionalDetails['controls']['colorId'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      } else if (key === 'plateCode') {
        this.filteredPlateCodes = this.additionalDetails['controls']['registrationMark'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      }
      else if (key === 'nationality') {
        this.filteredNationality = this.additionalDetails['controls']['nationality'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      }
      else if (key === 'profession') {
        this.filteredOccupation = this.additionalDetails['controls']['occupation'].valueChanges
          .pipe(
            startWith(''),
            map(value => {
              let c = this._filter(value, key);
              return c;
            })
          );
      }
    });
  }

  doNavigate(event) {
    event.preventDefault();
    this.isAttachmentSubmitted = true;
    if (this.DocUploadForm.status != 'INVALID')
      this.router.navigate([`/quote-summary`], {
        queryParams: {
          quoteNo: this.quoteNo,
          isQuickSummary: false
        }
      });
  }

  doContinue(value) {
    this.showHeader = true;
    if (value === '0') {
      this.patchFormValues();
    }
  }


  goForward() {
    this.loadQuoteDetails();
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
    this.isAttachmentArea = false;
  }

  get VehicleDetails() {
    return this.additionalDetails.controls.VehicleDetails as FormGroup;
  }

  get insuredDetails() {
    return this.additionalDetails.controls.insuredDetails as FormGroup;
  }

  get formCtrls() {
    return this.additionalDetails.controls;
  }

  get formCtrlsDoc() {
    return this.DocUploadForm.controls;
  }
  downloadDocuments() {
    let url = `quotes/quotePdfreport?quoteNumber=${this.quoteNo}`
    this.subscription = this.coreService.getDownload(url, '').subscribe((response) => {
      if (response) {
        if (window.navigator && window.navigator.msSaveBlob) {
          var newBlob = new Blob([response], { type: response.type })
          window.navigator.msSaveBlob(newBlob);
          return;
        }
        var link = document.createElement("a");
        link.href = URL.createObjectURL(response);
        link.download = `Motor_Insurance_Quote.pdf`;
        link.click();
      }
    })
  }

  openAttachment(value) {
    let fileName;
    if (value.type === 'scan')
      fileName = `${this.quoteDetails.quoteId}_0_${value.value}`;
    else
      fileName = `${this.quoteDetails.quoteId}_0_${value.value}`;
    this.subscription = this.coreService.mergeDocument('documentupload/downloadFile?fileName=' + fileName).subscribe((response: any) => {
      if (window.navigator && window.navigator.msSaveBlob) {
        var newBlob = new Blob([response], { type: response.type })
        window.navigator.msSaveBlob(newBlob);
        return;
      }
      var link = document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = value.value;
      link.click();
    });
  }

  sendMail() {
    let dialogRef = this.dialog.open(EmailPopupComponent, {
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
      width: '400px',
      data: {
        head: 'printpopup',
        name: 'this.name',
        mailId: this.mailId,
        docNo: this.quoteNo,
        selectedDocs: `MOT_TPL_QT_${this.quoteNo}_0.pdf`,
        transactionType: 'Q'
      },
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  printDocument() {
    this.subscription = this.coreService.mergeDocument(`quotes/quotePdfreport?quoteNumber=${this.quoteNo}`).subscribe((response: any) => {
      var blob = new Blob([response], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow.print();
    }, err => {
    });
  }

  reviseDetails() {
    this.router.navigate(['motor-info'], {
      queryParams: {
        quoteNo: this.quoteNo,
        reviseDetails: true
      }
    })
  }

  patchFormValues() {
    if ((this.isReviseDetails && (this.quoteDetails.vehicleDetails.mortgagedYN)) || this.isOldQuote && (this.quoteDetails.vehicleDetails.mortgagedYN)) {
      this.additionalDetails.patchValue({
        mortgagedYN: this.quoteDetails.vehicleDetails['mortgagedYN'],
      });
      this.additionalDetails.patchValue({
        bankName: this.quoteDetails.vehicleDetails['bankName'],
      });
    }
    if (this.quoteDetails.vehicleDetails['colorName']) {
      this.selectedColor = this.quoteDetails.vehicleDetails['colorName'];
    }
    if (this.quoteDetails.vehicleDetails['registrationMarkDesc']) {
      this.selectedPlate = this.quoteDetails.vehicleDetails['registrationMarkDesc'];
    }
    if (this.quoteDetails.userDetails['nationalityDesc']) {
      this.selectedNationality = this.quoteDetails.userDetails['nationalityDesc'];
    }
    if (this.quoteDetails.userDetails['professionName']) {
      this.selectedOccupation = this.quoteDetails.userDetails['professionName'];
    }
    //  to add fullName if fullNameBL not available
    if (this.quoteDetails.userDetails['fullNameBL']) {
      this.additionalDetails.patchValue({
        fullNameBL: this.quoteDetails.userDetails['fullNameBL'],
      });
    } else {
      this.additionalDetails.patchValue({
        fullNameBL: this.quoteDetails.userDetails['fullName'],
      });
    }
    this.additionalDetails.patchValue({
      // vehicle
      colorId: this.quoteDetails.vehicleDetails['colorName'],
      noOfDoors: this.quoteDetails.vehicleDetails['noOfDoors'],
      prevPolicyExpDate: this.quoteDetails.vehicleDetails['prevPolicyExpDate'],
      registrationMark: this.quoteDetails.vehicleDetails['registrationMarkDesc'],
    //  regNo: this.quoteDetails.vehicleDetails['regNo'],
      engineNo: this.quoteDetails.vehicleDetails['engineNo'],
      //Insured
      prefixBL: this.quoteDetails.userDetails['prefixBL'],
    
      prefix: this.quoteDetails.userDetails['prefix'],
      fullName: this.quoteDetails.userDetails['fullName'],
      occupation: this.quoteDetails.userDetails['professionName'],
      personalId: this.quoteDetails.userDetails['personalId'],
      licenseExpiryDate: this.quoteDetails.userDetails['licenseExpiryDate'],
      nationality: this.quoteDetails.userDetails['nationalityDesc'],
      address1: this.quoteDetails.userDetails['address1'],
      postBox: this.quoteDetails.userDetails['postBox'],
      address2: this.quoteDetails.userDetails['address2'],
      address4: this.quoteDetails.userDetails['address4'],
      taxId: this.quoteDetails.userDetails['taxId']
    });
    if (this.isReviseDetails || this.isOldQuote) {
    } else {
      this.additionalDetails.patchValue({
        prefixBL: this.quoteDetails.userDetails['prefix'],
       
      })
    }
    this.selectedBank = this.quoteDetails.vehicleDetails['bankName'];
    let effectivDate;
    effectivDate = moment(new Date());
    if (this.isReviseDetails || this.isOldQuote) {
      if (this.effDate) {
        //
        let startDateCheck = this.dateConversion(this.effDate);
        let currentTime = this.dateConversion(new Date());
        if (startDateCheck < currentTime) {
          effectivDate = moment(new Date());
        }
        //
        else {
          effectivDate = moment(this.effDate);
        }

      } else {
        effectivDate = moment(new Date());
      }
    } else {
      effectivDate = moment(new Date());
    }
    this.additionalDetails.patchValue({
      effectiveDate: effectivDate
    });
    this.currentEffDate = effectivDate;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field, index) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  //  get Uploaded List docs
  getUploadedDocs() {
    let params = {
      quotenumber: this.quoteDetails['quoteId']
    }
    this.subscription = this.coreService.getInputs('documentupload/uploadedDocs', params).subscribe((result: any) => {
      this.uploadedDocs = result;
      console.log(result)
      if (result.length === 11) {
        this.addMoreDoc = true;
        let sortedArray: any[] = result.sort((n1, n2) => n1.docId - n2.docId);
        sortedArray.forEach((element, index) => {
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          let fName = element.fileName.split('_0_');
          this.fileContainer.push(
            {
              typeId: element.polDoId,
              id: element.docId,
              controlName: `documentName${index + 1}`,
              value: fName[1] || null
            }
          )
        });
      } else if (result.length === 0 || result.length === 3) {
        this.getDocuments();
      }
      else {
        // first get mandatory docs
        this.getDocuments();
        this.addMoreDoc = false;
        // second get optional docs
        // if (this.uploadedDocs.length > 3)
        // this.addMoreDocuments();

      }
    });
  }

  clearFile() {
    var r = document.getElementById('fileUpload') as HTMLInputElement
    r.value = null;
  }

  selectFile(event, docId, i, label, labelAr) {
    if (!event.target.value)
      return;
    this.spinner.show();
    let selectedFileName = event.srcElement.files[0].name;
    const formData = new FormData();
    if (event.target.files.length > 1) {
      formData.append('files', event.target.files[1], selectedFileName);
      formData.append('files', event.target.files[0], 'back');
    } else {
      formData.append('files', event.target.files[0], selectedFileName);
    }
    formData.append('doctypeid', docId);
    formData.append('docDesc', label);
    formData.append('docDescAr', labelAr);
    formData.append('quotenumber', this.quoteDetails['quoteNumber']);
   
    this.subscription = this.coreService.postInputs('documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      let fName = response.fileName.split('_0_')
      this.fileContainer[i].value = fName[1];
    }, err => {
      this.spinner.hide();
      this.translate.get('FileUploadError').subscribe(value => {
        this.invalidFileFormat = value;
      });
      swal('', this.invalidFileFormat, 'error');
      // if (err.error === 'Maximum upload size exceeded') {
      //   swal('', err.error, 'error')
      // } else if (err.error === 'Internal Server Error') {
      //   swal('', 'Please upload jpg,png,pdf files less than 10MB', 'error')
      // } else {
      //   swal('', this.invalidFileFormat, 'error')
      // }
    })

  }


  // dynamic 
  addMoreDocuments() {
    if (this.addMoreDoc) {
      return;
    }
    let params = {
      quoteId: this.quoteDetails['quoteId'],
      loadAllDocs: 'Y'
    }
    if (this.DocUploadForm.status === 'INVALID') {
      this.translate.get('MandatoryDocuments').subscribe(value => {
        this.mandatoryDocuments = value;
      });
      swal('', this.mandatoryDocuments, 'error');
      return;
    }
    this.addMoreDoc = true;
    this.subscription = this.coreService.postInputs('documentupload/getUploadDocName', {}, params).subscribe((response: any) => {
      if (response) {
       
        response.forEach((element, index) => {
          let fName, f = [,];
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          if (this.uploadedDocs.length > 0) {
            fName = this.uploadedDocs.filter(ele =>
              ele.docId === element.polDoId.toString()
            );
            if (fName.length > 0) {
              f = fName[0].fileName.split('_0_');
              this.DocUploadForm.get(`documentName${index + 1}`).clearValidators();
              this.DocUploadForm.get(`documentName${index + 1}`).updateValueAndValidity();
            }
          }

          this.fileContainer.push({
            typeId: element.polDoId,
            id: element.displaySeq,
            label: element.polDocDes,
            labelAr: element.polDocDesAr,
            controlName: `documentName${index + 1}`,
            value: f[1] || null,
            message: `${element.polDocDes} is required`
          });
        });
        console.log(this.fileContainer)
      }
    });
    // this.subscription = this.coreService.postInputs('documentupload/getUploadDocName', {}, params).subscribe((response: any) => {
    //   let shallowcopy = this.fileContainer.slice();
    //   let value = shallowcopy.splice(1);
    //   const result = response.filter(({ displaySeq }) => !value.some(x => x.id == displaySeq));
    //   let index = 4;
    //   result.forEach((element) => {
    //     let fName, f = [,];
    //     this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
    //     if (this.uploadedDocs.length > 3) {
    //       fName = this.uploadedDocs.filter(ele =>
    //         ele.docId === element.displaySeq.toString()
    //       );
    //       if (fName.length > 0) {
    //         f = fName[0].fileName.split('_0_');
    //       }
    //     }
    //     this.fileContainer.push(
    //       {
    //         typeId: element.polDoId,
    //         id: element.displaySeq,
    //         label: element.polDocDes,
    //         controlName: `documentName${index + 1}`,
    //         value: f[1]
    //       }
    //     )
    //     index++;
    //   });
    // });
  }

  // get mandatory docs
  getDocuments() {
    let body = {
      quoteId: this.quoteDetails['quoteId'],
      loadAllDocs: "N"
    }
    this.subscription = this.coreService.postInputs('documentupload/getUploadDocName', {}, body).subscribe((response: any) => {
      if (response) {
        this.fileContainer = [];
        response.forEach((element, index) => {
          let fName, f = [,];
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          if (this.uploadedDocs.length > 0) {
            fName = this.uploadedDocs.filter(ele =>
              ele.docId === element.polDoId.toString()
            );
            if (fName.length > 0) {
              f = fName[0].fileName.split('_0_');
              this.DocUploadForm.get(`documentName${index + 1}`).clearValidators();
              this.DocUploadForm.get(`documentName${index + 1}`).updateValueAndValidity();
            }
          }

          this.fileContainer.push({
            typeId: element.polDoId,
            id: element.displaySeq,
            label: element.polDocDes,
            labelAr: element.polDocDesAr,
            controlName: `documentName${index + 1}`,
            value: f[1] || null,
            message: `${element.polDocDes} is required`
          });
        });
        console.log(this.fileContainer)
      }
    });
  }

  openDialog(docId, i, value, controlName): void {
    if (i === 0) {
      value = 'Vehicle Registration Card';
    }
    let dialogRef = this.dialog.open(RequestRedirectComponent, {
      panelClass: 'my-class',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
      data: { docId: docId, fileName: value, quoteNo: this.quoteDetails['quoteNumber'] }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let fileName = result.fileName.split('_0_');
        this.fileContainer[i].type = 'scan';
        // this.fileContainer[i].value = `${result.docDesc}`;
        this.fileContainer[i].value = fileName[1];

        this.DocUploadForm.value[controlName] = result.docDesc;
        this.DocUploadForm.controls[controlName].setErrors(null);
      }
    })
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
  }

  scanUpload(blob, docId, i, filename) {
    this.spinner.show();
    const formData = new FormData();
    formData.append('files', blob, filename);
    formData.append('doctypeid', docId);
    formData.append('docDesc', `${filename}`);
    formData.append('quotenumber', this.quoteDetails['quoteNumber']);
    this.subscription = this.coreService.postInputs('documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      this.fileContainer[i].value = filename;
    }, err => {
      this.spinner.hide();
    })
  }

  getCampus(stepper) {
    this.showHeader = true;
    stepper.next();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  onStepperSelectionChange(event: StepperSelectionEvent) {
    let stepLabel = event.selectedStep.label
    this.scrollToSectionHook();
  }

  private scrollToSectionHook() {
    const element = document.querySelector('.stepperTop');
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth', block: 'start', inline:
            'nearest'
        });
      }, 250);
    }
  }

  plateCodeFocusOut(event) {
    if (event.relatedTarget) {
      if (event.relatedTarget.className.includes('mat-option')) {
        return;
      }
    }
    if (!this.selectedPlate || this.selectedPlate !== this.additionalDetails.controls['registrationMark'].value) {
      this.additionalDetails.controls['registrationMark'].setValue(null);
      this.selectedPlate = '';
    }
  }

  bankNameFocusOut(event) {
    if (event.relatedTarget) {
      if (event.relatedTarget.className.includes('mat-option')) {
        return;
      }
    }
    if (this.showBankField) {
      if (!this.selectedBank || this.selectedBank !== this.additionalDetails.controls['bankName'].value) {
        this.additionalDetails.controls['bankName'].setValue(null);
        this.selectedBank = '';
      }
    }
  }

  occupationFocusOut(event) {
    if (event.relatedTarget) {
      if (event.relatedTarget.className.includes('mat-option')) {
        return;
      }
    }
    if (!this.selectedOccupation || this.selectedOccupation !== this.additionalDetails.controls['occupation'].value) {
      this.additionalDetails.controls['occupation'].setValue(null);
      this.selectedOccupation = '';
    }
  }

  nationalityFocusOut(event) {
    if (event.relatedTarget) {
      if (event.relatedTarget.className.includes('mat-option')) {
        return;
      }
    }
    if (!this.selectedNationality || this.selectedNationality !== this.additionalDetails.controls['nationality'].value) {
      this.additionalDetails.controls['nationality'].setValue(null);
      this.selectedNationality = '';
    }
  }

  colorFocusOut(event) {
    if (event.relatedTarget) {
      if (event.relatedTarget.className.includes('mat-option')) {
        return;
      }
    }
    if (!this.selectedColor || this.selectedColor !== this.additionalDetails.controls['colorId'].value) {
      this.additionalDetails.controls['colorId'].setValue(null);
      this.selectedColor = '';
    }
  }
  dropDownSelected(event: any, type) {
    if (type === 'bankName') {
      this.selectedBank = event.option.value;
    } else if (type === 'color') {
      this.selectedColor = event.option.value;
    } else if (type === 'plateCode') {
      this.selectedPlate = event.option.value;
    }
    else if (type === 'nationality') {
      this.selectedNationality = event.option.value;
    } 
    else if (type === 'occupation') {
      this.selectedOccupation = event.option.value;
    }
  }

  goBackToDashboard() {
    this.router.navigate(['/User/dashboard']);
  }
}


