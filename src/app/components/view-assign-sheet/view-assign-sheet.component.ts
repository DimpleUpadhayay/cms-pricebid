import { Component, OnInit, Inject } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-view-assign-sheet',
  templateUrl: './view-assign-sheet.component.html',
  styleUrls: ['./view-assign-sheet.component.css'],
  providers: [BidService]
})
export class ViewAssignSheetComponent implements OnInit {
  bidData;
  username = []
  participants;
  loader = false;

  constructor(public _bidService: BidService, public dialogRef: MatDialogRef<ViewAssignSheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.bidData = JSON.parse(localStorage.getItem("bidData"));
    if (this.bidData.participants) {
      this.participants = this.bidData.participants;
    }
    this.getAssignmentData()
  }

  ngOnInit() {

  }

  onClear() {
    this.dialogRef.close();
  }

  getAssignmentData() {
    this.loader = true
    if (this.data && !this.data.assignmentData) {
      this.data.forEach(item => {
        this.participants.forEach(result => {
          if (item.user_id === result.user_id) {
            let obj = {
              username: result.fullname,
              sheetName: item.sourceSheetName ? item.sourceSheetName : item.title ? item.title : ''
            }
            this.username.push(obj);
          }
        });
      });
      this.loader = false;
      return
    }

    this.data.assignmentData.forEach(item => {
      this.participants.forEach(result => {
        if (item.user_id == result.user_id && item.userType == "CONTRIBUTOR") {
          let obj = {
            username: result.fullname,
            sheetName: item.sourceSheetName
          }
          this.username.push(obj);

        }
      })
    },
      this.loader = false
    )

  }
}
