import { Component, OnInit, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service';
import { ClaimdetailsComponent } from '../claimdetails.component';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _moment from "moment";
import swal from 'sweetalert'
import { CoreService } from 'src/app/core/services/core.service';
import { AppService } from 'src/app/core/services/app.service';
const moment = _moment;

@Component({
  selector: 'app-req-for-cancellation',
  templateUrl: './req-for-cancellation.component.html',
  styleUrls: ['./req-for-cancellation.component.scss']
})
export class ReqForCancellationComponent implements OnInit, AfterViewInit {
  cancelReq: FormGroup;
  public language: any;
  options: any = {};
  navParams: any = {};
  public minEffectiveDate;
  public maxEffectiveDate: Date;
  public isContentLoaded: boolean;

  @ViewChild(ClaimdetailsComponent, { static: false }) ClaimDetail: ClaimdetailsComponent;
  constructor(
    private coreService: CoreService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private service: Customer360Service,
    private appService: AppService) {
    // this.navParams = this.router.getCurrentNavigation().extras.state;

    this.route.queryParams
      .subscribe(params => {
        this.navParams['policyNo'] = params['policyNo'];
        this.navParams['productid'] = params['productid'];
        this.navParams['status'] = params['status']

      })



  }

  ngOnInit() {
    // console.log(moment(new Date()).format('hh:mm:ss'))

    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoaded && this.router.url.includes('ReqForCancalletion')) {
        this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });

      }
    });

    this.cancelReq = this.formBuilder.group({
      policyNo: ['', [Validators.required,]],
      reason: ['', [Validators.required,]],
      remarks: ['', [Validators.required,]],
      effectiveDate: [new Date(new Date().setHours(0, 0, 0, 0)), [Validators.required,]],
      altMobileCode: ['', Validators.required],
      altMobileNbr: ['', [Validators.required,]],
      altMailId: ['', [Validators.required,]]
    });

    this.service.ongetpolicyno.subscribe((value: any) => {
      if (value.data != undefined) {
        this.cancelReq.patchValue({ altMobileCode: value.data.userDetails.mobileCode, altMailId: value.data.userDetails.email, altMobileNbr: value.data.userDetails.mobileNo })

        //setting min and max date for effective date
        this.minEffectiveDate = moment(new Date(value.data.startDate)).format("YYYY-MM-DD");
        // this.maxEffectiveDate = new Date(value.data.endDate);
        this.maxEffectiveDate = new Date(new Date().setHours(0, 0, 0, 0));
      }

    })
    this.getReasons();
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

  getReasons() {
    let url = `options/find`
    let values = {
      optionType: "E001", productId: this.navParams.productid,
      optionId: "E001"
    }
    this.service.getdropdownvaluesdbsync(url, values).subscribe((data: any) => {
      this.options['reasonForChange'] = [];
      this.options['reasonForChange'].push(data);
    })
  }

  ngAfterViewInit() {
    this.cancelReq.patchValue({ policyNo: this.ClaimDetail.policyarr.policyNo })
  }

  onsubmit() {
    
    if (this.cancelReq.status == 'INVALID') {
      return
    }
    let values = this.cancelReq.value;

    // let effectiveDate = new Date(values['effectiveDate']);
    // effectiveDate.setDate(effectiveDate.getDate() + 1);
    // values['effectiveDate'] = effectiveDate;
    let effDate = this.dateConversion(values.effectiveDate);
    let temp = moment(new Date()).format('HH:mm').toString();
    console.log(temp)
    effDate = effDate.concat('T' + temp + ':00.000Z');
    values['effectiveDate'] = effDate;
    console.log(effDate)
    this.spinner.show();
    this.service.requestForCancellation1(values,'').subscribe((data: any) => {
      this.spinner.hide();
      swal(
        '', data, 'success'
      ).then(val => {
        this.customer360();
      });
    }, err => {
      this.spinner.hide();
      this.customer360();
      
    });
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

  get formCtrls() {
    return this.cancelReq.controls;
  }

  onDateChange(event) {
  }



  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
  }
  policyPage() {
    this.router.navigate(['/User/dashboard']);
  }
}
