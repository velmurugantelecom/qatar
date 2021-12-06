import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from '../core/services/core.service';
import { AppService } from '../core/services/app.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as $ from 'jquery';
import swal from 'sweetalert';
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { TranslateService } from '@ngx-translate/core';
import { DropDownService } from '../core/services/dropdown.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicContentDialog } from '../shared/dynamic-content/dynamic-content.component';
import { RuntimeConfigService } from 'src/app/core/services/runtime-config.service';
import { DataService } from 'src/app/core/services/data.service';
export const MY_NATIVE_FORMATS = {
  fullPickerInput: 'DD/MM/YYYY hh:mm a',
};

@Component({
  selector: "app-quote-summary",
  templateUrl: "./quote-summary.component.html",
  styleUrls: ["./quote-summary.component.scss"],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
  ]
})
export class QuoteSummaryComponent implements OnInit {

  public plandetail: any = {};
  public quoteNo: any;
  public quoteNumber: any;
  public selectedPlan: any;
  public quoteDetails: any;
  public isAgreedTerm1: boolean;
  public isAgreedTerm2: boolean;
  public isQuickSummary = 'true';
  public attachments: any;
  public pageHeader: any;
  public summaryFor: any;
  public grossPremium;
  public selectedCovers = [];
  public mailId: string;
  public ncdDeclaration: boolean
  public needNcdDeclaration: boolean;
  public isValidQuote = 'true';
  public language: any;
  public offersStatus = true;
  public showNCDDisError: boolean;
  public isContentLoadded: boolean;
  public productTypeName = '';
  constructor(private router: Router, private coreService: CoreService,
    private route: ActivatedRoute,
    private appService: AppService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private dropdownservice: DropDownService,
    public dialog: MatDialog,
    public runtimeConfigService: RuntimeConfigService,
    private dataService: DataService,) {

    this.route.queryParams
      .subscribe(params => {
        this.quoteNo = params['quoteNo'];
        this.isQuickSummary = params['isQuickSummary'];
        this.isValidQuote = params['validQuote'];
        if (this.isValidQuote != 'false') {
          this.isValidQuote = 'true';
        }
      });
    this.translate.get('QuoteSummary').subscribe(value => {
      this.pageHeader = value;
    });
  }

  ngOnInit() {
    let url = "quotes/quoteDetailsSummary";
    if (this.quoteNo.startsWith('P')) {
      this.router.navigate(['/User/dashboard'], { queryParams: { show: 'policy' } });
      return;
    }
    let params = {
      quoteNumber: this.quoteNo
    }
    this.dropdownservice.getInputs(url, params).subscribe((response) => {
      this.isContentLoadded = true;
      this.quoteDetails = response.data.quoteSummary;
      this.mailId = this.quoteDetails.userDetails.email;
      if (localStorage.getItem('language') === 'ar')
        this.productTypeName = this.quoteDetails.productTypeNameAr
      else
        this.productTypeName = this.quoteDetails.productTypeName
      this.coverageMakeover();
      let netPremium = response.data.quoteSummary.risks[0].netPremium
      let vat = response.data.quoteSummary.risks[0].vat
      this.grossPremium = netPremium - vat;
      let params1 = {
        quotenumber: this.quoteDetails['quoteId']
      }
      this.coreService.getInputs(`documentupload/uploadedDocs`, params1).subscribe(response => {
        response.forEach(file => {
          let nameArray = file.fileName.split('_0_');
          file.fileName = nameArray[1];
          if (file.fileName.toLowerCase().includes('pdf')) {
            file['src'] = './assets/sharedimg/pdf.png'
          } else if (file.fileName.toLowerCase().includes('jpg') || file.fileName.toLowerCase().includes('png') || file.fileName.toLowerCase().includes('jpeg')) {
            file['src'] = './assets/sharedimg/image-icon.png';
          } else {
            file['src'] = './assets/sharedimg/image-icon.png';
          }
        });
        this.attachments = response;
      });
    }, err => {
      let errorMsg = err.error.text || err.error.error || err.error;
      if (errorMsg === 'Quote not found' && localStorage.getItem('isLoggedIn') === 'true' && this.isQuickSummary === 'false') {
        let params = {
          quoteNo: this.quoteNo
        }
        this.coreService.getInputs2('portal-service/search/policies/findAll', params).subscribe(value => {
          if (value.totalRecords > 0) {
            swal('', 'Quote converted to policy', 'success').then(val => {
              this.router.navigate(['/User/dashboard'], { queryParams: { show: 'policy' } });
            });
          } else {
            swal('', errorMsg, 'error');
          }
        })
      } else {
        swal('', errorMsg, 'error');
      }
    });
    if (this.isQuickSummary == 'false') {
      this.translate.get('SummaryForThe').subscribe(value => {
        this.summaryFor = value;
      });
      this.pageHeader = this.summaryFor + ' ' + this.quoteNo;
    }
    this.language = localStorage.getItem("language");
    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoadded) {
        this.coverageMakeover()
      }
    })
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
      if (this.isQuickSummary == 'false') {
        this.translate.get('SummaryForThe').subscribe(value => {
          this.summaryFor = value;
        });
        this.pageHeader = this.summaryFor + ' ' + this.quoteNo;
      }
      else if (this.isQuickSummary == 'true') {
        this.translate.get('QuoteSummary').subscribe(value => {
          this.pageHeader = value;
        });
      }

    }
  }

  coverageMakeover() {
    this.selectedCovers = [];
    if (localStorage.getItem('language') === 'ar') {
      this.productTypeName = this.quoteDetails.productTypeNameAr;
      this.quoteDetails.risks[0].coverages.forEach(coverage => {
        this.selectedCovers.push(coverage['coverageDescAr']);
      });
    } else {
      this.productTypeName = this.quoteDetails.productTypeName;
      this.quoteDetails.risks[0].coverages.forEach(coverage => {
        this.selectedCovers.push(coverage['coverageDesc']);
      });
    }
  }

  isAgreedStatus(event) {
    if (event.source.id === 'terms1') {
      this.isAgreedTerm1 = event.checked;
    } else if (event.source.id === 'terms2') {
      this.isAgreedTerm2 = event.checked;
    }
  }

  generateQuote() {
    this.scrollToSectionHook();
    this.spinner.show();
    this.showNCDDisError = false;
    this.coreService.postInputs1('generateQuote', this.quoteDetails.quoteId,'').subscribe(res => {
      this.spinner.hide()
      this.quoteNumber = res;
      this.appService.setQuoteDetails(this.quoteDetails);
      // this.sendMail();
      this.router.navigate(['/additional-details'], { queryParams: { quoteNo: this.quoteNumber } });
    }, err => {
      this.spinner.hide()
    })
  }

  generatePolicy() {
    this.router.navigate([`/payment-succeed`], { queryParams: { quoteNo: this.quoteNo } })
  }

  makePayment() {
    this.spinner.show();
    let body = {
      quoteNo: this.quoteDetails['quoteId']
    }
    if (this.offersStatus)
      body['adYn'] = 'Y';
    else
      body['adYn'] = 'N';
    this.coreService.postInputs2('insured/dnd', '', body).subscribe(res => {
    });
    let PaymentPageLoader = 'PaymentPageLoaderContent';
    this.dataService.setMotorPageLoaderContent(PaymentPageLoader);

    this.coreService.paymentService(this.quoteNo).subscribe(response => {
      let PaymentPageLoader = '';
      this.dataService.setMotorPageLoaderContent(PaymentPageLoader);
      this.spinner.hide();
      if (response) {
        let form = document.createElement("form");
        form.setAttribute('method', "post");
        form.setAttribute('action', response['paymentUrl']);

        let input = document.createElement("input");
        input.type = "text";
        input.name = `TransactionID`;
        input.id = `TransactionID`;
        input.value = `${response['TransactionID']}`;

        form.appendChild(input);

        let btn = document.createElement("button");
        btn.id = `submitBtn`;
        btn.value = `submit`;
        btn.type = `submit`;
        form.appendChild(btn);

        $("body").append(form);
        $("#submitBtn").trigger("click");
      }
    }, err => {
      let PaymentPageLoader = '';
      this.dataService.setMotorPageLoaderContent(PaymentPageLoader);
      this.spinner.hide();
    });
  }

  goBack() {
    let value = {
      quoteNo: this.quoteNo,
      reviseDetails: true,
      goTo: 3
    }
    if (this.isQuickSummary === 'true') {
      this.router.navigate(['/compare-plans']);
    } else {
      this.router.navigate(['/additional-details'], {
        queryParams: value
      });
    }
  }

  openAttachment(value) {
    let fName = `${this.quoteDetails.quoteId}_0_${value}`;
    this.coreService.mergeDocument('documentupload/downloadFile?fileName=' + fName).subscribe((response: any) => {
      if (window.navigator && window.navigator.msSaveBlob) {
        var newBlob = new Blob([response], { type: response.type })
        window.navigator.msSaveBlob(newBlob);
        return;
      }
      var link = document.createElement("a");
      link.href = URL.createObjectURL(response);
      link.download = value;
      link.click();
    });
  }
  sendMail() {
    let docNo = this.quoteNumber;
    let url = 'quotes/sendquotes?quoteNumber=' + docNo + '&toEmailAddr=' + this.mailId;
    this.coreService.getOptions(url).subscribe((result: any) => {
      if (result.status === 200) {
      }
    })
  }

  readTermsAndCond(value) {
    let file;
    let windowName;
    console.log(value)
    switch (value) {
      case 1: {
        this.translate.get('TermsAndCondFile').subscribe(value => {
          file = value;
        });
        this.translate.get('TermsAndCondWindowName').subscribe(value => {
          windowName = value;
        });
        break;
      }
      case 2: {
        this.translate.get('PrivacyPolicyFile').subscribe(value => {
          file = `${value + this.quoteDetails.planId + '.pdf'}`;
        });
        this.translate.get('PrivacyPolicyWindowName').subscribe(value => {
          windowName = value;
        });
        break;
      }
      case 3: {
        this.translate.get('RefundPolicyFile').subscribe(value => {
          file = value;
        });
        this.translate.get('RefundPolicyWindowName').subscribe(value => {
          windowName = value;
        });
        break;
      }
    }
    let param = {
      fileName: file
    }
    console.log(param)
    this.spinner.show();
    this.coreService.getDownload('document/downloadPDF', param).subscribe(response => {
      const userAgent = window.navigator.userAgent;
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        var newBlob = new Blob([response], { type: response.type })
        window.navigator.msSaveOrOpenBlob(newBlob);
        this.spinner.hide();
      } else if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i)) { //Safari & Opera iOS
        var url = window.URL.createObjectURL(response);
        window.location.href = url;
        this.spinner.hide();
      } else {
        let fileUrl = window.URL.createObjectURL(response);
        var newWindow = window.open(fileUrl, '_blank');
        setTimeout(function () {
          newWindow.document.title = windowName;
        }, 3000);
        this.spinner.hide();
      }
    }, err => {
      this.spinner.hide();
    })
  }

  readNCDDeclaration() {
    const dialogRef = this.dialog.open(DynamicContentDialog, {
      width: '60%',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe(result => {
    });
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
}
