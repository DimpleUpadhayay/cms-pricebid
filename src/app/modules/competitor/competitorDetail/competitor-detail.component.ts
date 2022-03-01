import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';


@Component({
  selector: 'app-competitor-detail',
  templateUrl: './competitor-detail.component.html',
  styleUrls: ['./competitor-detail.component.css'],
  providers: [BidService]
})
export class CompetitorDetailComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  competitors = [];
  p = 1;
  filter;
  loader = false;

  constructor(private _bidService: BidService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.competitorRead();
  }

  ngOnInit() {
  }

  // get list of compititors
  competitorRead() {

    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE'
    }
    this.loader = true
    this._bidService.competitorRead(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      this.competitors = resp['data']['competition_data'];
      this.loader = false;
      // this.accountNameFlag = false;
      /* if (this.bid.account_name) {
        this.bid.account_id = this.competitor.filter(a => { return a.account_name == this.bid.account_name; })[0]._id;
      } */
    }, error => {
      this.loader = false;
    })
  }

  // delete competitor
  deleteCompetitor(id) {
    let index = this.competitors.findIndex(a => { return a._id == id });
    this.alert.deleted("").then(success => {
      let obj = {
        status: 'INACTIVE',
        id: id,
        company_id: this.user.company_id,
      }
      this.loader = true
      this._bidService.competitorUpdate(obj).subscribe(resp => {
        this.competitors.splice(index, 1);
        this.loader = false
      })
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg)
    })
  }

}
