import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';
declare var $: any;
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-bid-documents',
  templateUrl: './bid-documents.component.html',
  styleUrls: ['./bid-documents.component.css'],
  providers: [BidService]
})
export class BidDocumentsComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  fileArray: any = [];
  attachments = [];
  flag = false;
  level;

  imageUrl = {
    "excel": "assets/images/excelicon.png",
    "ppt": "assets/images/ppt.png",
    "word": "assets/images/Microsoft_Word_2013_logo.svg.png",
    "pdf": "assets/images/pdficon.png",
    "img": "assets/images/image-icon.png"
  }
  bid_id;
  user
  module;
  request;
  bidData;
  participants;
  pdfFileArray = [];
  excelFileArray = [];
  pptFileArray = [];
  wordFileArray = [];
  bidRevisions = [];
  userType;
  loader = false;

  constructor(private _activeRoute: ActivatedRoute,
    private _sharedService: SharedService,
    private _bidService: BidService) {
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.userType = this.user.userTypes[0].user_type;
    _bidService.getBidById(this.bid_id).subscribe(resp => {
      this.bidData = resp['data']['bid'];
      this.getRevisedBids(this.bidData);
      if (this.bidData.participants) {
        this.participants = this.bidData.participants.filter(a => {
          return a.user_type;
        });
      }
    }, error => {
    });

    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.toLowerCase() == 'bid_development');
    }
    this.request = {
      "bid_id": this.bid_id,
      "date_created": -1,
      "description": "",
      "type": "",
      "userID": "",
      "dateTimeRange": ""
    }
  }

  ngOnInit() {
    this.loader = true;
    this._sharedService.reviewType.emit({ type: 'other' });
    this.readData();
  }

  ngOnDestroy() {
    $(".modal").modal('hide');
  }

  // fetch all documents created in particular bid
  readData() {
    switch (this.userType) {
      case "APPROVER": this.level = 1; break;
      case "REVIEWER": this.level = 2; break;
      case "BID_OWNER": this.level = 3; break;
      case "CONTRIBUTOR": this.level = 4; break;
    }
    this._bidService.getBidDocumentData({ "bid_id": this.bid_id, "status": "ACTIVE", "user_type": this.userType, "level": this.level })
      .subscribe((attach: any) => {
        this.attachments = attach.data.attachment_data;
        this.attachments = this.attachments.reverse();
        this.loader = false;
      },
        error => {
          this.loader = false;
        });
  }

  // display file icon according to file type
  filePath(filename) {
    let checkExtension = filename.split(".");
    if (checkExtension[checkExtension.length - 1] == "pdf") {
      return this.imageUrl.pdf;
    } else if (checkExtension[checkExtension.length - 1] == "xlsx" || checkExtension[checkExtension.length - 1] == "ods" || checkExtension[checkExtension.length - 1] == "csv" || checkExtension[checkExtension.length - 1] == "xls") {
      return this.imageUrl.excel;
    } else if (checkExtension[checkExtension.length - 1] == "pptx") {
      return this.imageUrl.ppt;
    } else if (checkExtension[checkExtension.length - 1] == "docx" || checkExtension[checkExtension.length - 1] == "doc") {
      return this.imageUrl.word;
    } else if (checkExtension[checkExtension.length - 1] == "jpg" || checkExtension[checkExtension.length - 1] == "jpeg" || checkExtension[checkExtension.length - 1] == "png") {
      return this.imageUrl.img;
    }
  }

  // display heading color according to file type
  headingColor(filename) {
    let checkExtension = filename.split(".");
    if (checkExtension[checkExtension.length - 1] == "pdf") {
      return "panelHeading3";
    } else if (checkExtension[checkExtension.length - 1] == "xlsx" || checkExtension[checkExtension.length - 1] == "ods" || checkExtension[checkExtension.length - 1] == "csv" || checkExtension[checkExtension.length - 1] == "xls") {
      return "panelHeading1";
    } else if (checkExtension[checkExtension.length - 1] == "pptx") {
      return "panelHeading4";
    } else if (checkExtension[checkExtension.length - 1] == "docx" || checkExtension[checkExtension.length - 1] == "doc") {
      return "panelHeading2";
    } else if (checkExtension[checkExtension.length - 1] == "jpg" || checkExtension[checkExtension.length - 1] == "jpeg" || checkExtension[checkExtension.length - 1] == "png")
      return "panelHeading5";
  }

  // display heading color of revised versions according to file type
  versionColor(filename) {
    let checkExtension = filename.split(".");
    if (checkExtension[checkExtension.length - 1] == "pdf") {
      return "versionHeading3";
    } else if (checkExtension[checkExtension.length - 1] == "xlsx" || checkExtension[checkExtension.length - 1] == "ods" || checkExtension[checkExtension.length - 1] == "csv" || checkExtension[checkExtension.length - 1] == "xls") {
      return "versionHeading1";
    } else if (checkExtension[checkExtension.length - 1] == "pptx") {
      return "versionHeading4";
    } else if (checkExtension[checkExtension.length - 1] == "docx" || checkExtension[checkExtension.length - 1] == "doc") {
      return "versionHeading2";
    } else if (checkExtension[checkExtension.length - 1] == "jpg" || checkExtension[checkExtension.length - 1] == "jpeg" || checkExtension[checkExtension.length - 1] == "png")
      return "versionHeading5";
  }

  // changeState() {
  //   this.header.changeStatus();
  // }

  // download file
  onDownload(index) {
    // let data = this.attachments[index];
    // let url = data.filename;
    // url = url.replace("/uploads", ":8080/api/uploads");
    // window.open(url);
    let attData = this.attachments[index];
    this._bidService.downloadFile({ attachment_id: attData.attachment_id, responseType: 'blob' }).subscribe(data => {
      const blob = new Blob([data], { type: data.type }),
        url = window.URL.createObjectURL(blob);
      saveAs(url, attData.original_name ? attData.original_name : attData.attachment_n);
    });
  }

  // download revised file
  onRevisedDownload(index, subIndex) {
    // let data = this.attachments[index].data[subIndex];
    // let url = data.filename;
    // url = url.replace("/uploads", ":8080/api/uploads");
    // window.open(url);

    // let attData =
    let attData = this.attachments[index].data[subIndex];
    this._bidService.downloadFile({ attachment_id: attData.attachment_id, responseType: 'blob' }).subscribe(data => {
      const blob = new Blob([data], { type: data.type }),
        url = window.URL.createObjectURL(blob);
      saveAs(url, attData.original_name ? attData.original_name : attData.attachment_n);
    });
  }

  // display initials of person who uploaded that file
  uploadedBy(fullname) {
    if (fullname) {
      // let fname = fullname.split(" ");
      // return fname[0][0] + fname[1][0];
      return fullname.split(' ')[0][0].toUpperCase() + (fullname.split(' ')[1] ? fullname.split(' ')[1][0].toUpperCase() : '')
    } else {
      return
    }
    // return fname[0][0] + fname[1][0];
  }

  // search filter
  onSearch() {
    this.loader = true;
    let data = this.request;
    if (data.description != undefined && data.description != null && data.description != "") {
      data.name = data.description;
    }
    this._bidService.postBidDocumentData(data)
      .subscribe((response) => {
        this.attachments = [];
        if (response['data'].attachments_list == null || response['data'].attachments_list == undefined || response['data'].attachments_list.length == 0) {
          this.loader = false;
          this.alert.sweetError("No record found");
        } else {
          this.attachments = response['data'].attachments_list;
          this.loader = false;
        }
      },
        error => {
          this.attachments = [];
          this.loader = false;
          this.alert.sweetError("No record found");
        });
  }

  // reset filters
  onClear() {
    this.loader = true;
    this.request = {
      "bid_id": this.bid_id,
      "date_created": -1,
      "description": "",
      "type": "",
      "userID": "",
      "dateTimeRange": ""
    }
    this.readData();
  }

  onDate() {
    let data = this.request.date_created;
    this._bidService.postBidDocumentData({ date_created: -1 })
      .subscribe((dataResponse) => {
      }, error => {
      })
  }

  getRevisedBids(value) {
    this._bidService.getBidRevisionVersions({
      bid_id: value.bid_id,
      bid_revision_id: value.bid_revision_id
    }).subscribe((response) => {
      if (response['data'] == null || response['data'] == undefined || response['data'].length == 0) {
      } else {
        this.bidRevisions = response['data'];
      }
    },
      error => {
        this.bidRevisions = [];
      });
  }

  // to get participants as per the bid version
  onVersionNameChange(event){
    this._bidService.getBidById(event).subscribe(resp => {
      let bidData = resp['data']['bid'];
      if (bidData.participants.length != 0) {
        this.participants = [];
        this.participants = bidData.participants.filter(a => {
          return a.user_type;
        });
      }
    }, error => {
    });
  }
  
}
