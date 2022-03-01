import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { BidService } from '../../services/bid.service';
import { SharedService } from '../../services/shared.service';


@Component({
  selector: 'app-tableofcontent',
  templateUrl: './tableofcontent.component.html',
  styleUrls: ['./tableofcontent.component.css'],
  providers: [BidService]
})
export class TableofcontentComponent implements OnInit, OnDestroy {

  loader = false;
  participantsCont = [];
  user;
  bidData;
  bid;
  assignmentData = [];

  constructor(private _bidService: BidService, public dialogRef: MatDialogRef<TableofcontentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog, public _sharedService: SharedService, private _activeRoute: ActivatedRoute) {
    dialogRef.disableClose = true;
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.getBidById();
  }

  ngOnInit() {
    this.assignmentData = this.data && this.data.length >= 2 ? this.data.filter(a => {
      return a.userType === 'CONTRIBUTOR'
    }) : [{
      "description": "",
      "title": "Chapter 1",
      "user_id": '',
      "pageIndex": 0,
      "userType": ""
    }];
  }
  submit() {
    this.assignmentData.forEach(a => {
      a.pageIndex = this.assignmentData.findIndex(b => b.user_id === a.user_id) + 1;
      a.userType = "CONTRIBUTOR";
    });
    this.dialogRef.close(this.assignmentData);
  }

  ngOnDestroy() {
  }



  getBidById() {
    this.loader = true;
    this._bidService.getBidById(this.bidData.bid_id).subscribe(resp => {
      this.bid = resp['data']['bid'];
      if (this.bid.participants) {
        this.bid.participants.forEach(element => {
          element.userTypes.forEach(item => {
            if (item.user_type == "CONTRIBUTOR") {
              this.participantsCont.push(element)
            }
          })
        })
      }
      this.loader = false
    }, error => {

    });
  }


  deleteRow(index) {
    if (this.assignmentData.length == 1) {
      return
    }
    this.assignmentData.splice(index, 1);
  }

  addRow() {
    let obj = {
      "title": "Chapter " + (this.assignmentData.length +1),
      "description": "",
      "user_id": "",
      "pageIndex": 0,
      "userType": ""
    }
    this.assignmentData.push(obj);
  }

  onClose() {
    this.dialogRef.close()
  }
}
