import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute, Router } from '@angular/router';

import { HttpService } from '../../../services/http.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { MatDialog } from '@angular/material';
import { TerritoryService } from '../../../services/territories.service';
import { BusinessUnitService } from '../../../services/businessUnit.service';
import { ApprovalChainService } from '../../../services/approvalChain.service';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-viewbid',
  templateUrl: './viewbid.component.html',
  styleUrls: ['./viewbid.component.css'],
  providers: [BidService, TerritoryService, BusinessUnitService, ApprovalChainService, UsersService]
})
export class ViewbidComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  user;
  bid_id;
  bidData;
  tags;
  category;
  categoryName;
  tagsName = []
  type;
  typeList = []
  territoryData;
  territoryName = []
  businessData;
  businessDataName = []
  approvalChain;
  approvalChainName;
  loader = false;
  salesManagerName;

  constructor(public _bidService: BidService, public _territoryService: TerritoryService,
    public _businessUnitService: BusinessUnitService,
    public _userservices: UsersService,
    public _approvalChainService: ApprovalChainService,
    private _httpService: HttpService, public dialog: MatDialog,
     public _activeRoute: ActivatedRoute) {

    this.bid_id = _activeRoute.snapshot.params['id']
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getBidById()
  }

  ngOnInit() {

  }

  // get bid by id response
  getBidById() {
    this.loader = true
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      if (data['data'] == null) {
        this.loader = false
        return;
      }
      this.bidData = data['data']['bid'];
      this.readCategoryData()
      this.readTypeData()
      this.getTerritory()
      this.getBusinessUnit()
      this.getContributorAndReviewers()
      this.getApprovalChain()
      this.bidManagerName()
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  bidManagerName(){
    this.bidData.participants.forEach(result => {
      if (result.user_id == this.bidData.user_id && result.userTypes[0].user_type == "BID_OWNER" && result.userTypes[0].user_subtype == "Sales")
        this.salesManagerName = result.username + " - " + result.userTypes[0].user_subtype;
    })
  }


  // Category Data Api Call showing CategoryName
  readCategoryData() {
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
      this.category.forEach(item => {
        if (item._id == this.bidData.category)
          this.categoryName = item.category_name
      })
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Type Data Api Call showing TypeName
  readTypeData() {
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
      this.type = resp['data']['type_data'];
      if (this.bidData.types && this.bidData.types.length != 0) {
        this.bidData.types.forEach(element => {
          this.type.forEach(item => {
            if (element == item._id) {
              this.typeList.push(item.type_name)
            }
          })
        })
      }
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // TerritoryName
  getTerritory() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data['code'] == 2000) {
        this.territoryData = data['data']
        this.territoryData.forEach(item => {
          this.bidData.territory_ids.forEach(element => {
            if (item.territory_id == element) {
              this.territoryName.push(item.name)
            }
          })
        })
      }
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Businessunit Name Api call

  getBusinessUnit() {
    this._businessUnitService.getBusinessUnits({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data['code'] == 2000) {
        this.businessData = data['data']
        this.businessData.forEach(item => {
          this.bidData.bu_ids.forEach(element => {
            if (item.bu_id == element) {
              this.businessDataName.push(item.name)
            }
          })
        })
      }
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Contributor Name and Reviewer Name
  companyUserCR;
  contributorName = [];
  reviewerName = [];
  getContributorAndReviewers() {
    this.loader = true
    this._userservices.getCompanyUserData({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null) {
        this.loader = false
        return
      }
      if (data['code'] == 2000) {
        this.companyUserCR = data['data']['users']
        this.companyUserCR.forEach(item => {
          this.bidData.contributor.forEach(element => {
            if (item.user_id == element) {
              this.contributorName.push(item.username + " - " + item.user_subtype)
            }
          })
        })
        this.companyUserCR.forEach(item => {
          this.bidData.reviewer.forEach(element => {
            if (item.user_id == element) {
              this.reviewerName.push(item.username + " - " + item.user_subtype)
            }
          })
        })
      }
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Approval Chain
  getApprovalChain() {
    this.loader = true
    this._approvalChainService.getApprovalChain({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null) {
        this.loader = false
        return
      }
      this.approvalChain = data['data']['approval_chains']
      this.approvalChain.forEach(item => {
        if (item.ac_id == this.bidData.approval_chain) {
          this.approvalChainName = item.name
        }
      })
      this.loader = false
    }, error => {
      this.loader = false
    })
  }

  // Attachments List
  onDownloadDialog() {
    if (this.bidData.attachment_data.length == 0) {
      this.alert.sweetNoAttachments()
      return
    }
    if (this.bidData['attachment_data']) {
      const dialogRef = this.dialog.open(DownloadComponent, {
        height: '365px',
        width: '850px',
        data: this.bidData
      });
    }
  }
}
