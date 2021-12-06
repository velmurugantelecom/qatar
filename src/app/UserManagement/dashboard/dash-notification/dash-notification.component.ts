import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort, MatDialog, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA, MatBottomSheet, ThemePalette } from '@angular/material';
import { Subscription } from 'rxjs';
import { CoreService } from 'src/app/core/services/core.service';
import { Customer360Service } from '../../../customer360/customer360.service';
import { ActivatedRoute, Router } from '@angular/router';
import { chooseProduct } from 'src/app/shared/product-selection/product-selection.component';
import { AppService } from 'src/app/core/services/app.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DropDownService } from 'src/app/core/services/dropdown.service';
import { PageEvent } from '@angular/material/paginator';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dash-notification',
  templateUrl: './dash-notification.component.html',
  styleUrls: ['./dash-notification.component.scss']
})
export class DashNotificationComponent implements OnInit {
  displayedColumns: string[] = ['quoteNo', 'insuredName', 'product', 'emailId', 'status', 'eye'];
  selectedColumns: any = [];
  tableData: any = [];
  subscription: Subscription;
  dataSource: any;
  mobDataSource: any = {};
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  panelOpenState = true;
  activeQuotes: String = 'Quotes';
  notificationType: Number = 267;
  notificationCount: any;
  quoteCount: any;
  renewalCount: any;
  paymentCount: any;
  quoteData: any;
  renewalData: any;
  paymentData: any;
  inputData: any = {};
  public autoDataURL = '';
  pageEvent: PageEvent;
  totalRecords: any;
  quoteTypeValue: any;
  screenType;
  tableType;
  breakPoint: any;
  public productTypeAlert: any;
  public language: any;
  public selectedIndex = 1;
  public showTab;
  public isContentLoaded: boolean;
  constructor(private postService: CoreService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private _bottomSheet: MatBottomSheet,
    public runtimeConfigService: RuntimeConfigService,
    private router: Router, public dialog: MatDialog,
    private dropdownservice: DropDownService, private spinner: NgxSpinnerService, private appService: AppService) {
    this.selectedColumns['Quotes'] = ['quoteNo', 'insuredName', 'product', 'emailId', 'status', 'eye'];
    this.selectedColumns['Renewal'] = ['quoteNo', 'insuredName', 'product', 'startDate', 'endDate', 'status'];
    this.selectedColumns['Payment'] = ['refNo', 'insuredName', 'dueDate', 'amount'];
    this.selectedColumns['Policy'] = ['policyNo', 'quoteNo', 'startDate', 'endDate', 'product', 'status', 'eye'];
    this.route.queryParams.subscribe(params => {
      this.showTab = params['show'];
    });
  }


  ngOnInit() {
    this.init();
    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoaded) {
        this.activeQuotes = 'Quotes';
        this.displayedColumns = this.selectedColumns['Quotes'];
        this.init();
      }
    });
  }

  init() {
    if (this.showTab === 'policy') {
      this.selectedIndex = 0;
      this.getPolicy();
      this.isContentLoaded = true;
      this.tableType = 'Policy Details';
      this.activeQuotes = 'Policy'
      this.displayedColumns = this.selectedColumns['Policy']
    } else {
      this.getQuoteList('FQ');
      this.isContentLoaded = true;
      this.tableType = 'Quote Details';
    }
    if (screen.width >= 768) {
      this.screenType = 1;
    } else if (screen.width >= 576) {
      this.screenType = 2
    } else if (screen.width < 576) {
      this.screenType = 3
    }
    if (screen.width < 700) {
      this.breakPoint = 1;
    } else {
      this.breakPoint = 2;
    }
    this.language = localStorage.getItem("language");
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }

  onResize(event) { //to adjust to screen size
    if (screen.width >= 768) {
      this.screenType = 1;
    } else if (screen.width >= 576) {
      this.screenType = 2
    } else if (screen.width < 576) {
      this.screenType = 3
      this.breakPoint = 1;
    }
    if (screen.width < 700) {
      this.breakPoint = 1;
    } else {
      this.breakPoint = 2;
    }
  }
  getQuoteList(quoteType) {
    this.quoteTypeValue = quoteType;
    let params = {
      'page': 0,
      'pageSize': 5,
      'quoteType': this.quoteTypeValue
    };
    if (localStorage.getItem("isLoggedIn") == "true") {
    this.dropdownservice.getInputs('search/quotes/findAll', params).subscribe(result => {
      this.totalRecords = result.totalRecords;
      if (!result || result.length === 0) {
        return;
      }
      // to filter valid quotes
      // let tempArray = [];
      // result.data.forEach((quote) => {
      //   let sgsId = quote.sgsId + '';
      //   if (quote.quoteNo != sgsId) {
      //     tempArray.push(quote);
      //   }
      // })
      this.tableData = result.data;
      this.mobDataSource['data'] = result.data;
      this.mobDataSource['typeOfData'] = 'quote';
      this.dataSource = new MatTableDataSource<any>(this.tableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, err => {
    });
  }
  }
  getPaymentDetail() {
    this.dataSource = null;
    this.activeQuotes = 'Payment';
    this.displayedColumns = this.selectedColumns['Payment'];
    let params = {
      'page': 0,
      'pageSize': 5,
    };
    this.postService.getInputs('dashboard/outstandingDueAmount', params).subscribe((result: any) => {
      this.dataSource = new MatTableDataSource<any>(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  fetchData(type) {
    this.activeQuotes = type;
    this.tableData = {};
    this.dataSource = null;
    this.displayedColumns = this.selectedColumns[type];
    switch (type) {
      case 'Quotes':
        this.getQuoteList('FQ');
        this.tableType = 'Quote Details';
        break;
      case 'Renewal':
        this.getQuoteList('RQ');
        this.tableType = 'Renewal Details';
        break;
      case 'Policy':
        this.getPolicy();
        this.tableType = 'Policy Details';
        break;
      case 'Payment':
        this.getPaymentDetail();
        break;
      case 'Comments':
        return;
    }
  }

  getPolicy() {
    let params = {
      quoteType: 'p',
      page: 0,
      pageSize: 5,
    };
    this.spinner.show();
    this.dropdownservice.getpolicy(params).subscribe((data: any) => {
      this.spinner.hide();
      this.mobDataSource = data;
      this.mobDataSource['typeOfData'] = 'policy';
      this.tableData = data.data;
      this.totalRecords = data.totalRecords;
      this.dataSource = new MatTableDataSource<any>(this.tableData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.tableType = 'Policy Details'
    }, err => {
      this.spinner.hide();
    })
  }


  onPaginateChange(event: PageEvent) {
    let page = event.pageIndex;
    let size = event.pageSize;

    if (this.activeQuotes == "Policy") {
      let params = {
        quoteType: 'p',
        page: page,
        pageSize: size,
      };
      this.spinner.show();
      this.dropdownservice.getpolicy(params).subscribe((data: any) => {
        this.spinner.hide();
        this.mobDataSource = data;
        this.mobDataSource['typeOfData'] = 'policy';
        this.tableData = data.data;
        this.dataSource = new MatTableDataSource<any>(this.tableData);
        this.dataSource.sort = this.sort;
      }, err => {
        this.spinner.hide();
      })
    }
    else if (this.activeQuotes == "Quotes" || this.activeQuotes == "Renewal") {
      let params = {
        'page': page,
        'pageSize': size,
        'quoteType': this.quoteTypeValue
      };
      this.spinner.show();
      this.dropdownservice.getInputs('search/quotes/findAll', params).subscribe(result => {
        this.spinner.hide();
        if (!result || result.length === 0) {
          return;
        }
        this.tableData = result.data;
        this.mobDataSource['data'] = result.data;
        this.mobDataSource['typeOfData'] = 'quote';
        this.dataSource = new MatTableDataSource<any>(this.tableData);
        this.dataSource.sort = this.sort;
      }, err => {
        this.spinner.hide();
      });
    }


  }

  navpage(element) {
    this.router.navigate([`/Customer360`], { queryParams: { policyNo: element.policyNo, status: element.statusId } });
  }

  openDialog(Type: string, Title: string): void {
    localStorage.setItem('isPlanCalculated', 'false');
    this.dialog.open(chooseProduct, {
      width: '350px',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
      autoFocus: false,
      data: { QType: Type, QTitle: Title }
    });
  }
  // NewQuote() {
  //   this.openDialog('Product Type', 'Product Type');
  // }
  
  NewQuote() {
    this.translate.get('ProductType').subscribe(value => {
        this.productTypeAlert = value;
    });
    let dialogRef = this.dialog.open(chooseProduct, {
        width: '350px',
        direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
        autoFocus: false,
        data: { QType: this.productTypeAlert, QTitle: this.productTypeAlert }
    });
  }
  



  showDetails(quote) {
    if (quote.statusId === "WIP" || quote.statusId === "MR") {
      this.router.navigate(['/additional-details'], { queryParams: { quoteNo: quote.quoteNo, retrieveQuote: true } });
    } else if (quote.statusId === 'VF' || quote.statusId === "MA" || quote.statusId === "RA") {
      this.router.navigate([`/quote-summary`], { queryParams: { quoteNo: quote.quoteNo, validQuote: false } });
    }
  }

  showBottomSheet(data) {
    data['tableType'] = this.tableType;
    this._bottomSheet.open(DashboardBottomSheet, {
      data: { data: data }
    });
  }

  onTabChanged(event) {
    if (event.index === 0) {
      this.fetchData('Policy')
    } else if (event.index === 1) {
      this.fetchData('Quotes')
    }
  }
}

@Component({
  selector: 'bottom-sheet-overview-example-sheet2',
  templateUrl: 'mat-bottom-sheet.html',
})
export class DashboardBottomSheet {

  public data: any;
  constructor(private _bottomSheetRef: MatBottomSheetRef<DashboardBottomSheet>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data1: any,
    public runtimeConfigService: RuntimeConfigService) {
    this.data = data1.data;
  }

  closeSheet(): void {
    this._bottomSheetRef.dismiss();
  }
}