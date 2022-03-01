import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-clonecategory',
  templateUrl: './clonecategory.component.html',
  styleUrls: ['./clonecategory.component.css'],
  providers: [BidService]
})
export class ClonecategoryComponent implements OnInit {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  user;
  bidData;
  pocSubmited: boolean = false;
  access;
  userType;
  solutionCats;
  targetCat;
  allChecked;
  source;
  productType = ''
  solFlag = false;
  prosFlag = false;
  pricingFlag = false;
  loader = false;

  constructor(public _bidService: BidService, private _httpService: HttpService, private _activeRoute: ActivatedRoute, public dialogRef: MatDialogRef<ClonecategoryComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.productType = this.user.product_type
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.solutionCats = data.categoryData;
    this.userType = data['user_type'];
    this.source = data.type;
    this.solutionCats.forEach(item => {
      item.checked = false
    });
    if (this.productType == 'nonpricing') {
      this.targetCat = [
        { name: "Solution", checked: false },
        { name: "Proposal", checked: false },
        { name: "Pricing", checked: false }
      ]
    }
    if (this.productType == 'pricing') {
      this.targetCat = [
        { name: "Solution", checked: false },
        { name: "Proposal", checked: false }
      ]
    }
    dialogRef.disableClose = true;
    this.getBidById();

  }

  ngOnInit() {

  }

  getBidById() {
    this.loader = true;
    this._bidService.getBidById(this.bidData.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.loader = false
    });
  }
  // Bid Manager didn't select solution Reviewer
  validateSolRev(index) {
    let solRevData = this.bidData.participants.filter(item =>
      (item.userTypes[0].user_subtype == "Solution" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER"))
    if (solRevData.length == 0) {
      this._alert.sweetError("Please Select Solution/Delivery/All/Sales Reviewer in Bid Creation")
      setTimeout(() => {
        this.targetCat[index].checked = false;
      }, 10)
    }
  }

  // Bid Manager didn't select proposal Reviewer
  validateProRev(index) {
    let proposalRevData = this.bidData.participants.filter(item =>
      (item.userTypes[0].user_subtype == "Proposal" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER"))

    if (proposalRevData.length == 0) {
      this._alert.sweetError("Please Select Proposal/Delivery/All/Sales Reviewer in Bid Creation")
      setTimeout(() => {
        this.targetCat[index].checked = false;
      }, 10)
    }
  }

  // Bid Manager didn't select Pricing Reviewer
  validatePricingRev(index) {
    let pricingRevData = this.bidData.participants.filter(item =>
      (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
      (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER"))
    if (pricingRevData.length == 0) {
      this._alert.sweetError("Please Select Delivery/All/Sales Reviewer in Bid Creation")
      setTimeout(() => {
        this.targetCat[index].checked = false;
      }, 10)
    }
  }

  validatecheck(res, index) {
    if (res == "Solution" && index == 0) {
      this.validateSolRev(index);
    }
    if (res == "Proposal" && index == 1) {
      this.validateProRev(index);
    }
    if (res == "Pricing" && index == 2) {
      this.validatePricingRev(index);
    }
  }


  validatecheckAll(catgeories) {
    this.solFlag = false;
    this.prosFlag = false;
    this.pricingFlag = false;
    if (catgeories[0].name == "Solution") {
      let solRevData = this.bidData.participants.filter(item =>
        (item.userTypes[0].user_subtype == "Solution" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER"))

      if (solRevData.length == 0) {
        this.solFlag = true
        setTimeout(() => {
          catgeories.filter(item => {
            if (item.name == "Solution") {
              item.checked = false
            }
          })
        }, 10)
      }
    }
    if (catgeories[1].name == "Proposal") {
      let proposalRevData = this.bidData.participants.filter(item =>
        (item.userTypes[0].user_subtype == "Proposal" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER"))

      if (proposalRevData.length == 0) {
        this.prosFlag = true;
        setTimeout(() => {
          catgeories.filter(item => {
            if (item.name == "Proposal") {
              item.checked = false
            }
          })
        }, 10)
      }
    }
    if (catgeories[2].name == "Pricing") {
      let pricingRevData = this.bidData.participants.filter(item =>
        (item.userTypes[0].user_subtype == "Delivery" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "All" && item.userTypes[0].user_type == "REVIEWER") ||
        (item.userTypes[0].user_subtype == "Sales" && item.userTypes[0].user_type == "REVIEWER"))

      if (pricingRevData.length == 0) {
        this.pricingFlag = true;
        setTimeout(() => {
          catgeories.filter(item => {
            if (item.name == "Pricing") {
              item.checked = false
            }
          })
        }, 10)
      }
    }
    if (this.solFlag && this.prosFlag && this.pricingFlag) {
      this._alert.sweetError("Please select Solution, Proposal, Delivery/All/Sales Reviewer in Bid Creation")
    }
    else if (this.solFlag && !this.prosFlag && !this.pricingFlag) {
      this._alert.sweetError("Please select Solution Reviewer in Bid Creation")
    }
    else if (!this.solFlag && this.prosFlag && !this.pricingFlag) {
      this._alert.sweetError("Please select Proposal Reviewer in Bid Creation")
    }
    else if (!this.solFlag && !this.prosFlag && this.pricingFlag) {
      this._alert.sweetError("Please select Delivery/All/Sales Reviewer in Bid Creation")
    }
    else if (this.solFlag && this.prosFlag && !this.pricingFlag) {
      this._alert.sweetError("Please select Solution and Proposal Reviewer in Bid Creation")
    }
    else if (!this.solFlag && this.prosFlag && this.pricingFlag) {
      this._alert.sweetError("Please select Proposal and Delivery/All/Sales Reviewer in Bid Creation")
    }
    else if (this.solFlag && !this.prosFlag && this.pricingFlag) {
      this._alert.sweetError("Please select Solution and Delivery/All/Sales Reviewer in Bid Creation")
    }
  }

  onClickAllDestin(event, categories) {
    if (event.target.checked) {
      this.validatecheckAll(categories)
      categories.forEach(item => {
        item.checked = true;
      })
    } else {
      categories.forEach(item => {
        item.checked = false;
      })
    }
  }

  onClickAllCateg(event, categories) {
    if (event.target.checked) {
      categories.forEach(item => {
        item.checked = true;
      })
    } else {
      categories.forEach(item => {
        item.checked = false;
      })
    }
  }

  validate() {
    let solutionCatsValid = this.solutionCats.some(x => x.checked);
    if (!solutionCatsValid) {
      this._alert.sweetError("Please select the Category you want to Clone")
      return false;
    }
    let targetValid = this.targetCat.some(x => x.checked);
    if (!targetValid) {
      this._alert.sweetError("Please select the Path where you want to Clone")
      return false;
    }
    return true
  }

  onClone() {
    if (!this.validate()) {
      return;
    }
    let request = {
      "user": this.user.user_id,
      "bid_id": this.bidData.bid_id,
      "user_type": this.userType,
      "source": this.source
    }
    let sourceCats = this.solutionCats.filter(x => x.checked);
    request['sourceCategories'] = sourceCats.map(item => {
      return {
        "cat_id": item.id,
        "new_name": item.name
      }
    })
    let destinationCats = this.targetCat.filter(x => x.checked);
    request['destination'] = destinationCats.map(item => item.name);
    this._bidService.getClone(request).subscribe(res => {
      this.dialogRef.close();
      this._alert.sweetSuccess("Cloned Successfully")
    }, error => {
      this._alert.sweetError(error.error.msg);
    })
  }

  onReset() {
    this.targetCat.forEach(item => item.checked = false)
    this.solutionCats.forEach(item => item.checked = false)
    this.allChecked = false
  }
  onClose() {
    this.dialogRef.close()
  }

}
