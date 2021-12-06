import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { WebcamImage, WebcamUtil } from 'ngx-webcam';
import { NgxSpinnerService } from 'ngx-spinner';
import { CoreService } from 'src/app/core/services/core.service';
import swal from 'sweetalert'

@Component({
  selector: 'app-scan-and-upload',
  templateUrl: './scan-and-upload.component.html',
  styleUrls: ['./scan-and-upload.component.scss']
})
export class ScanAndUpload {

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {

  }

  loadIframe() {
    this.dialog.open(FrameDialog, {
      width: '400px',
      direction: localStorage.getItem('language') === 'ar' ? 'rtl' : 'ltr'
    })
  }
}

@Component({
  selector: 'frameDialog',
  template: `
  <div>
  <iframe src="http://dev.beyontec.com/afnic_customer/#/new-login" height="200" width="300" title="Iframe Example"></iframe>
  </div>`,
  styleUrls: []
})
export class FrameDialog {
}