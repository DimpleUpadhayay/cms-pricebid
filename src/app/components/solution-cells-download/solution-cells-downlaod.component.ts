import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'app-solution-cells-downlaod',
  templateUrl: './solution-cells-downlaod.component.html',
  styleUrls: ['./solution-cells-downlaod.component.css'],
  providers: [BidService]
})
export class solutionCellsDownlaoadComponent implements OnInit {

  @ViewChild(AlertComponent) alert: AlertComponent;
  attachment_data = [];
  user;
  disabled = false;
  userType;
  currentUser;
  obj;
  constructor(public dialogRef: MatDialogRef<solutionCellsDownlaoadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _bidService: BidService,
    public dialog: MatDialog) {
    dialogRef.disableClose = true;
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.userType = this.user.user_type;
    // if (this.userType == 'BID_OWNER') {
    //   this.disabled = true;
    // } else {
    //   this.disabled = false;
    // }
  }

  ngOnInit() {
    if (this.data) {
      this.attachment_data = this.data.attachment_data;
      this.currentUser = this.data.user;
      // console.log(this.currentUser);
      if (this.currentUser && this.currentUser.user_id == this.user.user_id && this.userType == 'CONTRIBUTOR') {
        this.disabled = false
      } else {
        this.disabled = true;
      }
      this.obj = this.data;
    }
  }

  onDownload(index) {
    let data = this.attachment_data[index];
    /* let data = "test";
    var blob = new Blob([data], { type: 'text/text' });
    var url= window.URL.createObjectURL(blob); */
    let url = data.attachment_path;
    window.open(url);
  }

  onRemove(i) {
    this.attachment_data.splice(i, 1);
    this.obj['attachment_data'] = this.attachment_data;
    this._bidService.updateExcelAttachment(this.obj).subscribe(data => {
      this.alert.sweetSuccess("Attachment deleted successfully");
    }, error => {
    })

  }

  onVersion(index) {
    this.dialogRef.close(this.attachment_data[index]);
  }

  onClose() {
    this.dialogRef.close();
  }
}
