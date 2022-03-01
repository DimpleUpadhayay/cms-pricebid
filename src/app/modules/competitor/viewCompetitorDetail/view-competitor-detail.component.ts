import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-view-competitor-detail',
  templateUrl: './view-competitor-detail.component.html',
  styleUrls: ['./view-competitor-detail.component.css'],
  providers: [BidService]
})
export class ViewCompetitorDetailComponent implements OnInit {
  user;
  competitor;
  id;
  loader = false;

  constructor(public _bidService: BidService, private _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.id = _route.snapshot.params["id"];
    this.getAccountByID(this.id);
  }

  ngOnInit() {
    this.loader = true;
  }

  // get competitor data
  getAccountByID(id) {
    this._bidService.getCompetitorById({ "id": id }).subscribe(resp => {
      this.competitor = resp['data'];
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

}
