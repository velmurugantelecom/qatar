import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Customer360Service } from './customer360.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatBottomSheet } from '@angular/material';
import { AppService } from '../core/services/app.service';
@Component({
  selector: 'app-customer360',
  templateUrl: './customer360.component.html',
  styleUrls: ['./customer360.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class Customer360Component implements OnInit {
  searchform: FormGroup
  public searchlist: any = [];
  public productName = '';
  public PolicyList: any = [];
  public claims: any = [];
  public endorsementList: any = [];
  public language: any;
  hidetab: any;
  public currentpolicy: any = [];
  public claimdisplay: boolean;
  iconDir = localStorage.getItem('language');
  searchheader: string = '';
  displayedColumns: string[] = ['Claims', 'IntimatedOn', 'lossOn', 'Reserve', 'Settled', 'Balance', 'Status', 'eye'];
  endorsementColumns: string[] = ['Endorsement No', 'VAT Applied', 'From Date', 'To Date', 'Status']
  dataSource: any;
  options: any = {}
  showAdvancedSearch: boolean = false;
  productid;
  navParams: any = [];
  policyNo
  panelOpenState = false;
  showClaimBtns = true;
  isContentLoaded = false

  constructor(private spinner: NgxSpinnerService,
    private appService: AppService,
    private _bottomSheet: MatBottomSheet,
    public runtimeConfigService: RuntimeConfigService,
    private customerService: Customer360Service, private router: Router, private route: ActivatedRoute) {
    this.route.queryParams
      .subscribe(params => {
        this.policyNo = params['policyNo'];
        if (params['status'] != 'CTP') {
          this.showClaimBtns = false;
        }
      })


  }
 ngOnInit() {
    this.language = localStorage.getItem("language");
    this.init();
    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoaded) {
        this.iconDir = localStorage.getItem('language');
        if (localStorage.getItem("isLoggedIn") == "true") {
        this.init();
        }
      }
    });
  }

  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  init() {
    //this.spinner.show();
    this.getclaims(this.policyNo);
    this.getEndorsementList(this.policyNo);
    this.isContentLoaded = true;
  }
  getEndorsementList(policyNo) {
    let params = {
      policyNo: policyNo,
    };
    this.customerService.getEndorsementList(params).subscribe((data: any) => {
      this.endorsementList = data;
     // this.spinner.hide();

    }, err => {
     // this.spinner.hide();
    });
  }
  getclaims(policyNo) {
    let params = {
      policyNo: policyNo,
    };
    this.customerService.getclaims(params).subscribe((data: any) => {
      this.claims = data;
      this.claimdisplay = true;
     // this.spinner.hide();

    }, err => {
     // this.spinner.hide();
    });
    this.customerService.getItems(params)
    // setTimeout(() => {
    this.customerService.ongetpolicyno.subscribe(value => {
      if (value.data) {
        this.currentpolicy = value.data;
        if (localStorage.getItem('language') === 'en')
          this.productName = this.currentpolicy.productTypeName;
        else
          this.productName = this.currentpolicy.productTypeNameAr;
      }
    }, err => {
    })
    // }, 4000);
  }

  navigateclaims(url) {
    this.router.navigate([`/${url}`], { queryParams: { policyNo: this.currentpolicy.policyNo, productid: this.currentpolicy.productTypeId, status: this.currentpolicy.status } });
  }

  showBottomSheet(element) {
    this._bottomSheet.open(Customer360BottomSheet, {
      data: { data: element }
    });
  }

  goBack() {
    this.router.navigate(['/User/dashboard']);
  }
}

@Component({
  selector: 'bottom-sheet-overview-example-sheet3',
  templateUrl: 'mat-bottom-sheet-customer360.html',
})
export class Customer360BottomSheet {

  public data: any;

  constructor(private _bottomSheetRef: MatBottomSheetRef<Customer360BottomSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data1: any,
    public runtimeConfigService: RuntimeConfigService) {
    this.data = data1.data;
  }

  closeSheet(): void {
    this._bottomSheetRef.dismiss();
  }
}