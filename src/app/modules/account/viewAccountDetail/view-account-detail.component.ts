import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-account-detail',
  templateUrl: './view-account-detail.component.html',
  styleUrls: ['./view-account-detail.component.css'],
  providers: [BidService]
})
export class ViewAccountDetailComponent implements OnInit {
  user;
  account;
  id;

  constructor(public _bidService: BidService, public router: Router, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.id = _route.snapshot.params["id"];
    this.getAccountByID(this.id);
  }

  ngOnInit() {
  }

  // Account by id calling
  getAccountByID(id) {
    this._bidService.getAccountById({ "id": id }).subscribe(resp => {
      this.account = resp['data']
      // console.log(">>>>account", this.account)
    }, error => {
    })
  }

}
