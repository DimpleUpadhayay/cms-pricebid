import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as validatorCtrl from '../../../libraries/validation';
import { UsersService } from '../../../services/users.service';
import { TerritoryService } from '../../../services/territories.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { UsersModel } from '../../../models/user.model';

import { BidService } from '../../../services/bid.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UsersService, TerritoryService, BusinessUnitService, BidService]
})

export class UsersComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  activeIndex;
  users = [];
  user_roles = [];
  territorys = [];
  business_units = [];
  form: FormGroup;
  errorMsg: any = "";
  user;
  userData;
  user_id = '';
  formEmpty;
  formSubmitted: boolean = false;
  btnDisabled: boolean = false;
  flag = false;
  managerList = [];
  loader = false;

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.target && event.target['id'] == "managerList" && ((event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8)) {
      this.showResults();
    }
  }

  constructor(public router: Router, public _UsersService: UsersService, public _formBuilder: FormBuilder,
    public _businessUnitService: BusinessUnitService,
    public _territoryService: TerritoryService,
    public route: ActivatedRoute, private _bidservice: BidService) {
    this.user_id = this.route.snapshot.params['id'];
    this.userData = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getBusinessUnits();
    this.getTerritories();
    this._UsersService.getUserRoles({ status: 'ACTIVE' }).subscribe(data => {
      this.user_roles = data['data']['roles'];
    });
    this.user = new UsersModel()
    this.user['user_role'] = "";
    if (this.user_id) {
      this.getUserById()
    }
    this.managerList.length = 1;
    this.defaultValid();
  }

  ngOnInit() {
    this.loader = true
    this.form = new FormGroup({
      'firstName': new FormControl(null, [
        Validators.required,
      ]),
      'lastName': new FormControl(null, [
        Validators.required,
      ]),
      'fullname': new FormControl(null, [
        Validators.required,
      ]),
      'username': new FormControl(null, [
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9_]{5,20}$")
      ]),
      'email': new FormControl(null, [
        Validators.required,
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")
      ]),
      'phone': new FormControl(null, [
        Validators.required,
        Validators.pattern("^[6-9][0-9]{9}$")
      ]),
      'password': new FormControl(null, [Validators.required,
      Validators.pattern("^(?=[a-zA-Z0-9!@#$%&*_?]{8,}$)(?=.*?[!@#$%&*_?])(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9]).*")
      ]),
      'confrm_password': new FormControl(null, Validators.required),
      'territory_ids': new FormControl(null, Validators.required),
      'role_id': new FormControl(null, Validators.required),
      'bu_ids': new FormControl(null, Validators.required),
      'manager_name': new FormControl(null, Validators.required),
      'manager_email': new FormControl(null, Validators.required),
      'manager_phone': new FormControl(null),
      'manager_emp_id': new FormControl(null),
      'emp_id': new FormControl(null),
      'title': new FormControl(null),
      'product_type': new FormControl(null),
      'isManager': new FormControl(false),
      'isBuHead': new FormControl(false),
      'buHeadArray': new FormControl(null, Validators.required),
      'isTerritoryHead': new FormControl(false),
      'territoryHeadArray': new FormControl(null, Validators.required),
      'userTypes': new FormControl(null),
      'userID': new FormControl(null)
    });
    this.onBUHeadCheckChange();
    this.onTerritoryHeadCheckChange();
  }

  // view entered password
  showPassword() {
    this.flag = !this.flag;
    if (this.flag)
      document.getElementById("pwd").setAttribute('type', 'text');
    else
      document.getElementById("pwd").setAttribute('type', 'password');
  }

  defaultValid() {
    for (var element in this.user) {
      this.user[element + 'RegexValid'] = true;
      this.user[element + 'RegexCompareValid'] = true;
    }
  }
  passwordMatchValidator(g: FormGroup) {
    return g.get('password').value === g.get('confrm_password').value
      ? null : g.get('confrm_password').setErrors({ 'mismatch': true });
  }

  get firstName() { return this.form.get('firstName'); }
  get lastName() { return this.form.get('lastName'); }
  get username() { return this.form.get('username'); }
  get confrm_password() { return this.form.get('confrm_password'); }
  get title() { return this.form.get('title'); }
  get email() { return this.form.get('email'); }
  get phone() { return this.form.get('phone'); }
  get password() { return this.form.get('password') }
  get territory() { return this.form.get('territory'); }
  get user_role() { return this.form.get('user_role'); }
  get business_unit() { return this.form.get('business_unit'); }
  get manager_name() { return this.form.get('manager_name'); }
  get manager_email() { return this.form.get('manager_email'); }
  get isManager() { return this.form.get('isManager'); }
  get userID() { return this.form.get('userID'); }
  get emp_id() { return this.form.get('emp_id'); }
  // get userTypes() { return this.form.get('userTypes'); }
  // get manager_emp_id() { return this.form.get('manager_emp_id'); }

  // get user details to update user
  getUserById() {
    this.loader = true
    this._UsersService.getUserById(this.user_id).subscribe(data => {
      this.user = data['data']['user'];
      this.user.firstName = this.user.firstName ? this.user.firstName : this.user.fullname.split(" ")[0];
      this.user.lastName = this.user.lastName ? this.user.lastName : this.user.fullname.split(" ")[1];
      this.defaultValid();
      this.user.userTypes = this.user.userTypes == undefined ? [] : this.user.userTypes;
      this.getBusinessUnits();
      this.getTerritories();
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  getCompanyUser() {
    this.loader = true
    let obj = { status: "ACTIVE" }
    this._UsersService.getUserData(obj).subscribe((data: any) => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data.code === 2000) {
        this.errorMsg = "";
      } else if (data.code === 3005) {
        this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data.code === 401) {
        this.users = [];
      } else if (data.code === 3012) {
        this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
      }
    }, error => {
      this.loader = false
    })
  }

  check(e) {
    this.user.isManager = e.target.checked;
    if (this.user.isManager) {
    }
  }

  onBUHeadCheckChange() {
    /* const buHeadArray = this.form.get('buHeadArray');
    if (!this.user.isBuHead) {
      buHeadArray.disable();
      this.user.buHeadArray = [];
    } else {
      buHeadArray.enable();
    }; */
  }

  onTerritoryHeadCheckChange() {
    /* const territoryHeadArray = this.form.get('territoryHeadArray');
    if (!this.user.isTerritoryHead) {
      territoryHeadArray.disable();
      this.user.territoryHeadArray = [];
    } else {
      territoryHeadArray.enable();
    } */
  }

  changeBUTerritory() {
    if (this.user.isManager) {
    }
  }

  buHead = []
  getBUHead() {
    this.buHead = [];
    if (this.user.bu_ids) {
      this.user.bu_ids.forEach(element => {
        this.business_units.forEach(item => {
          if (element == item.bu_id) {
            this.buHead.push(item);
          }
        })
      });
    }
    // console.log(this.buHead);
  }

  territoryHead = []
  getTerritoryHead() {
    this.territoryHead = [];
    if (this.user.territory_ids) {
      this.user.territory_ids.forEach(element => {
        this.territorys.forEach(item => {
          if (element == item.territory_id) {
            this.territoryHead.push(item);
          }
        })
      });
    }
    // console.log(this.territoryHead);
  }

  findManager() {
    let obj = {
      "bu_ids": this.user.bu_ids,
      "territory_ids": this.user.territory_ids,
      "manager_name": this.user.manager_name
    }
    this._bidservice.findManager(obj).subscribe(response => {
      if (response['data'] == null) {
        this.managerList = [];
        if (this.user.isManager)
          this.managerList = [{ fullname: "ROOT", manager_name: 'ROOT', email: 'NA', phone: "NA", user_id: "ROOT" }, ...this.managerList]
        $("#showResults").show();
        return;
      }
      this.managerList = response['data']['users'];
      if (this.user.isManager)
        this.managerList = [{ fullname: "ROOT", manager_name: 'ROOT', email: 'NA', phone: "NA", _id: "ROOT", user_id: "ROOT" }, ...this.managerList]
      $("#showResults").show();
      // console.log(this.managerList);
    }, error => {
    });
  }

  showResults() {
    var searchText = this.user.manager_name;
    if (searchText.length == 0) {
      this.managerList = undefined;
      this.managerList = [];
      this.managerList.length = 1;
      $("#showResults").hide();
      return;
    }
    this.findManager();
  }

  managerData;
  setData(item) {
    this.managerData = item;
    $("#showResults").hide();
    this.user.manager_name = item.fullname;
    this.user.manager_email = item.email;
    this.user.manager_phone = item.phone;
    this.user.parent_id = item._id;
    this.user.manager_id = item.user_id;
  }

  validate() {
    let validate = true;
    for (var element in this.user) {
      if (element && this.user[element] === '' && element != "user_role" && element != "userID") {
        validate = false;
      }
      if (this.user[element] && typeof this.user[element] == 'object' && this.user[element].length && this.user[element].length == 0) {
        validate = false;
      } else if (this.user[element] === null) {
        validate = true;
      }
    }
    return validate;
  }

  validateSingle(element) {
    let validate = true;
    if (element && this.user[element] === '') {
      validate = false;
    }
    if (typeof this.user[element] == 'object' && this.user[element].length == 0) {
      validate = false;
    }
    return validate
  }

  validateRegex(element) {
    let validate = true;
    this.user[element + 'RegexValid'] = true;
    this.user[element + 'RegexCompareValid'] = true;

    switch (element) {
      case 'username': {
        if (this.user[element] && !validatorCtrl.validateUsername(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'email': {
        if (this.user[element] && !validatorCtrl.validateEmail(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'password': {
        if (this.user[element] && !validatorCtrl.validatePassword(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      case 'confirm_password': {
        if (this.user[element] && !validatorCtrl.validatePassword(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        if (this.user[element] && validate && !validatorCtrl.comparePassword(this.user[element], this.user['password'])) {
          this.user[element + 'RegexCompareValid'] = false;
          validate = false;
        }
        break;
      }
      case 'phone': {
        if (this.user[element] && !validatorCtrl.validatePhone(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }
      /* case 'manager_email': {
        if (this.user[element] && !validatorCtrl.validateEmail(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      }

      case 'manager_phone': {
        if (this.user[element] && !validatorCtrl.validatePhone(this.user[element])) {
          this.user[element + 'RegexValid'] = false;
          validate = false;
        }
        break;
      } */
      default: {
        break;
      }
    }
    return validate && !this.formEmpty;
  }

  // validate fields with regex
  validateRegexAll() {
    let validate = true;
    for (var element in this.user) {
      this.user[element + 'RegexValid'] = true;
      this.user[element + 'RegexCompareValid'] = true;

      switch (element) {
        case 'username': {
          if (this.user[element] && !validatorCtrl.validateUsername(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'email': {
          if (this.user[element] && !validatorCtrl.validateEmail(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'password': {
          if (this.user[element] && !validatorCtrl.validatePassword(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        case 'confirm_password': {
          if (this.user[element] && !validatorCtrl.validatePassword(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          if (this.user[element] && validate && !validatorCtrl.comparePassword(this.user[element], this.user['password'])) {
            this.user[element + 'RegexCompareValid'] = false;
            validate = false;
          }
          break;
        }
        case 'phone': {
          if (this.user[element] && !validatorCtrl.validatePhone(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }
        /* case 'manager_email': {
          if (this.user[element] && !validatorCtrl.validateEmail(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        }

        case 'manager_phone': {
          if (this.user[element] && !validatorCtrl.validatePhone(this.user[element])) {
            this.user[element + 'RegexValid'] = false;
            validate = false;
          }
          break;
        } */
        default: {
          break;
        }
      }
    }
    return validate;
  }

  setRole(event) {
    this.user.userTypes = [];
    if (event) {
      event.forEach(element => {
        let obj = {
          "user_type": element.role_type,
          "user_subtype": element.sub_type
        }
        this.user.userTypes.push(obj);
      });
      /* let obj = {
        "user_type": event.role_type,
        "user_subtype": event.sub_type
      }
      this.user.userTypes.push(obj); */
    }
  }

  // create user
  addUser() {
    this.formSubmitted = true;
    if (!this.validate() || !this.validateRegexAll()) {
      this.alert.sweetError("Please enter mandatory fields");
      return false
    }
    this.user.fullname = this.user["firstName"] + " " + this.user["lastName"];
    //this.form.value['role_id'] = this.form.value['role_ids']
    this.form.value['user_role'] = "CUSTOM";
    this.form.value['username'] = this.form.value['username'].replace(/ /g, "_");
    this.form.value['fullname'] = this.user.fullname ? this.user.fullname : this.user.firstName + this.user.lastName;
    this.form.value['product_type'] = this.userData.product_type;
    this.form.value['isManager'] = this.user.isManager;
    this.form.value['userTypes'] = this.user.userTypes;
    if (this.managerData) {
      this.form.value['parent_id'] = this.managerData.user_id;
      this.form.value['manager_id'] = this.managerData._id;
    }

    if (this.user_roles && this.user_roles.length) {
      let a = this.user_roles.find(a => a.role_id == this.form.value['role_id']);
      this.form.value['user_type'] = a ? a.role_type : '';
      this.form.value['user_subtype'] = a ? a.sub_type : '';
    }
    this.btnDisabled = true;
    this.loader = true
    this._UsersService.registerUser(this.form.value).subscribe((data: any) => {
      if (data.code === 2000) {
        this.loader = false
        this.errorMsg = "";
        this.alert.sweetSuccess("User created successfully")
        setTimeout(() => {
          this.loader = false
          this.router.navigate(['user/list']);
        }, 2000);
      } else if (data.code === 3005) {
        this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (data.code === 401) {
        this.users = [];
      } else if (data.code === 3012) {
        this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (data.code === 3006) {
        this.errorMsg = "Ohh! Invalid User.";
      }
    }, (err) => {
      this.loader = false
      this.alert.sweetError(err.error.msg);
      this.formSubmitted = false;
      this.btnDisabled = false;
    })
  }
  validateCompanyAdmin() {
    if (this.user.firstName == "" || this.user.lastName == "" || this.user.phone == "" ||
      this.user.email == "") {
      return false;
    }
    return true;
  }

  // edit user
  updateUser() {
    this.formSubmitted = true;
    if ((!this.validate() || !this.validateRegexAll()) && this.user.user_role == 'CUSTOM') {
      this.alert.sweetError("Please enter mandatory fields");
      return false
    }
    if (this.managerList && this.managerList[0] && this.user.user_role == 'CUSTOM') {
      let ind = this.managerList.find(a => a.fullname == this.user.manager_name);
      if (!ind) {
        this.alert.sweetError("Please select manager name");
        return false;
      }
    }
    if (this.user.user_role == 'COMPANY_ADMIN' && !this.validateCompanyAdmin()) {
      this.alert.sweetError("Please enter mandatory fields");
      return
    }
    this.loader = true
    this.user.fullname = this.user["firstName"] + " " + this.user["lastName"];
    this.form.value['product_type'] = this.userData.product_type;
    //this.form.value['role_id'] = this.form.value['role_ids']
    this.form.value['user_role'] = this.user.user_role;
    this.form.value['username'] = this.form.value['username'].replace(/ /g, "_");
    this.form.value['user_id'] = this.user_id;
    this.form.value['password'] = this.user.password;
    this.form.value['fullname'] = this.user.fullname;
    this.form.value['isManager'] = this.user.isManager;
    this.form.value['userTypes'] = this.user.userTypes;
    if (this.managerData) {
      this.form.value['parent_id'] = this.managerData.user_id;
      this.form.value['manager_id'] = this.managerData._id;
    }

    this.btnDisabled = true;
    this._UsersService.updateUser(this.form.value).subscribe(data => {
      this.loader = false
      this.alert.sweetSuccess("User updated successfully");
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['user/list'])
      }, 2000);
      this.defaultValid();
    }, error => {
      this.loader = false
      this.alert.sweetError(error.error.msg);
      this.formSubmitted = false;
      this.btnDisabled = false;
    });
  }

  // get BUs
  getBusinessUnits() {
    this.loader = true
    this._businessUnitService.getBusinessUnits([]).subscribe(data => {
      this.onBUHeadCheckChange();
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data['code'] == 2000) {
        this.business_units = data['data'];
        this.getBUHead();
        this.loader = false
      }
    }, error => {
      this.loader = false
    });
  }

  // get territories
  getTerritories() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      this.onTerritoryHeadCheckChange();
      if (territories['data'] == null || territories['data'] == 'null') {
        this.loader = false
        return;
      }
      if (territories['code'] === 2000) {
        this.territorys = territories['data'];
        this.getTerritoryHead();
        this.loader = false    //this.errorMsg = "";
      } else if (territories['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (territories['code'] === 401) {
        //this.users = [];
      } else if (territories['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (territories['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
    }, error => {
      this.loader = false
    });
  }

}
