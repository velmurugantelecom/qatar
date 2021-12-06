import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message-popup',
  templateUrl: './message-popup.component.html',
  styleUrls: ['./message-popup.component.scss']
})
export class MessagePopupComponent implements OnInit {

  public cancelProcess: boolean;
  public proceedProcess: boolean;

  constructor(public dialogRef: MatDialogRef<MessagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    public router: Router) {
  }

  ngOnInit() {
    if (this.data.for != 'emailAlreadyExist') {
      this.cancelProcess = true;
    }
    this.proceedProcess = true;
  }

  doContinue() {
    this.dialogRef.close(true);
  }

  doCancel() {
    this.dialogRef.close(false)
  }
}
