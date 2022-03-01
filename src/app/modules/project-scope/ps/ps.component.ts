import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { isUndefined } from 'util';

import { MatDialog } from '@angular/material';
import { ProjectScopeService } from '../../../services/ps.service';
import { BidService } from '../../../services/bid.service';
import { ParsingUploadComponent } from '../../../components/parsing-upload/parsing-upload.component';

@Component({
  selector: 'app-ps',
  templateUrl: './ps.component.html',
  styleUrls: ['./ps.component.css'],
  providers: [ProjectScopeService, NgbModal, MatDialog, BidService, ParsingUploadComponent]

})
export class psComponent implements OnInit {
  public psForm: any;
  public ps;
  public eligibility: boolean = true;
  public psData = [];
  formSubmitted: boolean = false;
  minDate = new Date();
  public user;
  public mainProjectScopes;
  bidData;
  parsingData;

  closeResult: string;
  bid_id;

  constructor(private _psService: ProjectScopeService, public router: Router,
    public dialog: MatDialog,
    public modalService: NgbModal,
    private _activeRoute: ActivatedRoute,
    public _formBuilder: FormBuilder,
    private _bidService: BidService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.getBid();
  }

  ngOnInit(): void {
  }

  // get bid details
  getBid() {
    this._bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      localStorage.setItem("bidData", JSON.stringify(this.bidData));
    });
  }

  // upload documents for parsing
  openDialog(): void {
    const dialogRef = this.dialog.open(ParsingUploadComponent, {
      height: '216px',
      width: '398px',
      data: 'scan'
    });

    dialogRef.afterClosed().subscribe(result => {

      let currentFileData = [];
      this.parsingData = result;
      localStorage.setItem("parsing", JSON.stringify(this.parsingData));
      isUndefined(result) ? '' : this.router.navigate(['/parsing', this.bid_id]);
      /* for (var i = 0; i < result.length; i++) {
        let obj;
        obj = {
          "attachment_id": result[i].attachment_id,
          "attachment_n": result[i].original_name,
          "attachment_path": result[i].filename,
          "description": result[i].description,
          "type": "BID_CREATION"
        }

      } */
    });
  }
}
