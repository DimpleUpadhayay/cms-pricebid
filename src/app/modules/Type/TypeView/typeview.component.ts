import { Component, OnInit } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-typeview',
  templateUrl: './typeview.component.html',
  styleUrls: ['./typeview.component.css'],
  providers: [BidService, UsersService]

})
export class TypeViewComponent implements OnInit {

  user;
  type;
  id;
  // Boolean 
  loader = false;

  constructor(public _bidService: BidService, public router: Router, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.id = _route.snapshot.params["id"];
    this.getTypeById(this.id);
  }

  // Type by id calling
  getTypeById(id) {
    this.loader = true
    this._bidService.getTypeById({ "id": id }).subscribe(resp => {
      this.type = resp['data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  ngOnInit() {
  }
}
