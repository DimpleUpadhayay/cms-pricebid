import { Component, OnInit } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categoryView',
  templateUrl: './categoryView.component.html',
  styleUrls: ['./categoryView.component.css'],
  providers: [BidService, UsersService]

})
export class CategoryViewComponent implements OnInit {

  user;
  category;
  id;
  loader = false;

  constructor(public _bidService: BidService, public router: Router, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.id = _route.snapshot.params["id"];
    this.getCategoryById(this.id);
  }
  // Type by id calling
  getCategoryById(id) {
    this.loader = true
    this._bidService.getCategoryById({ "id": id }).subscribe(resp => {
      this.category = resp['data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  ngOnInit() {
  }


}
