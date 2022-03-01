import { Component, OnInit } from '@angular/core';
import { UploadfileComponent } from '../../upload-file/upload-file.component';
import { DownloadComponent } from '../../download/download.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-bid-confirmation',
  templateUrl: './bid-confirmation.component.html',
  styleUrls: ['./bid-confirmation.component.css']
})
export class BidConfirmationComponent implements OnInit {

  bidConfirm;
  challenges = [{
    "chalInput": ""
  }]
  flag = true;
  userType = "BID_OWNER"


  constructor(public dialog: MatDialog) {
    this.bidConfirm = {
      "leadName": "",
      "leadNo": "",
      "custName": "",
      "estimateDeal": "",
      "eligibilityScore": "",
      "dealSubDate": "",
      "bidSubDate": "",
      "dealClosureDate": "",
      "consultant": "",
      "bUnit": "",
      "feasibility": "",
      "bidderSelecton": "",
      "actualPartic": "",
      "gonogoAPP": ""
    }
  }
  formSubmitted: boolean = false;

  ngOnInit() {
  }
  onAddChall() {
    let obj = {
      "chalInput": ""
    }
    this.challenges.push(obj)
  }
  onDeleteChall(index) {
    this.challenges.splice(index, 1);
  }
  openDialog(): void {
    let attachment = [];
    const dialogRef = this.dialog.open(UploadfileComponent, {
      height: '300px',
       width: '850px',
    });
  }
  onDownloadDialog(): void {
    const dialogRef = this.dialog.open(DownloadComponent, {
      height: '300px',
       width: '850px',
    });
  }



  onSave() {
    this.formSubmitted = true;
  }

}
