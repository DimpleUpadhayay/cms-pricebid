import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { UsersService } from '../../../services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.css'],
  providers: [BidService, UsersService]
})

export class TypeComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  user;
  typeCreate;
  id;
  // Boolean
  typeSubmitted = false;
  loader = false;

  constructor(public _bidService: BidService, public router: Router, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];

    this.typeCreate = {
      "company_id": this.user.company_id,
      "type_name": "",
      "description": ""
    }

    this.readData()
    let id = _route.snapshot.params["id"];
    if (id) {
      this.getTypeById(id);
    }
  }
  type;
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
      this.type = resp['data']['type_data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Type by id calling
  getTypeById(id) {
    this.loader = true
    this._bidService.getTypeById({ "id": id }).subscribe(resp => {
      this.typeCreate = resp['data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }


  // Create an Type
  saveTypeInfo() {
    this.typeSubmitted = true;
    if (this.typeCreate.type_name == "") {
      this.alert.sweetError("Please enter mandatory fields");
      return
    }
    this.loader = true
    this._bidService.createType(this.typeCreate).subscribe(resp => {
      this.alert.sweetSuccess("Type Created Sucessfully");
      this.loader = false
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['typeList']);
      }, 1000);
    }, error => {
      this.alert.sweetError(error.error.msg);
      this.loader = false
    })
  }

  // Update an Type
  updateTypeInfo() {
    this.typeSubmitted = true
    if (this.typeCreate.type_name == "") {
      this.alert.sweetError("Please enter mandatory fields");
      return
    }
    this.loader = true
    this.typeCreate['id'] = this.typeCreate._id;
    this._bidService.updateType(this.typeCreate).subscribe(result => {
      this.alert.sweetSuccess("Type Updated Sucessfully");
      this.loader = false
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['typeList']);
      }, 1000);
    }, error => {
      this.alert.sweetError(error.error.msg);
      this.loader = false
    })
  }
  // For Reset type name on Keyboard
  onResetTypeInfo() {
    this.typeCreate.type_name = "",
      this.typeCreate.description = ''

  }


  ngOnInit() {

  }

}
