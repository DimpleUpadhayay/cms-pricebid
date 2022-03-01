import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalChainService } from '../../services/approvalChain.service';
//Internal schema
import { approvalChain } from '../../models/approvalChain.model';
import { TerritoryService } from '../../services/territories.service';
import { BusinessUnitService } from '../../services/businessUnit.service';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../libraries/alert/alert.component';

//to accss use this.approvalChain = new approvalChain; after creating instance

@Component({
  selector: 'app-approval-chain-view',
  templateUrl: './approval-chain-view.component.html',
  styleUrls: ['./approval-chain-view.component.css'],
  providers: [ApprovalChainService, BusinessUnitService, TerritoryService, UsersService]
})
export class ApprovalChainViewComponent {


  public acForm;
  public acSecondForm;
  @ViewChild(AlertComponent) alert: AlertComponent;
  formSubmitted: boolean = false;
  approvalChain;
  rules = [{
    name: '',
    l_operator: '',
    l_amount: '',
    r_operator: '',
    r_amount: '',
    icon: true,
    allIcon: false
  }];
  user;
  businessUnits;
  territoryData;
  approvedUsers = [];
  approval_chain_id;

  constructor(public router: Router,
    public _businessUnitService: BusinessUnitService,
    public _territoryService: TerritoryService,
    public _approvalChainService: ApprovalChainService,
    public _userService: UsersService,
    public _route: ActivatedRoute,
    public _formBuilder: FormBuilder, private calendar: NgbCalendar) {

    this.approvalChain = new approvalChain();

    this.acForm = _formBuilder.group({
      name: ["", Validators.compose([Validators.required])],
      desc: [""],
      territory_ids: [""],
      bu_ids: [""]
    });

    this.acSecondForm = _formBuilder.group({
      users: [""],
      order: [""]
    });
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];

    this.defaultValid();

    this.approval_chain_id = this._route.snapshot.params['id'];
    if (this.approval_chain_id)
      this.getApprovalChainById();

    this.getBusinessUnits();
    this.getTerritories();
  }

  reset() {
    this.approvalChain = new approvalChain();
  }

  addRule() {
    this.rules.push({
      name: '',
      l_operator: '',
      l_amount: '',
      r_operator: '',
      r_amount: '',
      icon: false,
      allIcon: true
    })
  }

  deleteRule(i) {
    this.rules.splice(i, 1)
  }

  getApprovalChainById() {
    this._approvalChainService.getApprovalChain({ ac_id: this.approval_chain_id }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        return;
      }
      if (data && data['data'] && data['data']['approval_chains'].length) {
        this.approvalChain = data['data']['approval_chains'][0];
        this.acForm.value['bu_ids'] = this.approvalChain.bu_ids;
        this.acForm.value['territory_ids'] = this.approvalChain.territory_ids;
        this.getParticipants();
        this.approvalChain.users.forEach(element => {
          this.approvedUsers.splice(this.approvedUsers.indexOf(element), 1)
        });
        this.rules = this.approvalChain.rules;
      }
    }, error => {
    })
  }

  addApprovers(event: any) {
    let newApprover = event.dragData;
    let obj = {
      user_id: newApprover.user_id,
      level: (this.approvalChain['users'].length + 1),
      name: newApprover.username
    }
    this.approvedUsers.splice(this.approvedUsers.indexOf(newApprover), 1)
    this.approvalChain['users'].push(obj);
  }
  changeOrder(event) {
    let i = 1;
    this.approvalChain['users'].map(a => {
      a.level = i;
      i++;
    });
  }

  removeApprovers(event: any) {
    let newApprover = event.dragData;
    this.approvedUsers.push(newApprover);
    this.approvalChain['users'].splice(this.approvalChain['users'].indexOf(newApprover), 1)
  }


  businessU = [];
  getBusinessUnits() {
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        return;
      }
      if (data['code'] == 2000) {
        this.businessUnits = data['data'];
        this.businessUnits.forEach(item => {
          this.approvalChain.bu_ids.forEach(element => {
            if (item.bu_id == element)
              this.businessU.push(item.name);
          });
        });
      }
    }, error =>{
    });
  }

  getParticipants() {
    let obj = {};
    this.approvedUsers = [];
    obj['user_type'] = "APPROVER";

    if (this.acForm.value['bu_ids'] && this.acForm.value['bu_ids'].length > 0) obj['bu_ids'] = this.acForm.value['bu_ids'];
    if (this.acForm.value['territory_ids'] && this.acForm.value['territory_ids'].length > 0) obj['territory_ids'] = this.acForm.value['territory_ids'];

    if (obj['bu_ids'] && obj['territory_ids']) {
      this._userService.getCompanyUserData(obj).subscribe(data => {
        if (data['data'] == null || data['data'] == 'null') {
          return;
        }
        if (data && data['code'] == '2000') {
          this.approvedUsers = data['data']['users'];
          if (this.approval_chain_id) {
            this.approvalChain.users.forEach(element => {
              this.approvedUsers.splice(this.approvedUsers.findIndex(a => a.user_id == element.user_id), 1)
            });
          }
        }
      }, error =>{
      });
    } else {
      this.approvalChain['users'] = [];
    }
  }

  defaultValid() {
    for (var element in this.approvalChain) {
    }
  }
  getApprovals() {
    let obj = {
      module_name: 'module',
    }
    this._userService.getCompanyUserData(obj).subscribe(approvals => {
      if (approvals['data'] == null || approvals['data'] == 'null') {
        return;
      }
      if (approvals['code'] === 2000) {
        this.approvedUsers = approvals['data']
      } else if (approvals['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      }
    }, error =>{
    })
  }

  territoryNames = [];
  getTerritories() {
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['code'] === 2000) {
        if (territories['data'] == null || territories['data'] == 'null') {
          return;
        }
        this.territoryData = territories['data']     //this.errorMsg = "";
        this.territoryData.forEach(element => {
          this.approvalChain.territory_ids.forEach(item => {
            if (element.territory_id == item) {
              this.territoryNames.push(element.name)
            }
          });

        });
      } else if (territories['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (territories['code'] === 401) {
        //this.approvalChains = [];
      } else if (territories['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (territories['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
    });
  }
}
