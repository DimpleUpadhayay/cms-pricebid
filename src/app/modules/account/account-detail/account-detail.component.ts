import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css'],
  providers: [BidService, UsersService]
})
export class AccountDetailComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  filter;
  public account = [];
  p = 1; // set current page to 1
  loader = false;

  constructor(public _bidService: BidService, public _userService: UsersService, ) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.readData();
  }

  // Read Call for account
  readData() {
    this.loader = true;
    let obj = {
      "company_id": this.user.company_id,
      "pageNo": 1,
      status: 'ACTIVE',
    };
    this._bidService.readAccountInfo(obj).subscribe(resp => {
      if (resp['data'] == null) {
        this.loader = false;
        return;
      }
      this.account = resp['data']['account_data'];
      this.loader = false;
    }, error => {
      this.loader = false;
    });
  }

  ngOnInit() {
  }

  // Delete Account
  deleteAccount(id) {
    this.alert.deleted("").then(success => {
      this.loader = true;
      let obj = {
        status: 'INACTIVE',
        id: id,
        company_id: this.user.company_id,
      };
      this._bidService.updateAccountInfo(obj).subscribe(resp => {
        var index = this.account.findIndex(item => item._id == id);
        this.account.splice(index, 1);
        this.loader = false;
      });
    }, error => {
      this.loader = false;
      this.alert.sweetError(error.error.msg);
    });
  }
}
