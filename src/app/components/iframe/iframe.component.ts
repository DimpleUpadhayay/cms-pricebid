import { Component, OnInit, ViewChild } from '@angular/core';
import { BidService } from '../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../libraries/alert/alert.component';


@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.css'],
  providers: [BidService]
})
export class IframeComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  mainResponse;
  bid_id;
  url2 = "";
  loader = false;

  constructor(public _bidService: BidService, _activeRoute: ActivatedRoute) {
    this.bid_id = _activeRoute.snapshot.params['id'];
    this.getMainData()
  }

  ngOnInit() {
    this.loader = true;
  }

  getMainData() {
    this._bidService.getMainData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        this.mainResponse = resp['data']['maintab_data'];
        this.viewFile()
      }, error => {
      })
  }

  viewFile() {
    let url;
    /* if (this.rfiCategories.length != 0) {
      if (!this.rfiCategories[0].comment_add[this.rfiCategories[0].comment_add.length - 1].attachment_data[0]) {
        this.alert.sweetError("File not found");
        return;
      } else {
        url = this.rfiCategories[0].comment_add[this.rfiCategories[0].comment_add.length - 1].attachment_data[0].attachment_path;
      }

    } else { */
    if (!this.mainResponse[0].main_add[this.mainResponse[0].main_add.length - 1].attachment_data[0]) {
      this.loader = false;
      this.alert.sweetError("File not found");
      return;
    } else {
      url = this.mainResponse[0].main_add[this.mainResponse[0].main_add.length - 1].attachment_data[0].attachment_path;
    }
    //}
    this.url2 = "http://docs.google.com/gview?url=" + url + "&embedded=true";
    this.loader = false;

    // var win = window.open();
    // win.document.write('<iframe width="100%" height="610px" src="' + this.url2 + '" frameborder="0" allowfullscreen></iframe>')
  }

}
