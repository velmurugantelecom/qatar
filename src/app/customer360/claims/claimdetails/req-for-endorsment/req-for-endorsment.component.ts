import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service';
import { ViewChild, AfterViewInit, } from '@angular/core';
import swal from 'sweetalert'
import { MatDatepicker } from '@angular/material';
import { Moment } from 'moment';
import * as moment from 'moment';
import { CoreService } from 'src/app/core/services/core.service';
import { AppService } from 'src/app/core/services/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-req-for-endorsment',
  templateUrl: './req-for-endorsment.component.html',
  styleUrls: ['./req-for-endorsment.component.scss']
})
export class ReqForEndorsmentComponent implements OnInit {
  public language: any;
  public dateTime: Date;
  @ViewChild(MatDatepicker, { static: false }) picker: MatDatepicker<Moment>;
  isValidMoment: boolean = false;

  endorsmentreq: FormGroup;
  options: any = {};
  navParams: any = {};

  public minEffectiveDate;
  public maxEffectiveDate;
  public reqForType;
  public isLoggedInUser: boolean;
  public isContentLoaded: boolean;
  constructor(

    private router: Router,
    private formBuilder: FormBuilder,
    private service: Customer360Service,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private coreService: CoreService,
    private appService: AppService
  ) {


    // this.navParams = this.router.getCurrentNavigation().extras.state;

    this.route.queryParams
      .subscribe(params => {
        this.navParams['policyNo'] = params['policyNo'];
        this.navParams['productid'] = params['productid'];
        this.navParams['status'] = params['status']
      })


  }

  ngOnInit() {

    this.appService._manualLanguageChange.subscribe(value => {
     if (value && this.isContentLoaded && this.router.url.includes('ReqForEndorsment')) {
        this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
      }
    }
    );
    this.endorsmentreq = this.formBuilder.group({
      policyNo: ['', [Validators.required]],
      altMailId: ['', [Validators.required]],
      altMobileCode: ['', Validators.required],
      altMobileNbr: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
      reason: ['', [Validators.required]],
      subType: ['', []],
      effectiveDate: [new Date(new Date().setHours(0, 0, 0, 0)), [Validators.required]],
      type: ['', [Validators.required]],
    
    });

    this.endorsmentreq.patchValue({ policyNo: this.navParams.policyNo });
    this.service.ongetpolicyno.subscribe((value: any) => {
      if (value.data != undefined) {
        this.endorsmentreq.patchValue({
          altMobileCode: value.data.userDetails.mobileCode,
          altMailId: value.data.userDetails.email,
          altMobileNbr: value.data.userDetails.mobileNo
        });

        //setting min and max date for effective date
        // this.minEffectiveDate = moment(new Date(value.data.startDate)).format("YYYY-MM-DD");
        this.minEffectiveDate = new Date(new Date().setHours(0, 0, 0, 0));
        this.maxEffectiveDate = new Date(value.data.endDate);
      }
      if (localStorage.getItem("isLoggedIn") == "true") {
        this.getreasonforchange();
        this.gettype();
      }
    });
    this.language = localStorage.getItem("language");
    this.coreService.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['mobileCode'] = response['data'];
    });
    this.isContentLoaded = true;
  }

  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  ngAfterViewInit() {
    this.picker._selectedChanged.subscribe(
      (newDate: Moment) => {
        this.isValidMoment = moment.isMoment(newDate);
      },
      (error) => {
        throw Error(error);
      }
    );
  }

  getreasonforchange() {
    let url = `options/list`;
    let values = { optionType: 'E001', productId: this.navParams.productid };
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['reasonForChange'] = data;
    });
  }

  gettype() {
    let url = `endorsement/findEndorsementType`;
    let values = {
      productId: this.navParams.productid
    };
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['endorsmentType'] = data;
      if(this.language =='en'){
        this.options['endorsmentType'].push(
          {
            "endorsementTypeId": "ET01",
            "endorsementSubTypeId": "ET01_ALL",
            "cancellationId": null,
            "cancellationDec": null,
            "endorsementReasonTypeId": null,
            "endorsementSubTypeDec": "Others",
            "endorsementTypeName": null
          }
        )
      }else if(this.language =='ar'){
        this.options['endorsmentType'].push(
          {
            "endorsementTypeId": "ET01",
            "endorsementSubTypeId": "ET01_ALL",
            "cancellationId": null,
            "cancellationDec": null,
            "endorsementReasonTypeId": null,
            "endorsementSubTypeDec":"آحرون",
            "endorsementTypeName": null
          }
        )
      }
     
    });
  }

  getsubtype(endorsmentId) {
    this.options['endorsmentType'].forEach(element => {
      if (element.endorsementSubTypeDec === endorsmentId.value) {
        this.endorsmentreq.patchValue({
          subType: element.endorsementSubTypeId
        });
        this.reqForType = element.endorsementTypeId
      }
    });
  }

  onsubmit() {
  
    console.log(this.endorsmentreq)
    if (this.endorsmentreq.status == 'INVALID') {
      return
    }
    
    let values = this.endorsmentreq.value;
    console.log(values)
    let effectiveDate;
    if (values['effectiveDate']['_d'])
      effectiveDate = new Date(values['effectiveDate']['_d']);
    else
      effectiveDate = new Date(values['effectiveDate']);
    // effectivedate.setDate(effectivedate.getDate() + 1);
    values['effectiveDate'] = effectiveDate;
    values['type'] = this.reqForType;
    let loDate = this.dateConversion(values.effectiveDate);
    let temp = moment(new Date()).format('HH:mm').toString();
    loDate = loDate.concat('T' + temp + ':00.000Z');
    values['effectiveDate'] = loDate;
   this.spinner.show();
    this.service.requestForEndorsement1(values,'').subscribe(
      (data: any) => {
        this.spinner.hide();
        swal(
          '', data, 'success'
        ).then(val => {
          this.customer360();
        });
      },
      err => {
        this.spinner.hide()
        this.customer360();
      }
    );
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
  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
  }
  policyPage() {
    this.router.navigate(['/User/dashboard']);
  }



}
