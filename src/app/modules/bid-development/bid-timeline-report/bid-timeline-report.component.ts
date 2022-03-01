import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MATERIAL_SANITY_CHECKS, MAT_DIALOG_DATA } from '@angular/material';
import { BidService } from '../../../services/bid.service';

@Component({
  selector: 'app-bid-timeline-report',
  templateUrl: './bid-timeline-report.component.html',
  styleUrls: ['./bid-timeline-report.component.css'],
  providers: [BidService]
})
export class BidTimelineReportComponent implements OnInit {
  coowner;
  solTechReview;
  review;
  proposalReview;
  legalReview;
  Approval;
  approvalComments;
  bid_id;
  data_coll = 0;
  constructor(
    public dialogRef: MatDialogRef<BidTimelineReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public _bidService: BidService) {
    dialogRef.disableClose = true;
    this.bid_id = this.data.bid_id
    this.readTimeline();
  }

  ngOnInit() {
  }
  readTimeline() {
    let obj =
    {
      "bid_id": this.bid_id
    }
    this._bidService.getTimelineData(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.coowner = "";
        return;
      }
      if (resp['data'] && resp['data']['timeline_data'] && resp['data']['timeline_data']['coowner'])
        this.coowner = resp['data']['timeline_data']['coowner'];
      else
        this.coowner = "";
      if (resp['data'] && resp['data']['timeline_data'] && resp['data']['timeline_data']['solTechReview'] && resp['data']['timeline_data']['solTechReview']['review']) {
        this.solTechReview = resp['data']['timeline_data']['solTechReview']['review'];
      }
      else {
        this.solTechReview = null;
      }
      if (resp['data'] && resp['data']['timeline_data'] && resp['data']['timeline_data']['review'] && resp['data']['timeline_data']['review']['review']) {
        this.review = resp['data']['timeline_data']['review']['review'];
      }
      else {
        this.review = null;
      }
      if (resp['data'] && resp['data']['timeline_data'] && resp['data']['timeline_data']['proposalReview'] && resp['data']['timeline_data']['proposalReview']['review']) {
        this.proposalReview = resp['data']['timeline_data']['proposalReview']['review'];
      }
      else {
        this.proposalReview = null;
      }
      if (resp['data'] && resp['data']['timeline_data'] && resp['data']['timeline_data']['legalReview'] && resp['data']['timeline_data']['legalReview']['review']) {
        this.legalReview = resp['data']['timeline_data']['legalReview']['review'];
      }
      else {
        this.legalReview = null;
      }
      if (resp['data'] && resp['data']['timeline_data'] && resp['data']['timeline_data']['Approval'] && resp['data']['timeline_data']['Approval']['approval']) {
        this.Approval = resp['data']['timeline_data']['Approval']['approval'];
        this.Approval.sort((a, b) => {
          return a.time_stamp - b.time_stamp;
        });
      }
      else {
        this.Approval = null;
      }
    }, error => {
      this.coowner = "";
    })
  }
  onClose() {
    // close popup and send
    this.dialogRef.close();

  }
  data1(e) {
    this.data_coll = e
  }
}
