import { Component, OnInit, ViewChild } from '@angular/core';
import { ApprovalChainService } from '../../services/approvalChain.service';
import { TerritoryService } from '../../services/territories.service';
import { BusinessUnitService } from '../../services/businessUnit.service';
import { UsersService } from '../../services/users.service';
import { AlertComponent } from '../../libraries/alert/alert.component';

@Component({
  selector: 'app-acList',
  templateUrl: './acList.component.html',
  styleUrls: ['./acList.component.css'],
  providers: [ApprovalChainService, BusinessUnitService, TerritoryService, UsersService]
})

export class approvalChainListComponent {
  approvalChains;
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  p = 1;
  filter;
  loader = false;

  constructor(public _businessUnitService: BusinessUnitService,

    public _territoryService: TerritoryService,
    public _approvalChainService: ApprovalChainService,
    public _userService: UsersService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getApprovalChain();
    this.approvalChains = [];
  }

  ngOnInit() {
    this.loader = true;
  }

  changeDate(date) {
    return new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear();
  }

  // get list of approval chains
  getApprovalChain() {
    this.loader = true
    return this._approvalChainService.getApprovalChain({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      this.approvalChains = data['data']['approval_chains'];
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  // delete approval chain
  deactivate(id) {
    this.alert.deleted('').then(() => {
      this.loader = true
      let obj = {
        status: 'INACTIVE',
        ac_id: id
      }
      this._approvalChainService.updateApprovalChain(obj).subscribe(data => {
        this.loader = false
        this.getApprovalChain();
      }, (error) => {
        this.loader = false;
        if (error.error.code == 400) {
          this.alert.sweetError('This Approval Chain is in use in current bids. Pls contact Pricebid Support');
          return
        }
      });
    }).catch(e => {

    })
  }

}
