import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Customer360Service } from '../../../customer360.service'
import swal from 'sweetalert'
import { ClaimdetailsComponent } from '../claimdetails.component';
import { DatePipe } from '@angular/common';

import * as _moment from "moment";
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'src/app/core/services/core.service';
import { MatDialog } from '@angular/material';
import { RequestRedirectComponent } from 'src/app/shared/request-redirect/request-redirect.component';
import { AppService } from 'src/app/core/services/app.service';
const moment = _moment;


@Component({
  selector: 'app-report-aloss',
  templateUrl: './report-aloss.component.html',
  styleUrls: ['./report-aloss.component.scss'],
  providers: [DatePipe]
})
export class ReportALOssComponent implements OnInit {
  public language: any;
  FnolCreated : any;
  ReportaLoss: FormGroup;
  policyarr: any
  currentDate: any;
  navParams: any = {};
  minDate: any;
  minLossDate;
  maxLossDate;
  maxIntimatedDate: any;
  minIntimatedDate: any;
  @ViewChild(ClaimdetailsComponent, { static: false }) ClaimDetail: ClaimdetailsComponent;
  fileContainer = [];
  public invalidFileFormat: any;
  options: any = {};
  public radioError: boolean;
  public isContentLoaded: boolean;

  constructor(private datePipe: DatePipe, private router: Router, private route: ActivatedRoute,
    private appService: AppService,
    private dialog: MatDialog,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private coreService: CoreService,
    private formBuilder: FormBuilder, private service1: Customer360Service) {
    this.route.queryParams
      .subscribe(params => {
        this.navParams['policyNo'] = params['policyNo'];
        this.navParams['productid'] = params['productid'];
        this.navParams['status'] = params['status']
        console.log(this.router.url)
      })


  }

  ngOnInit() {
    this.appService._manualLanguageChange.subscribe(value => {
      if (value && this.isContentLoaded && this.router.url.includes('ReportLoss')) {
        this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
      }
    });

    this.ReportaLoss = this.formBuilder.group({
      policyNo: [[Validators.required,]],
      lossDate: ['', [Validators.required,]],
      intimatedDate: [new Date(new Date().setHours(0, 0, 0, 0)), [Validators.required,]],
      lossDescription: ['', [Validators.required,]],
      policeStation: ['', [Validators.required,]],
      policeReportNo: ['', [Validators.required,]],
      lossLocation: ['', [Validators.required,]],
      contactPersonPhoneCode: ['',[Validators.required,]],
      contactPersonPhoneNo: ['', [Validators.required, Validators.minLength(7),
      Validators.maxLength(7), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
      atFault: ['', [Validators.required,]]
    });

    this.service1.ongetpolicyno.subscribe((data) => {
      this.policyarr = data.data;

      this.currentDate = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      if (this.policyarr) {
        this.minLossDate = moment(new Date(this.policyarr.startDate)).format("YYYY-MM-DD");
        // this.minLossDate = moment(new Date(this.policyarr.startDate));
        //this.minLossDate = moment(this.policyarr.startDate + " " + "00:00");
        this.maxLossDate = new Date(this.policyarr.endDate);
        // this.maxIntimatedDate=new Date(this.policyarr.endDate);
        this.maxIntimatedDate = new Date(new Date().setHours(0, 0, 0, 0));
        this.minIntimatedDate = moment(new Date(this.policyarr.startDate)).format("YYYY-MM-DD");
        if (this.currentDate >= this.maxLossDate) {
          this.maxLossDate = this.maxLossDate;
        }
        else {
          this.maxLossDate = moment(new Date()).format("YYYY-MM-DD");
          ;
        }

      }
    })
    this.language = localStorage.getItem("language");
    this.fileContainer = [
      {
        docDesc: 'Copy of Driving License',
        docDescAr:'نسخة من رخصة القيادة',
        doctypeid: 'CDL',
        value: ''
      }, {
        docDesc: 'Rent Agreement in case of Rent a Car',
        docDescAr:'عقد الإيجار في حالة تأجير مركبة',
        doctypeid: 'RARC',
        value: ''
      }, {
        docDesc: 'Police Report OR Court Report OR Referral Note from SAAED or RAFID',
        docDescAr:'تقرير الشرطة أو تقرير المحكمة أو مذكرة إحالة من  ساعد أو  رافد',
        doctypeid: 'PRD',
        value: ''
      }, {
        docDesc: 'Copy of Registration Book',
        docDescAr:'نسخة من دفتر التسجيل',
        doctypeid: 'CRB',
        value: ''
      }, {
        docDesc: 'Copy of Emirates ID',
        docDescAr:'نسخة من الهوية الإماراتية',
        doctypeid: 'CEID',
        value: ''
      }
    ];
    this.coreService.getInputsDbsync('claims/lossLocation/listAll', null).subscribe(response => {
      this.options['vehicleInspection'] = response;
    });
    let param = {
      productId: '*',
      optionType: 'POLICE_STATION'
    }
    this.coreService.getInputs('options/list', param).subscribe(response => {
      this.options['policeStation'] = response.data;
    });
    this.coreService.listOptions('MOBILE_CON_CODE', '*').subscribe(response => {
      this.options['contactPersonPhoneCode'] = response['data'];
      this.ReportaLoss.patchValue({
        contactPersonPhoneCode: response['data'][0].value
      });
    })

    this.isContentLoaded = true;
  }
  ngDoCheck() {
    if (this.language != localStorage.getItem("language")) {
      this.language = localStorage.getItem("language");
    }
  }
  ngAfterViewInit() {
    this.ReportaLoss.patchValue({ policyNo: this.navParams['policyNo'] })
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
  onsubmit() {
  
    console.log(this.ReportaLoss.value)
    if (this.ReportaLoss.value.atFault === '') {
      this.radioError = true;
    }
    if (this.ReportaLoss.status == 'INVALID') {
      return
    }
    let value = this.ReportaLoss.value;
    console.log(value)
    let intimatedDate, lossDate;
    if (value['lossDate']['_d'])
      lossDate = new Date(value['lossDate']['_d']);
    else
      lossDate = new Date(value['lossDate']);
    if (value['intimatedDate']['_d'])
      intimatedDate = new Date(value['intimatedDate']['_d']);
    else
      intimatedDate = new Date(value['intimatedDate']);
    // intimatedDate.setDate(intimatedDate.getDate() + 1);
    value['intimatedDate'] = intimatedDate;
    // lossDate.setDate(lossDate.getDate() + 1);
    value['lossDate'] = lossDate;
    let inDate = this.dateConversion(value.intimatedDate);
    let temp = moment(new Date()).format('HH:mm').toString();
    inDate = inDate.concat('T' + temp + ':00.000Z');
    value['intimatedDate'] = inDate;

    let loDate = this.dateConversion(value.lossDate);
    loDate = loDate.concat('T' + temp + ':00.000Z');
    value['lossDate'] = loDate;
    this.spinner.show();
    this.translate.get('FnolSuccess').subscribe(value => {
      this.FnolCreated = value;
    });
    this.service1.reportaloss(value,'').subscribe((data) => {
      this.spinner.hide();
      swal(
        data, this.FnolCreated, 'success'
      ).then(value => {
        this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
      })

      setTimeout(() => {
        this.customer360();
      }, 3000);
    }, err => {
      this.spinner.hide();
      console.log(err)
      swal(
        '', err.error, 'error'
      ).then(value => {
        this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
      })
    })
  }
  customer360() {
    this.router.navigate(['/Customer360'], { queryParams: { policyNo: this.navParams.policyNo, status: this.navParams.status } });
  }
  policyPage() {
    this.router.navigate(['/User/dashboard']);
  }

  clearFileElement() {
    var r = document.getElementById('fileUpload') as HTMLInputElement
    r.value = null;
  }


  selectFile(event, docId, i, label) {
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
    formData.append('docDescAr', label);
    formData.append('quotenumber', this.policyarr.policyNo);
    this.coreService.postInputs('documentupload/uploadMultipleFiles', formData, null).subscribe(response => {
      this.spinner.hide();
      console.log(response)
      let fName = response.fileName.split('_0_')
      this.fileContainer[i].value = fName[1];
    }, err => {
      this.spinner.hide();
      this.translate.get('FileUploadError').subscribe(value => {
        this.invalidFileFormat = value;
      });
      swal('', this.invalidFileFormat, 'error');
    })

  }
  openAttachment(value) {
    let fileName;
    if (value.type === 'scan')
      fileName = `${this.policyarr.policyId}_0_${value.value}`;
    else
      fileName = `${this.policyarr.policyId}_0_${value.value}`;
    this.coreService.mergeDocument('documentupload/downloadFile?fileName=' + fileName).subscribe((response: any) => {
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

  openDialog(docId, i, value): void {
    let dialogRef = this.dialog.open(RequestRedirectComponent, {
      panelClass: 'my-class',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr',
      data: { docId: docId, fileName: value, quoteNo: this.policyarr.policyNo }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let fileName = result.fileName.split('_0_');
        this.fileContainer[i].type = 'scan';
        this.fileContainer[i].value = fileName[1];
      }
    })
  }

  get formCtrls() {
    return this.ReportaLoss.controls;
  }

  selectOption() {
    this.radioError = false;
  }
}
