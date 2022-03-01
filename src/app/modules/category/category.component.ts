import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { UsersService } from '../../services/users.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../libraries/alert/alert.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
  providers: [BidService, UsersService]
})

export class CategoryComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  user;
  categoryCreate;
  id;
  category;

  categorySubmitted = false;
  loader = false;

  constructor(public _bidService: BidService, public router: Router, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.categoryCreate = {
      "company_id": this.user.company_id,
      "category_name": "",
      "description": ""
    }

    this.readData()
    let id = _route.snapshot.params["id"];
    if (id) {
      this.getCategoryById(id);
    }
  }

  ngOnInit() {

  }

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
      this.category = resp['data']['category_data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Type by id calling
  getCategoryById(id) {
    this.loader = true
    this._bidService.getCategoryById({ "id": id }).subscribe(resp => {
      this.categoryCreate = resp['data']
      this.loader = false
    }, error => {
      this.loader = false
    })
  }
  // Create an Catgeory
  saveCategoryInfo() {
    this.categorySubmitted = true;
    if (this.categoryCreate.category_name == "") {
      this.alert.sweetError("Please enter mandatory fields");
      return
    }
    this.loader = true
    this._bidService.createCategory(this.categoryCreate).subscribe(resp => {
      this.alert.sweetSuccess("Category Created Sucessfully");
      this.loader = false
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['categoryList']);
      }, 1000);
    }, error => {
      this.alert.sweetError(error.error.msg);
      this.loader = false
    })
  }

  // Update an Category
  updateCategoryInfo() {
    this.categorySubmitted = true;
    if (this.categoryCreate.category_name == "") {
      this.alert.sweetError("Please enter mandatory fields");
      return
    }
    this.loader = true
    this.categoryCreate['id'] = this.categoryCreate._id;
    this._bidService.updateCategory(this.categoryCreate).subscribe(result => {
      this.alert.sweetSuccess("Category Updated Sucessfully");
      this.loader = false
      setTimeout(() => {
        this.loader = false
        this.router.navigate(['categoryList']);
      }, 2000);
    }, error => {
      this.alert.sweetError(error.error.msg);
      this.loader = false
    })
  }

  // For Reset Category name on Keyboard
  onResetCatgeoryInfo() {
    this.categoryCreate.category_name = '',
      this.categoryCreate.description = ''

  }
}