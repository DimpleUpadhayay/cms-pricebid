import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { isUndefined } from 'util';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { MatDialog } from '@angular/material';
import { ProjectScopeService } from '../../../services/ps.service';
import { BidService } from '../../../services/bid.service';
import { PocDashboardService } from '../../../services/poc.service';
import { SharedService } from '../../../services/shared.service';
import { ProjectScope } from '../../../models/ps.model';
import { UploadfileComponent } from '../../../components/upload-file/upload-file.component';
import { DownloadComponent } from '../../../components/download/download.component';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'ps-child',
  templateUrl: './ps.child.component.html',
  styleUrls: ['./ps.child.component.css'],
  providers: [ProjectScopeService, NgbModal, MatDialog, BidService, PocDashboardService]

})
export class psChildComponent implements OnInit, OnDestroy {
  @Input('read')
  @ViewChild(AlertComponent) alert: AlertComponent;

  Obj: any;
  public ps;
  productType = ''
  public submitted = false;
  public eligibility: boolean = true;
  formSubmitted: boolean = false;
  dt = new Date();
  minDate = new Date(this.dt.getFullYear(), this.dt.getMonth(), this.dt.getDate());
  public user;
  user_type;
  user_subtype;
  bid_id;
  parsedData;
  poc;
  pocSubmited: boolean = false
  RFI = false;
  reviewData;
  reviewFlag = true;
  proposalReviewFlag = true;
  solutionReviewFlag = true;
  reviewCount = 0;
  participantLength = 0;
  bid;
  submission_date;
  refreshObj;
  access;
  value = "Account Info";
  scope_id;
  loader = false;
  isCoOwner = false;
  bidStatus = "";

  constructor(private _psService: ProjectScopeService, public router: Router,
    public dialog: MatDialog,
    public modalService: NgbModal, private _activeRoute: ActivatedRoute,
    public _sharedService: SharedService, public _pocService: PocDashboardService,
    public _bidService: BidService, private _httpService: HttpService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.productType = this.user.product_type == undefined ? 'pricing' : this.user.product_type;
    this.ps = new ProjectScope();
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.parsedData = JSON.parse(localStorage.getItem("parsedData"))
    // req obj to refresh other users data
    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "PROJECT_SCOPE",
      sub_module: "",
    };
    this.accessControl();
    // refresh call
    this._sharedService.newData.subscribe(a => {
      if (a.data == 'project_scope' && this.user_type != "BID_OWNER") {
        this.getProjectScopeRefresh();
      }
    });
  }

  accessControl() {
    this._httpService.accessControl({
      "module": "projectScope",
      "user_id": this.user.user_id,
      "bid_id": this.bid_id
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.participants[0].userTypes[0].user_type;
      this.user_subtype = this.access.participants[0].userTypes[0].user_subtype;
      this.isCoOwner = this.access.participants[0].userTypes[0].coOwner ? true : false;
      this.getBidById();
      this.getPoc();
      this.getReview();
      this.getTechSolutionReview();
      this.getProposalReview();
      this.getProjectScopeRefresh();
    }, error => {
      // console.log(error);
    });
  }

  /*  parsing() {
       if (this.parsedData && this.parsedData.bid_id == this.bid_id) {
           this.ps.scope_summary[0].name = this.parsedData.scope_summary ? this.parsedData.scope_summary : "";
           this.ps.timeline[0].name = this.parsedData.timeline ? this.parsedData.timeline : "";
           this.ps.criterion.eligibility[0].name = this.parsedData.eligibility ? this.parsedData.eligibility : "";
           this.ps.criterion.evaluation[0].name = this.parsedData.evaluation ? this.parsedData.evaluation : "";
           if (this.parsedData.finterm) {
               this.ps.financial[0].value = this.parsedData.finterm.payment ? this.parsedData.finterm.payment : "";
               this.ps.financial[1].value = this.parsedData.finterm.emd ? this.parsedData.finterm.emd : "";
               this.ps.financial[2].value = this.parsedData.finterm.bg ? this.parsedData.finterm.bg : "";
               this.ps.financial[3].value = this.parsedData.finterm.ld ? this.parsedData.finterm.ld : "";
               this.ps.financial[4].value = this.parsedData.finterm.penalty ? this.parsedData.finterm.penalty : "";
               this.ps.financial[5].value = this.parsedData.finterm.sla ? this.parsedData.finterm.sla : "";
               this.ps.financial[6].value = this.parsedData.finterm.psd ? this.parsedData.finterm.psd : "";
           }
           if (this.parsedData.delivery) {
               this.ps.delivery_tc[0].name = this.parsedData.delivery.delivery ? this.parsedData.delivery.delivery : "";
               this.ps.delivery_tc[1].name = this.parsedData.delivery.delivarable ? this.parsedData.delivery.delivarable : "";
               this.ps.delivery_tc[2].name = this.parsedData.delivery.milesone ? this.parsedData.delivery.milesone : "";
           }
           if (this.parsedData.support) {
               this.ps.support[0].name = this.parsedData.support.warranty ? this.parsedData.support.warranty : "";
               this.ps.support[1].name = this.parsedData.support.support ? this.parsedData.support.support : "";
           }
           this.ps.annexures[0].name = this.parsedData.annex.annex ? this.parsedData.annex.annex : "";
           this.ps.bid_id = this.bid_id;
           this.ps.company_id = this.user.company_id;
       }
   } */

  /* createParse() {
      if (this.ps.bid_id) {
          this._psService.createProjectScope(this.ps).subscribe(data => {
              localStorage.removeItem('parsedData');
          }, error => {
              this.alert.sweetError("Failed");
          })
      }
  } */

  /* updateParse() {
      this._psService.updateProjectScope(this.ps).subscribe(data => {
          localStorage.removeItem('parsedData');
      }, error => {
          this.alert.sweetError("Failed");
      })
  } */

  /* open(content) {
      this.modalService.open(content)
  } */

  getBidById() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      this.bidStatus = this.bid.bidFinalStatus ? this.bid.bidFinalStatus : "";
      this.submission_date = new Date(this.bid.date_submission);
    })
  }

  versionData;
  attachment_data = [];
  // upload documents
  openDialog(k, type, subType): void {
    if (!this.reviewFlag || this.pocSubmited || this.bid.parent || this.isCoOwner || this.bidStatus == 'DROPPED') {
      return;
    }
    let obj = {
      "bid_id": this.bid_id,
      "type": 'project_scope'
    }
    const dialogRef = this.dialog.open(UploadfileComponent, {
      height: '340px',
      width: '850px',
      data: this.versionData ? this.versionData : obj
    });
    dialogRef.afterClosed().subscribe(result => {
      this.versionData = undefined;
      if (!result || result.length == 0) {
        return
      }
      for (var i = 0; i < result.length; i++) {
        let obj;
        obj = {
          "attachment_id": result[i].attachment_id,
          "attachment_n": result[i].original_name,
          "attachment_path": result[i].filename,
          "description": result[i].description,
          "type": "BID_PROJECT_SCOPE",
          "doc_version": result[i].doc_version,
          "user_id": result[i].user_id,
          "revision": result[i].revision ? result[i].revision : false,
          "parent_id": result[i].parent_id ? result[i].parent_id : "",
          "flag": result[i].flag,
          "isPublic": result[i].isPublic,
          "level": result[i].level
        }
        //this.attachment_data.push(obj)
        if (isUndefined(subType)) {
          this['ps'][type][k].attachment_data.push(obj);
        } else {
          this['ps'][type][subType][k].attachment_data.push(obj);
        }
      }
      if (result.length != 0)
        this.updateAttachment();
      /* if (isUndefined(subType)) {
          if (this['ps'][type][k].attachment_data) {
              this.attachment_data.forEach(item => {
                  this['ps'][type][k].attachment_data.push(item);
              })
          } else {
              this['ps'][type][k].attachment_data = this.attachment_data;
          }
      } else {
          if (this['ps'][type][subType][k].attachment_data) {
              this.attachment_data.forEach(item => {
                  this['ps'][type][subType][k].attachment_data.push(item);
              })
          } else {
              this['ps'][type][subType][k].attachment_data = this.attachment_data;
          }
      }
      this.attachment_data = []; */
    });
  }

  // save as draft call after upload or delete attachments
  updateAttachment() {
    this.ps.bid_id = this.bid_id;
    this.ps.company_id = this.user.company_id;

    if (this.ps && this.ps.date_created) {
      this._psService.updateProjectScope(this.ps).subscribe(success => {
        this.getProjectScopeRefresh();
      }, error => {
        this.alert.sweetError("Something went wrong");
      });
    } else {
      this._psService.createProjectScope(this.ps).subscribe(success => {
        this.getProjectScopeRefresh();
      }, error => {
        this.alert.sweetError("Something went wrong");
      });
    }
  }


  ngOnInit(): void {
    this.loader = true;
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }


  validate() {
    let validate = true;
    for (var key in this.ps) {
      if (Array.isArray(this.ps[key])) { // array type validation
        if (this.ps[key].length) {
          this.ps[key].forEach(element => {
            if (typeof element === 'object') {
              for (var key in element) {
                if (typeof element[key] === 'string' && !element[key]) {
                  validate = false;
                }
              }
            }
          });
        }
      }
      else if (typeof this.ps[key] === 'object') { //object type validation
        ['eligibility', 'evaluation'].forEach(a => {
          this.ps[key][a].forEach(element => {
            if (typeof element === 'object') {
              for (var key in element) {
                if (typeof element[key] === 'string' && !element[key]) {
                  validate = false;
                }
              }
            }
          });
        })
      }
      else if (typeof this.ps[key] === 'string') { //stirng type validation
      }
    }
    return validate;
  }

  downloadIndex;
  onDownloadDialog(index, type, subtype) {
    if (subtype && this.ps[type][subtype][index].attachment_data.length == 0) {
      this.alert.sweetNoAttachments();
      return;
    } else if (type != 'criterion' && this.ps[type][index].attachment_data.length == 0) {
      this.alert.sweetNoAttachments();
      return;
    }
    this.downloadIndex = index;
    if (subtype != undefined) {
      this.ps[type][subtype][index].ps_type = subtype;
      this.ps[type][subtype][index].scope_id = this.ps.scope_id;
      this.ps[type][subtype][index].participants = this.ps.participants;
    } else {
      this.ps[type][index].ps_type = type;
      this.ps[type][index].scope_id = this.ps.scope_id;
      this.ps[type][index].participants = this.ps.participants;
    }
    if (this.ps && this.ps[type]) {
      const dialogRef = this.dialog.open(DownloadComponent, {
        height: '365px',
        width: '850px',
        data: isUndefined(subtype) ? this.ps[type][index] : this.ps[type][subtype][index]
      });
      dialogRef.afterClosed().subscribe(result => {
        /* if (result) {
            isUndefined(subtype) ? this.ps[type][index].attachment_data.splice(result, 1) : this.ps[type][subtype][index].splice(result, 1)
            //this.update('')
        } */
        if (!result) {
          return;
        } else if (result == true) {
          this.updateAttachment();
        } else if (result) {
          this.versionData = result;
          this.openDialog(index, type, subtype);
        }
      });
    }
  }
  // BM can add the row
  addItem(type, subType) {
    if (this.isCoOwner) {
      return;
    }
    let obj = {
      name: '',
      attachment_data: [],
      type: 'input',
      read: false,
      allIcon: true
    }
    if (subType) {
      this['ps'][type][subType].push(obj);
      return
    }
    this['ps'][type].push(obj);
  }
  // BM can delete the row
  deleteItem(i, type, subType) {
    if (this.user_type != "BID_OWNER" || this.pocSubmited || this.bid.parent || this.isCoOwner || this.bidStatus == 'DROPPED') {
      return;
    }

    if (subType && this['ps'][type][subType][i].name == "") {
      this['ps'][type][subType].splice(i, 1);
      return
    }
    else if (subType && this['ps'][type][subType][i].name != "") {
      this.alert.deleted("").then(success => {
        this['ps'][type][subType].splice(i, 1);
        return
      }, error => {
        return;
      })
    }

    if (type != 'criterion' && this['ps'][type][i].name == "") {
      this['ps'][type].splice(i, 1);
      return;
    }
    else if (type != 'criterion' && this['ps'][type][i].name != "") {
      this.alert.deleted("").then(success => {
        this['ps'][type].splice(i, 1);
        return
      }, error => {
        return
      });
    }

    if (this.ps._id) {
      // this.alert.deleted("").then(success => {
      // if (subType && this['ps'][type][subType][i].allIcon) {
      //   this['ps'][type][subType].splice(i, 1);
      // }
      // if (type != 'criterion' && this['ps'][type][i].allIcon) {
      //   this['ps'][type].splice(i, 1);
      // }
      //update
      this._psService.updateProjectScope(this.ps).subscribe(data => {
      }, error => {
        this.alert.sweetError("Failed");
      })
      // }, error => {
      //   return;
      // });
    }
  }

  // create project scope
  createProjectScope(value) {
    this.formSubmitted = true;
    this.ps.bid_id = this.bid_id;
    this.ps.company_id = this.user.company_id;

    if (!value) {
      // if (!this.validate()) {
      //     this.alert.sweetToast("Please fill all sections before submitting")
      //     return
      // }
      this.ps['submitted'] = true;
      this.ps['participants'] = [this.user.user_id];
      this.alert.submitPS('').then(a => {
        this.save(value);
      }, error => {
        return;
      });
      return
    }
    this.save(value);
  }

  save(value) {
    localStorage.removeItem('parsedData');
    this.loader = true;
    this._psService.createProjectScope(this.ps).subscribe(data => {
      // console.log(data, data['data']['projectscopes']);
      this.scope_id = data['data']['projectscopes']['scope_id'];
      // console.log(this.scope_id)
      if (value) {
        this.alert.sweetSuccess("Data saved as draft");
        this.getProjectScopeRefresh();
        this.loader = false;
        return;
      }
      this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.loader = false;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    }, error => {
      this.alert.sweetError("Failed");
      this.loader = false;

    })
  }

  // update project scope
  updateProjectScope(value) {
    this.formSubmitted = true;
    if (!value) {
      // if (!this.validate()) {
      //     this.alert.sweetToast("Please fill all sections before submitting")
      //     return
      // }
      this.ps['submitted'] = true;
      this.ps['participants'] = [this.user.user_id];
      this.alert.submitPS('').then(a => {
        this.update(value);
      }, error => {
        return;
      });
      return;
    }
    this.update(value);
  }

  update(value) {
    localStorage.removeItem('parsedData');
    this.loader = true;
    if (this.ps && !this.ps.scope_id) {
      this.ps['scope_id'] = this.scope_id ? this.scope_id : ''
    }
    this._psService.updateProjectScope(this.ps).subscribe(data => {
      if (value) {
        this.alert.sweetSuccess("Data saved as draft");
        this.loader = false;
        return;
      }
      this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
      }, cancel => {
      });
      this.loader = false;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    }, error => {
      this.loader = false;
      this.alert.sweetError("Failed");
    })
  }

  onSelect(data: TabDirective): void {
    this.value = data.heading;
  }

  // reset project scope
  reset() {
    switch (this.value) {
      // case 'Scope': {
      //   this.ps.scope_summary[0].name = "";
      //   break;
      // }
      case 'Account Info': {
        this.ps.executive_summary.forEach(element => {
          element.value = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Timeline': {
        this.ps.timeline.forEach(element => {
          element.name = "";
          element.value = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Financial T & Cs': {
        this.ps.financial.forEach(element => {
          element.value = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Delivery T & Cs': {
        this.ps.delivery_tc.forEach(element => {
          element.name = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Support T & Cs': {
        this.ps.support.forEach(element => {
          element.name = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Docs Required': {
        this.ps.docs.forEach(element => {
          element.name = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Annexures': {
        this.ps.annexures.forEach(element => {
          element.name = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Scope': {
        this.ps.account.forEach(element => {
          element.value = "";
          element.attachment_data = [];
        });
        break;
      }
      case 'Criterion': {
        if (this.eligibility) {
          this.ps.criterion.eligibility.forEach(element => {
            element.name = "";
            element.attachment_data = [];
          });
        } else {
          this.ps.criterion.evaluation.forEach(element => {
            element.name = "";
            element.attachment_data = [];
          });
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  // get project scope details
  // getProjectScope() {
  //   this._psService.getProjectScopes(this.bid_id, this.user_type).subscribe(ProjectScopes => {
  //     if (ProjectScopes['data'] == null) {
  //       this.loader = false;
  //       return;
  //     }
  //     if (ProjectScopes['code'] === 2000) {
  //       this.ps = ProjectScopes['data']['projectscope_data'][0];
  //       this.participantLength = this.ps.participants.length;
  //       this.loader = false;
  //       if (this.ps.status && this.parsedData) {
  //         // this.parsing();
  //         // this.updateParse();
  //       }
  //       if (this.ps.participants && this.ps.participants.indexOf(this.user.user_id) >= 0) {
  //         this.submitted = true;
  //       }
  //     } else if (ProjectScopes['code'] === 3005) {
  //       //this.errorMsg = "Ohh! It seems you are not connected with us yet";
  //     } else if (ProjectScopes['code'] === 401) {
  //       //this.users = [];
  //     } else if (ProjectScopes['code'] === 3012) {
  //       //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
  //     } else if (ProjectScopes['code'] === 3006) {
  //       //this.errorMsg = "Ohh! Invalid User.";
  //     }
  //   }, error => {
  //     this.loader = false;
  //     if (!this.ps.status) {
  //       // this.parsing();
  //       // this.createParse();
  //     } else {
  //       // this.parsing();
  //       // this.updateParse();
  //     }
  //   });
  // }

  getProjectScopeRefresh() {
    this._psService.getProjectScopes(this.bid_id, this.user_type).subscribe(ProjectScopes => {
      if (ProjectScopes['data'] == null) {
        this.loader = false;
        return;
      }
      if (ProjectScopes['code'] === 2000) {
        this.ps = ProjectScopes['data']['projectscope_data'][0];
        this.participantLength = this.ps.participants.length;
        this.loader = false;
        if (this.ps.status && this.parsedData) {
          // this.parsing();
          // this.updateParse();
        }
        if (this.ps.participants && this.ps.participants.indexOf(this.user.user_id) >= 0) {
          this.submitted = true;
        }
      } else if (ProjectScopes['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (ProjectScopes['code'] === 401) {
        //this.users = [];
      } else if (ProjectScopes['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (ProjectScopes['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
    }, error => {
      this.loader = false;
      // this.parsing();
      if (!this.ps.status) {
        // this.createParse();
      } else {
        // this.updateParse();
      }
    });
  }

  // To check whether bid is under approval or not
  getPoc() {
    this._pocService.getPocDashboards({ bid_id: this.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (!this.poc) {
        return;
      }
      if (this.poc && this.poc['bid_id']) {
        if (this.poc['process'] && this.poc['process'].findIndex(a => a.action == 'RFI' && a.status == true) >= 0) {
          this.pocSubmited = false;
          this.RFI = true;
          return
        }
        this.pocSubmited = true;
      }
    })
  }

  // To check whether bid is under pricing review or not
  getReview() {
    this._bidService.getReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" }).subscribe((resp) => {
      if (resp['data'] == null) {
        return;
      }
      this.reviewData = resp['data']['reviewtab_data'];
      this.reviewFlag = this.reviewData[this.reviewData.length - 1].review_flag;
      this.reviewCount = this.reviewData.length;
    });
  }

  // To check whether bid is under solution review or not
  getTechSolutionReview() {
    this._bidService.getTechSolutionReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        let data = resp['data']['reviewtab_data'];
        this.solutionReviewFlag = data[data.length - 1].techSolReview_flag;
      });
  }

  // To check whether bid is under proposal review or not
  getProposalReview() {
    this._bidService.getProposalReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.reviewData = resp['data']['reviewtab_data'];
        this.proposalReviewFlag = this.reviewData[this.reviewData.length - 1].ProposalReview_flag;
      });
  }
}