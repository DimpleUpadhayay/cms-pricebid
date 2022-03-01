import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { UsersService } from '../../../services/users.service';
import { AppModuleService } from '../../../services/module.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Roles } from '../../../models/role.model';

@Component({
  selector: 'app-user-role',
  templateUrl: './user_role.component.html',
  styleUrls: ['./user_role.component.css'],
  providers: [UsersService, AppModuleService]
})

export class UserRoleComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  formSubmitted: boolean = false;
  disableBtn = false;
  users = [];
  errorMsg: any = "";
  form: FormGroup;
  role: any;
  sub_roles = [];
  moduleList: any;
  tags: any;
  user;
  role_id;
  dropdownRoleSettings;
  dropdownSubRoleSettings;
  selectedRole: { role_id: "", name: "" }[] = [];
  selectedSubRole = [];
  flag = false;
  loader = false;

  constructor(public router: Router, public _moduleListService: AppModuleService,
    public _route: ActivatedRoute, public _UsersService: UsersService, public _formBuilder: FormBuilder) {
    this.role = new Roles();
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.dropdownRoleSettings = {
      singleSelection: true,
      idField: 'role_id',
      textField: 'name',
      // selectAllText: 'Select All',
      // unSelectAllText: 'UnSelect All',
      allowSearchFilter: false,
      // itemsShowLimit: 0,
    };
    this.dropdownSubRoleSettings = {
      singleSelection: true,
      idField: 'role_id',
      textField: 'name',
      allowSearchFilter: false,
    };
    this.getAppModules();
    this.getRoleTags();
    this.defaultValid();

    this.form = new FormGroup({
      'role_name': new FormControl(null, [
        Validators.required,
      ]),/*  'role_display_name': new FormControl(null, [
        Validators.required,
      ]), */
      'module_list': new FormControl(null, [
        Validators.required,
      ])
    });

    this.role_id = this._route.snapshot.params['id'];
    if (this.role_id)
      this.getRoleById();
  }

  ngOnInit() {
    this.loader = true
    this.setDisplayName();
  }

  setDisplayName() {
    let format = /_/;
    let check = format.test(this.role.name)
    if (check) {
      let roleName = this.role.name.split("_");
      roleName[0] + " " + roleName[1];
    }
    this.loader = false
  }

  // get types of modules eg. bid_creation
  getAppModules() {
    this.loader = true
    this._moduleListService.getModules({ parent_module_name: null }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      if (data['code'] == 2000) {
        this.moduleList = data['data']['modules'];
        this.role.module_list = this.moduleList;
        this.role.module_list.map(data => {
          data['module_name'] = data.module_name;
          data.flag = true;
          data.read = true;
          data.write = false;
        });
      }
    }, error => {
      this.loader = false
    });
  }

  // set role modules according to role types
  getRoleModuleMapping(role_id) {
    if (role_id == null) {
      return;
    }
    this.loader = true;
    if (this.role.role_type != "VIEWER") {
      this.flag = true;
    }
    if (this.role.role_type == "BID_OWNER") {
      this.sub_roles = ["Bid Manager", "Sales", "Presales", "All"];
    } else {
      this.sub_roles = ["Delivery", "Finance", "Legal", "Pricing", "Proposal", "Solution", "Sales", "All"];
    }
    let role_type = this.tags && this.tags.length > 0 ? this.tags.find(a => a.role_id == role_id).name : '';
    this.role['role_type'] = role_type;
    this._moduleListService.getRoleModuleMapping({ role_id: role_id, company_id: '0' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      this.role.module_list = data['data']['role_module_mapping'];
      this.role.module_list.map(data => {
        data['module_name'] = data.module_name;
        data.flag = true;
        data.read = data.action && data.action.read ? data.action.read : data.read || false;
        data.write = data.action && data.action.write ? data.action.write : data.write || false;
        data.action = undefined;
      });
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

  // fetch role details in edit role
  getRoleById() {
    this.loader = true;
    this._UsersService.getUserRoleById(this.role_id).subscribe(data => {
      this.role = data['data']['role'];
      this.selectedRole = [{ 'role_id': this.role.role_id, 'name': this.role.role_type }];
      this.selectedSubRole = [this.role.sub_type];
      // this.role.sub_role = (this.role.role_type.split("_")[1]);
      this.loader = false;
      if (this.role && this.role.role_type_id) {
        this.getRoleModuleMapping(this.role.role_type_id)
      }
      else {
        this.getRoleModuleMapping(this.role.role_id);
      }
      this.defaultValid();
    }, error => {
      this.loader = false;
    })
  }

  getRoleTags() {
    this.loader = true
    this._UsersService.getDefaultRoles({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      this.tags = data['data']['roles'];
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  onSelectRole(event) {
    // console.log(this.selectedRole);
    this.role.role_type_id = this.selectedRole[0].role_id;
    this.role.role_type = this.selectedRole[0].name;
    if (this.role.role_type == "VIEWER") {
      this.flag = false;
    }
    if (event.name == "BID_OWNER") {
      this.sub_roles = ["Bid Manager", "Sales", "Presales", "All"];
    } else {
      this.sub_roles = ["Delivery", "Finance", "Legal", "Pricing", "Proposal", "Solution", "Sales", "All"];
    }
    this.getRoleModuleMapping(this.role.role_type_id)
  }

  onDeSelectRole(event) {
    // console.log(this.selectedRole);
    this.role.sub_type = ""
    this.selectedSubRole = [];
    this.sub_roles = [];
  }

  onSelectSubRole(event) {
    // console.log(this.selectedSubRole);
    this.role.sub_type = this.selectedSubRole[0];
  }

  onDeSelectSubRole(event) {
    // console.log(this.selectedSubRole);
    this.role.sub_type = ""
  }

  updateValue(i, type, noType, value) {
    this['role']['module_list'][i][type] = value;
    this['role']['module_list'][i][noType] = !value;
  }

  validate() {
    let validate = true;
    for (var element in this.role) {
      this.role[element + 'Valid'] = true;
      if (element && (this.role[element] === '' || this.role[element] == undefined) && element != 'role_type_id' && element != 'sub_type') {
        this.role[element + 'Valid'] = false;
        validate = false;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;

    if (element && this.role[element] === '') {
      validate = false;
    }
    return validate
  }

  defaultValid() {
    for (var element in this.role) {
    }
    this.loader = false
  }

  // create role
  save() {
    this.formSubmitted = true;
    this.disableBtn = true;
    if (this.user.user_role != 'SUPPORT' && this.role.role_type != "VIEWER" && (!this.validate() || this.role.role_type_id == "" || this.role.role_type_id == null || this.role.sub_type == "")) {
      this.alert.sweetError("Please enter mandatory fields");
      this.disableBtn = false;
      return false;
    } else if (this.user.user_role == 'SUPPORT' && !this.validate()) {
      this.alert.sweetError("Please enter display name");
      this.disableBtn = false;
      return false;
    }
    this.loader = true;
    this._UsersService.createUserRole(this.role).subscribe((data: any) => {
      if (data.code === 2000) {
        this.alert.sweetSuccess("Role created successfully")
        setTimeout(() => {
          this.loader = false;
          this.router.navigate(['roles', 'list'])
        }, 2000);
        this.errorMsg = "";
        // this.dtTrigger.next();
      } else if (data.code === 3005) {
        this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data.code === 3012) {
        this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
      }
      setTimeout(() => {
        this.loader = false
        this.errorMsg = "";
      }, 500);
    }, (err) => {
      this.loader = false;
      this.alert.sweetError(err.error.msg);
      this.formSubmitted = false;
      this.disableBtn = false;
    })
  }

  // edit role
  update() {
    this.formSubmitted = true;
    this.disableBtn = true;
    if (this.user.user_role != 'SUPPORT' && this.role.role_type != "VIEWER" && (!this.validate() || this.role.role_type_id == "" || this.role.role_type_id == null || this.role.sub_type == "")) {
      this.alert.sweetError("Please enter mandatory fields");
      this.disableBtn = false;
      return false;
    } else if (this.user.user_role == 'SUPPORT' && !this.validate()) {
      this.alert.sweetError("Please enter display name");
      this.disableBtn = false;
      return false;
    }
    this.loader = true;
    this.form.value['role_id'] = this.role_id
    this.form.value['user_role'] = this.user.user_role
    this.form.value['user_id'] = this.user.user_id
    this.form.value['company_id'] = this.user.company_id
    this.form.value['role_type_id'] = this.role.role_type_id;
    this.form.value['role_type'] = this.role.role_type;
    this.form.value['name'] = this.role.name;
    if (this.user.user_role != 'SUPPORT') {
      this.form.value['sub_type'] = this.role.sub_type == undefined ? "All" : this.role.sub_type;
    }
    //this.form.value['display_name'] = this.role.display_name;
    this.form.value['module_list'] = this.role.module_list;

    this._UsersService.updateRole(this.form.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.alert.sweetSuccess("Role updated successfully")
        setTimeout(() => {
          this.loader = false;
          this.router.navigate(['roles', 'list'])
        }, 2000);
        this.errorMsg = "";
        // this.dtTrigger.next();
      } else if (data.code === 3005) {
        this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data.code === 3012) {
        this.errorMsg = "Your Email is Not Verified  kindly verify your email";
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
      }
      setTimeout(() => {
        this.loader = false
        this.errorMsg = "";
      }, 500);
    }, (err) => {
      this.loader = false;
      this.alert.sweetError(err.error.msg);
      this.formSubmitted = false;
      this.disableBtn = false;
    })
  }

}
