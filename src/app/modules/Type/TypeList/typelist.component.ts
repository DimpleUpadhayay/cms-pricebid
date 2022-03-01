import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
@Component({
  selector: 'app-typelist',
  templateUrl: './typelist.component.html',
  styleUrls: ['./typelist.component.css'],
  providers: [BidService, UsersService]
})
export class TypeListComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  user;
  types = [];
  p = 1; // set current page to 1
  filter;
  loader = false;

  constructor(public _bidService: BidService, public _userService: UsersService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.readData();
  }

  readData() {
    this.loader = true
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    }
    this._bidService.readType(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false
        return;
      }
      this.types = resp['data']['type_data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }
  ngOnInit() {

  }
  // Delete Types
  deleteType(id) {
    this.alert.deleted('').then(() => {
      let obj = {
        status: 'INACTIVE',
        id: id,
        company_id: this.user.company_id,
      }
      this.loader = true
      this._bidService.updateType(obj).subscribe(resp => {
        var index = this.types.findIndex(item => item._id == id);
        this.types.splice(index, 1);
        this.loader = false
      }, error => {
        this.loader = false
      })
    }, error => {
      this.loader = false
    })
  }
}
