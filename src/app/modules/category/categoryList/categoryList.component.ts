import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-categoryList',
  templateUrl: './categoryList.component.html',
  styleUrls: ['./categoryList.component.css'],
  providers: [BidService, UsersService]
})
export class CategoryListComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  user;
  categorys = [];
  p = 1; // set current page to 1
  filter;
  loader = false;

  constructor(public _bidService: BidService, public _userService: UsersService, ) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.readData();
  }
  // Readcall Api For Category
  readData() {
    this.loader = true
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    }
    this._bidService.readCategory(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false
        return;
      }
      this.categorys = resp['data']['category_data']
      this.loader = false
    })
  }
  ngOnInit() {

  }

  // DeleteCall for Api for Category
  deleteCategory(id) {
    this.alert.deleted('').then(() => {
      let obj = {
        status: 'INACTIVE',
        id: id,
        company_id: this.user.company_id,
      }
      this.loader = true
      this._bidService.updateCategory(obj).subscribe(resp => {
        var index = this.categorys.findIndex(item => item._id == id);
        this.categorys.splice(index, 1);
        this.loader = false
      })
    }, error => {
      this.loader = false
    })
  }
}
