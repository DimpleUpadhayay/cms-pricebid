import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { AlertComponent } from '../../libraries/alert/alert.component';
import { PocDashboardService } from '../../services/poc.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
  providers: [BidService, PocDashboardService]
})

export class DownloadComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  attachments = [];
  user;
  submitted = false;
  bidData;
  poc;
  pocSubmited: boolean = false
  RFI = false;
  reviewData;
  reviewFlag = true;
  disableFlag = false;
  competitionFlag = false;
  rfiFlag = false;
  fileDeleted: any = false;
  path: any;
  module = "";

  constructor(public dialogRef: MatDialogRef<DownloadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _bidService: BidService,
    public dialog: MatDialog, private _pocService: PocDashboardService, private router: Router) {
    dialogRef.disableClose = true;
    this.path = this.router.url.split('/');
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.bidData = JSON.parse(localStorage.getItem('bidData'));
    this.submitted = this.data.action_taken;
    this.module = data.module;
    this.competitionFlag = data.submit_flag ? true : false;
    if (this.bidData) {
      this.getPoc();
      // this.getReview();
    }
    if (data.draft && data.draft.length > 0)
      this.disable(data);
    else if (this.path.includes("approvalDashboard")) {
      this.disableFlag = true;
    }
  }

  ngOnInit() {
    this.attachments = this.data['attachment_data'];
    console.log(this.attachments);
    this.attachments.forEach(element => {
      if (element.description == "") {
        element.description = 'N/A'
      }
    });
  }

  // restrict user to delete or revise
  disable(data) {
    if ((data.draft.length == 2 && !data.draft[1].flag) || (data.draft.length == 2 && data.contributor != this.user.user_id)) {
      this.disableFlag = true;
    } else if (data && data.draft.length == 1 && !data.draft[0].flag &&
      (this.path.includes("pricing-review") || this.path.includes("solution-review") ||
        this.path.includes("proposal-review") || this.path.includes("mains") || this.path.includes("risk-assessment")
        || this.path.includes("approvalrequired") || this.path.includes("approvalDashboard"))) {
      this.disableFlag = true;
    }/*  else if (!data.draft[0].flag) {
      this.disableFlag = true;
    } */
  }

  // download attachment
  onDownload(index) {
    /* let data = this.attachments[index];
    let url = data.filename;
    url = url.replace("/uploads", ":8080/api/uploads");
    window.open(url); */
    let attData = this.attachments[index];
    console.log(attData);
    this._bidService.downloadFile({ attachment_id: attData.attachment_id, responseType: 'blob' }).subscribe(data => {
      const blob = new Blob([data], { type: data.type }),
        url = window.URL.createObjectURL(blob);
      saveAs(url, attData.original_name ? attData.original_name : attData.attachment_n);
    });
  }

  // delete documents according to module name
  bidDocLength;
  onRemove(index) {
    let data = this.attachments[index];
    if (data.type == "BID_CREATION") {
      let obj = {
        "bid_id": this.bidData ? this.bidData.bid_id : "",
        "attachment_id": data.attachment_id,
        "children": data.children && data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteBidAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = this.attachments.length;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_MAIN") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteMainAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_SOLUTION") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteSolutionAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    }
    // Proposal TAB STARTS HERE COPY FROM sOLUTION
    else if (data.type == "BID_DEV_SOLUTION") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteProposalAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    }

    else if (data.type == "BID_DEV_REVIEW") {
      let obj = {
        "comment_id": this.data.comment_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteReviewAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
      // ProposalrEVIEW TAB  STARTS HERE COPY FROM Review
    } else if (data.type == "BID_DEV_REVIEW") {
      let obj = {
        "comment_id": this.data.comment_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteProposalReviewAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_APPROVAL") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteApprovalReqAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_RFI") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteRFIattachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_PROJECT_SCOPE") {
      /* if (this.data.participants && this.data.participants.length > 0) {
        return;
      } */
      var obj;
      switch (this.data.ps_type) {
        case 'scope_summary': {
          obj = {
            "scope_id": this.data.scope_id,
            "spattachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'timeline': {
          obj = {
            "scope_id": this.data.scope_id,
            "tm_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'eligibility': {
          obj = {
            "scope_id": this.data.scope_id,
            "eli_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'evaluation': {
          obj = {
            "scope_id": this.data.scope_id,
            "eva_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'delivery_tc': {
          obj = {
            "scope_id": this.data.scope_id,
            "dt_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'support': {
          obj = {
            "scope_id": this.data.scope_id,
            "spt_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'docs': {
          obj = {
            "scope_id": this.data.scope_id,
            "doc_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'account': {
          obj = {
            "scope_id": this.data.scope_id,
            "ac_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        case 'annexures': {
          obj = {
            "scope_id": this.data.scope_id,
            "ann_attachment_id": data.attachment_id,
            "children": data.children.length != 0 ? data.children : ""
          }
          break;
        }
        default: {
          break;
        }
      }
      this.alert.deleted("").then(success => {
        this._bidService.deletePSattachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_RISK") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteRiskAssessmentAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_TECHSOL") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteTechSolutionAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_TECHSOL_REVIEW") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteTechSolutionReviewAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_PROPOSAL") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteProposalAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_PROPOSAL_REVIEW") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteProposalReviewAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_LEGAL") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteLegalAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_LEGAL_REVIEW") {
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteLegalReviewAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    } else if (data.type == "BID_DEV_DOCREQ") { // pending
      let obj = {
        "item_id": this.data.item_id,
        "attachment_id": data.attachment_id,
        "children": data.children.length != 0 ? data.children : ""
      }
      this.alert.deleted("").then(success => {
        this._bidService.deleteDocsRequiredAttachment(obj).subscribe(response => {
          this.attachments.splice(index, 1);
          if (response['data'].updateparent.length != 0)
            this.attachments.push(response['data'].updateparent[0]);
          this.fileDeleted = true;
          this.alert.sweetSuccess("Attachment deleted successfully");
        }, error => {
          this.alert.sweetError("Failed to delete attachment");
        });
      }, error => {
        return;
      });
    }
  }

  onVersion(index) {
    this.dialogRef.close(this.attachments[index]);
  }

  // to check whether bid is under approval or not
  getPoc() {
    this._pocService.getPocDashboards({ bid_id: this.bidData.bid_id }).subscribe(data => {
      if (data['data'] == null) {
        return;
      }
      this.poc = data['data']['poc_list'][0];
      if (!this.poc) {
        return;
      }
      if (this.poc && this.poc['bid_id']) {
        if (this.poc.process.length > 0)
          this.rfiFlag = this.poc.process[this.poc.process.length - 1].action == "RFI" && !this.poc.process[this.poc.process.length - 1].status ? true : false;
        if (this.poc['process'] && this.poc['process'].findIndex(a => a.action == 'RFI' && a.status == true) >= 0) {
          this.pocSubmited = false;
          this.RFI = true;
          return
        }
        this.pocSubmited = true;
      }
    }, error => {
    })
  }

  // to check whether bid is under review or not
  /* getReview() {
    this._bidService.getReviewData({ "bid_id": this.bidData.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.reviewData = resp['data']['reviewtab_data'];
        this.reviewFlag = this.reviewData[this.reviewData.length - 1].review_flag;
        // this.reviewCount = this.reviewData.length;
      });
  } */

  // close popup
  onClose() {
    this.dialogRef.close(this.fileDeleted);
  }

}
