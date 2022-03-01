import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ApprovalChainService } from '../../services/approvalChain.service';
import { approvalChain } from '../../models/approvalChain.model';
import { TerritoryService } from '../../services/territories.service';
import { BusinessUnitService } from '../../services/businessUnit.service';
import { UsersService } from '../../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { MatDialog } from '@angular/material';
import { ApprovalDeleteUserComponent } from '../bid/approval-delete-user/approval-delete-user.component';


@Component({
  selector: 'app-ac',
  templateUrl: './ac.component.html',
  styleUrls: ['./ac.component.css'],
  providers: [ApprovalChainService, BusinessUnitService, TerritoryService, UsersService]
})

export class approvalChainComponent {
  public acForm;
  @ViewChild(AlertComponent) alert: AlertComponent;
  formSubmitted: boolean = false;
  approvalChain;
  additional_approver = [];
  filter;
  rules = [{
    name: 'Deal Value',
    l_operator: '',
    l_amount: 0,
    r_operator: '',
    r_amount: 0,
    icon: true,
    allIcon: false
  }];
  user;
  businessUnits;
  territoryData;
  approvedUsers = [];
  approval_chain_id;
  loader = false;
  userData;

  constructor(public router: Router,
    public _businessUnitService: BusinessUnitService,
    public _territoryService: TerritoryService,
    public _approvalChainService: ApprovalChainService,
    public _userService: UsersService,
    public _route: ActivatedRoute,
    public _formBuilder: FormBuilder, public dialog: MatDialog) {
    this.approvalChain = new approvalChain();
    this.acForm = _formBuilder.group({
      name: ["", Validators.compose([Validators.required])],
      desc: [""],
      territory_ids: [""],
      bu_ids: [""]
    });

    /* this.acSecondForm = _formBuilder.group({
        users: [""],
        order: [""]
    }); */
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    // this.defaultValid();

    this.getBusinessUnits();
    this.getTerritories();
    this.getAllApprovers();
    if (this._route.snapshot.params['id']) {
      this.approval_chain_id = this._route.snapshot.params['id'];
      this.getApprovalChainById();
    }
  }

  reset() {
    this.approvalChain = new approvalChain();
    this.approvedUsers = [];
  }

  addRule() {
    this.rules.push({
      name: '',
      l_operator: '',
      l_amount: 0,
      r_operator: '',
      r_amount: 0,
      icon: false,
      allIcon: true
    })
  }

  deleteRule(i) {
    this.rules.splice(i, 1)
  }

  buValidate = true;
  checkMinMaxValue(value, i) {

    this.buValidate = true;
    if (value === 'l_amount') {
      if (this.rules[i].r_amount > 0 && (this.rules[i]['l_amount']) > this.rules[i]['r_amount']) {
        this.buValidate = false;
        this.alert.sweetError("Business rule 'Minimum' value can not be greater than 'Maximum' value")
      }
    } else {
      if (this.rules[i].l_amount > 0 && (this.rules[i]['r_amount']) < this.rules[i]['l_amount']) {
        this.buValidate = false;
        this.alert.sweetError("Business rule 'Maximum' value can not be small than 'Minimum' value")
      }
    }
  }
  // fetch particular approval chain details
  getApprovalChainById() {
    this.loader = true;

    this._approvalChainService.getApprovalChain({ ac_id: this.approval_chain_id }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      // console.log(this.approvalChain, "dsfsd");
      if (data && data['data'] && data['data']['approval_chains'].length) {
        this.approvalChain = data['data']['approval_chains'][0];
        this.acForm.value['bu_ids'] = this.approvalChain.bu_ids;
        this.acForm.value['territory_ids'] = this.approvalChain.territory_ids;
        if (this.approvalChain['rules'].length == 0) {
          this.approvalChain['rules'] = this.rules;
        }
        this.getParticipants();
        this.approvalChain.users.forEach(element => {
          this.approvedUsers.splice(this.approvedUsers.indexOf(element), 1)
        });
        this.rules = this.approvalChain.rules;
      }
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  addApprovers(event: any) {
    let obj = {}
    if (this.acForm.value['bu_ids'] && this.acForm.value['bu_ids'].length > 0)
      obj['bu_ids'] = this.acForm.value['bu_ids'];

    if (this.acForm.value['territory_ids'] && this.acForm.value['territory_ids'].length > 0)
      obj['territory_ids'] = this.acForm.value['territory_ids'];

    if (obj['bu_ids'] && obj['territory_ids']) {
      let newApprover = event.dragData;
      let obj = {
        user_id: newApprover.user_id,
        level: this.approvalChain['users'].length + 1,
        fullname: newApprover.fullname,
        title: newApprover.title
      }
      this.approvalChain['users'].push(obj);
      this.approvedUsers.splice(this.approvedUsers.indexOf(newApprover), 1)
    } else {
      this.alert.sweetError("Please Complete Step one!")
    }
  }

  changeOrder(event) {
    let i = 1;
    this.approvalChain['users'].map(a => {
      a.level = i;
      i++;
    });
  }

  // remove approvers from selected approvers
  removeApproverUsers(event, i) {
    this.approvedUsers.push(event);
    this.approvalChain['users'].splice(i, 1);
    this.changeOrder('');
  }


  removeApprovers(item, i) {
    this.alert.deleteApproverCompanyAdmin("").then(() => {
      this.removeApproverUsers(item, i);
      this.alert.sweetSuccess("User removed successfully ")
    }, error => {
      return;
    });
  }


  reassignApprovers(item, i) {
    let obj = {
      "approvedUsers": this.approvedUsers,
      "approverName": item,
      "ac_id": this.approval_chain_id
    }
    const dialogRef = this.dialog.open(ApprovalDeleteUserComponent, {
      height: '310px',
      width: '725px',
      data: obj
    })
    dialogRef.afterClosed().subscribe(result => {
      console.log("RESULT 242", result)
      if (result == 'NoData') {
        this.loader = false;
        return
      }
      console.log("Hello 249", this.approvalChain.users)
      let obj = {
        "user_id": result.new_user_id,
        "level": result.level,
        "fullname": result.fullname
      }
      this.approvalChain.users.forEach((element, index) => {
        if (element.level == result.level && element.user_id == result.user_id) {
          this.approvalChain.users[index] = obj;
        }
      });
      this.approvedUsers.forEach((found,index) =>{
        if(found.user_id == result.new_user_id){
            this.approvedUsers.splice(index,1);
        }
      })
      let data = {
        "user_id": result.user_id,
        "level": result.level,
        "fullname": result.oldFullName
      }
      this.approvedUsers.push(data);
      this.changeOrder('');
    }, error => {

    })
  }

  getBusinessUnits() {
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      if (data['code'] == 2000) {
        this.businessUnits = data['data'];
      }
    }, error => {
    });
  }

  // New logic
  tempBu = []
  setBuChildren(event) {
    this.tempBu = [];
    if (!event || (event && event.length == 0)) {
      return
    }
    event.forEach(element => {
      this.tempBu = this.businessUnits.filter(a => {
        return a.parent_id === element.bu_id;
      }).map(a => {
        return a.bu_id
      });
    });
  }

  getTerritories() {
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['code'] === 2000) {
        this.territoryData = territories['data']     //this.errorMsg = "";
        return
      }
      this.territoryData = [];
    }, error => {
      this.territoryData = [];
    });
  }

  // New logic
  tempTerritory = [];
  setTerritoryChildren(event) {
    this.tempTerritory = [];
    if (!event || (event && event.length == 0)) {
      return
    }
    event.forEach(element => {
      this.tempTerritory = this.territoryData.filter(a => {
        return a.parent_id === element.territory_id;
      }).map(a => {
        return a.territory_id
      });;
    });
  }

  getApprovals() {
    let obj = {
      module_name: 'module',
    }
    this._userService.getCompanyUserData(obj).subscribe(approvals => {
      if (approvals['code'] === 2000) {
        this.approvedUsers = approvals['data']
      }
    }, error => {
    })
  }

  additionalApprovers = [];
  getAllApprovers() {
    let obj = {};
    obj['user_type'] = "APPROVER";

    this._userService.getCompanyUserData(obj).subscribe(data => {
      if (data && data['code'] == '2000') {
        this.additionalApprovers = data['data']['users'];
        if (this.approval_chain_id) {
          this.approvalChain.users.forEach(element => {
            this.additionalApprovers.splice(this.additionalApprovers.findIndex(a => a.user_id == element.user_id), 1)
          });
        }
      }
    }, error => {
    });
  }

  setAdditionalApprovers(one) {
    let a, two;
    a = this.additional_approver;
    var filtered = this.additionalApprovers.filter(function (item) {
      return a.indexOf(item.user_id) !== -1;
    });
    if (!one) {
      filtered.forEach(a => {
        if (this.approvedUsers.findIndex(b => b.user_id == a.user_id) == -1 &&
          this.approvalChain['users'].findIndex(b => b.user_id == a.user_id) == -1) {
          this.approvedUsers.push(a)
          two = '2'
        }
      });
    }
    if (!one && two) {
      this.alert.sweetSuccess("Approver list updated!")
    }
    else if (!one && !two) {
      this.alert.sweetError("Already selected for process!")
    }
  }


  // get list of approvers according to BU and Territory
  getParticipants() {
    let obj = {};
    this.approvedUsers = [];
    obj['user_type'] = "APPROVER";
    if (this.acForm.value['bu_ids'] && this.acForm.value['bu_ids'].length > 0)
      obj['bu_ids'] = this.acForm.value['bu_ids'];
    if (this.acForm.value['territory_ids'] && this.acForm.value['territory_ids'].length > 0)
      obj['territory_ids'] = this.acForm.value['territory_ids'];
    /* if (this.acForm.value['territory_ids'] && this.acForm.value['territory_ids'].length > 0) {
      obj['territory_ids'] = this.acForm.value['territory_ids'];
      obj['territory_ids'].forEach(element => {
        this.territoryData.forEach(item => {
          if (element == item.territory_id && item.parent_id != "ROOT") {
            obj['territory_ids'].push(item.parent_id);
          }
        });
      });
    } */

    if (obj['bu_ids'] && obj['territory_ids']) {
      // New logic
      /* if (this.tempBu.length > 0) {
        this.tempBu.forEach(element => {
          if (obj['bu_ids'].indexOf(element) === -1) {
            obj['bu_ids'].push(element);
          }
        });
      } */
      /* if (this.tempTerritory.length > 0) {
        this.tempTerritory.forEach(element => {
          if (obj['territory_ids'].indexOf(element) === -1) {
            obj['territory_ids'].push(element);
          }
        });
      } */
      // New logic
      this._userService.getCompanyUserData(obj).subscribe(data => {
        if (data && data['code'] == '2000') {
          this.approvedUsers = data['data']['users'];
          if (this.approval_chain_id) {
            this.approvalChain.users.forEach(element=>{
              this.approvedUsers.forEach(a=>{
                if(a.user_id===element.user_id){
                  element.title=a.title;
                }
              })
            })
            this.approvalChain.users.forEach(element => {
              this.approvedUsers.splice(this.approvedUsers.findIndex(a => a.user_id == element.user_id), 1);
            });
          }
        }
        this.setAdditionalApprovers('1');
      }, error => {
      });
    } else {
      this.setAdditionalApprovers('1');
      this.approvalChain['users'] = [];
    }
  }

  validate() {
    let validate = true;
    for (var element in this.approvalChain) {
      if (element && element != 'participants' && (this.approvalChain[element] === '' || this.approvalChain[element].length == 0)) {
        validate = false;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;
    this.approvalChain[element + 'Valid'] = true;
    if (element && this.approvalChain[element] == '') {
      validate = false;
    }
    return validate
  }

  // create approval chain
  createApprovalChain() {
    this.formSubmitted = true;
    if (!this.validate()) {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (!this.buValidate) {
      this.alert.sweetError("Business rules 'Minimum and Maximum' values be proper");
      return;
    }
    this.acForm.value['users'] = this.approvalChain['users'];
    this.acForm.value['rules'] = [];
    if (this.rules.findIndex(a => a.l_amount > 0) !== -1) {
      this.acForm.value['rules'] = this.rules;
    }
    this.alert.added("").then(success => {
      this.loader = true;
      // console.log(this.acForm.value, "2")
      this._approvalChainService.createApprovalChain(this.acForm.value).subscribe(data => {
        if (!data) {
          this.loader = false;
          this.alert.sweetError("Something wrong with server! please try again");
          return
        }
        this.loader = false
        if (data['data']['approval_chain']['code'] === 400) {
          this.alert.sweetError(data['data']['approval_chain']['message']);
          return
        } else {
          this.alert.sweetSuccess("Approval Chain has been created successfully");
          setTimeout(() => {
            this.loader = false
            this.router.navigate(['approvalChainList'])
          }, 2000)
        }
      }, error => {
        if (error.error && error.error.code == 400) {
          this.loader = false
          this.alert.sweetError(error.error.msg);
        }
      });
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
    })
  }

  // update approvalchain
  updateApprovalChain() {
    this.formSubmitted = true;
    if (!this.validate()) {
      this.alert.sweetError("Please enter mandatory fields");
      return;
    }
    if (!this.buValidate) {
      this.alert.sweetError("Business rules should be proper");
      return;
    }
    this.loader = true
    this.formSubmitted = true;
    this.acForm.value['users'] = this.approvalChain['users'];
    this.acForm.value['rules'] = [];
    if (this.rules.findIndex(a => a.l_amount > 0) !== -1) {
      this.acForm.value['rules'] = this.rules;
    }

    this.acForm.value['ac_id'] = this.approval_chain_id;
    this.acForm.value['status'] = this.approvalChain.status;
    this._approvalChainService.updateApprovalChain(this.acForm.value).subscribe(data => {
      if (!data) {
        this.loader = false;
        this.alert.sweetError("Something wrong with server! please try again");
        return
      }
      this.loader = false
      this.alert.sweetSuccess("Approval Chain has been updated successfully");
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['approvalChainList'])
      }, 2000);
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
    })
  }

}