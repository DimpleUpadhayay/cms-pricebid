import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { ItemsList } from '@ng-select/ng-select/ng-select/items-list';

@Component({
  selector: 'app-dropbid',
  templateUrl: './dropbid.component.html',
  styleUrls: ['./dropbid.component.css'],
  providers: [BidService]
})
export class DropbidComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  reason = "";
  droppedReason = [{
    "reason_id": 1,
    "reason_name": "Lacking Customer Relationship"
  },
  {
    "reason_id": 2,
    "reason_name": "Beyond Customer Budget"
  },
  {
    "reason_id": 3,
    "reason_name": "Pre-Qualification issues"
  },
  {
    "reason_id": 4,
    "reason_name": "No Approval - Delivery"
  },
  {
    "reason_id": 5,
    "reason_name": "No Approval - Finance"
  },
  {
    "reason_id": 6,
    "reason_name": "No Approval - Legal"
  },
  {
    "reason_id": 7,
    "reason_name": "RFP Scrapped"
  },
  {
    "reason_id": 8,
    "reason_name": "Lacking OEM Relationship"
  },
  {
    "reason_id": 9,
    "reason_name": "Sales Decision"
  },
  {
    "reason_id": 10,
    "reason_name": "Customer retained Incumbent"
  }]

  constructor(public _bidService: BidService, public dialogRef: MatDialogRef<DropbidComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  onClose() {
    this.dialogRef.close()
  }
// Drop Bid Reason while dropping the bid
  onSubmit() {
    if (this.reason == "") {
      this._alert.sweetError("Please select the reason");
      return
    }
    let result = this.droppedReason.filter(item => item.reason_id.toString() == this.reason);
    let obj = {
      "bid_id": this.data.bid_id,
      "bidFinalStatus": "DROPPED",
      "droppedReason": result[0],
    }
    this._bidService.dropBid(obj).subscribe(res => {
      this._alert.sweetSuccess("Bid has been dropped successfully")
      this.dialogRef.close();
    }, error => {

    })
  }
}
