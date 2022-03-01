import { Component, OnInit, ViewChild } from '@angular/core';
import { ProjectScopeService } from '../../../services/ps.service';
import { UploadfileComponent } from '../../upload-file/upload-file.component';
import { BidService } from '../../../services/bid.service';
import { ActivatedRoute } from '@angular/router';
import { AlertComponent } from '../../../libraries/alert/alert.component';

declare var vis: any;

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  providers: [ProjectScopeService, UploadfileComponent, BidService]
})

export class TimeLine implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  items: any;
  container;
  timeline;
  legend;
  bid_id;
  response;
  loader = false;

  constructor(private _bidService: BidService, private _activeRoute: ActivatedRoute) {
    this.bid_id = _activeRoute.snapshot.params['id']
    _bidService.gettimeline({ "bid_id": this.bid_id }).subscribe(success => {
      // console.log(this.bid_id);
      // console.log(success);
      this.loader = false;
      this.response = success['data']['timeline_data'];
      this.legend = this.response['Legend'];
      this.response['option_object'].order = this.customOrder;
      // console.log(this.response['option_object'], "check")
      this.items = new vis.DataSet(
        this.response['Timeline_array']
      );
      this.container = document.getElementById('visualization');

      // attach events to the navigation buttons
      // document.getElementById('zoomIn').onclick    = function () { timeline.zoomIn( 0.2); };
      // document.getElementById('zoomOut').onclick   = function () { timeline.zoomOut( 0.2); };
      // document.getElementById('moveLeft').onclick  = function () { move( 0.2); };
      // document.getElementById('moveRight').onclick = function () { move(-0.2); };
      // document.getElementById('toggleRollingMode').onclick = function () { timeline.toggleRollingMode() };
      this.timeline = new vis.Timeline(this.container, this.items, this.response['option_object']);
    }, error => {
      this.loader = false;
      this.alert.sweetError(error.error.msg);
    });
  }

  ngOnInit() {
    this.loader = true;
  }

  changeView(type) {
    switch (type) {
      case 'zoomIn':
        this.timeline.zoomIn(0.2)
        break;
      case 'zoomOut':
        this.timeline.zoomOut(0.2)
        break;
      case 'moveLeft':
        this.move(0.2)
        break
      case 'moveRight':
        this.move(-0.2)
        break
    }
  }
  move(percentage) {
    var range = this.timeline.getWindow();
    var interval = range.end - range.start;

    this.timeline.setWindow({
      start: range.start.valueOf() - interval * percentage,
      end: range.end.valueOf() - interval * percentage
    });
  }

  customOrder(a, b) {
    return a.start - b.start;
  }

}
