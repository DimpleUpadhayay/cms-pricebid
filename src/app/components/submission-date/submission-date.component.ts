import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BidService } from '../../services/bid.service';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-submission-date',
  templateUrl: './submission-date.component.html',
  styleUrls: ['./submission-date.component.css'],
  providers: [BidService]
})
export class SubmissionDateComponent implements OnInit {
  submissionDate;
  @ViewChild(AlertComponent) _alert: AlertComponent;
  update = false;
  minDate;
  constructor(public dialogRef: MatDialogRef<SubmissionDateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _bidService: BidService,
    public router: Router) {
    dialogRef.disableClose = true;
    // console.log(data);
  }

  ngOnInit() {
  }

  onSubmit() {
    if (this.submissionDate == undefined) {
      this._alert.sweetError("Please enter submission date");
      return;
    }
    this.updateSubmissionDate(this.data.item);
    let obj = {
      bid_id: this.data.bid_id,
      date_submission: new Date(this.submissionDate),
      bid_submit: false
    }
    this._bidService.updateSubmissionDate(obj).subscribe(success => {
      this._alert.sweetSuccess("Bid Submission date has been updated successfully");
      this.update = true;
      this.onClose();
      this.router.navigateByUrl('/RefrshComponent', { skipLocationChange: true }).then(() =>
        this.router.navigateByUrl('/dashboard'));
    }, error => {
      this._alert.sweetError("Failed to delete");
    });
  }

  updateSubmissionDate(item) {
    let obj = {
      _id: item._id,
      user_id: item.assigned_to[0].user_id,
      type: "BID_SUBMIT"
    }
    if (!item.assigned_to[0].date_submission) {
      this._bidService.updateNotification(obj).subscribe(success => {
        // this._alert.sweetSuccess("Data has been recored");
      }, error => {
        // console.log(error);
      });
    }
  }

  onClose() {
    // close popup and send attachment details to respective components
    this.dialogRef.close(this.update);
  }

}