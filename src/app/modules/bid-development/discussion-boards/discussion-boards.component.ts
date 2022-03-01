import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { BidService } from '../../../services/bid.service';

declare var Jquery: JQueryStatic;
@Component({
  selector: 'app-discussion-boards',
  templateUrl: './discussion-boards.component.html',
  styleUrls: ['./discussion-boards.component.css'],
  providers: [ChatService]
})
export class DiscussionBoardsComponent implements OnInit, OnDestroy {
  bid_id;
  user;
  bidData;
  module;
  response;
  searchKey;
  comment;
  startdate; enddate; dateTimeRange = [null, null];
  alwaysShowCalendars: boolean;
  search = false;
  viewParticipants = false;
  filter = false;
  messageArray: Array<{ "commentBy": String, "data_created": Number, "tag": String, "commentTo": String, "comment": String }> = [];

  constructor(private _activeRoute: ActivatedRoute, private _chatService: ChatService,
    private _bidService: BidService
  ) {
    this.alwaysShowCalendars = true;
    this.bid_id = _activeRoute.snapshot.params['id']
    this.bidData = JSON.parse(localStorage.getItem("bidData"));
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.toLowerCase() == 'bid_development');
    }
    _chatService.join({ "user": this.user.fullname, "bid_id": this.bid_id });

    _chatService.newUserJoined().subscribe(data => {
      this.messageArray.push(data);
    }, error => {
    });
    _chatService.userLeft().subscribe(data => {
      this.messageArray.push(data);
    }, error => {
    });
    _chatService.newMessageReceived().subscribe(data => {
      this.messageArray.push(data);
      this.response.comments.push(data);
      $('.bellRing').addClass('panel-mini blink');
    }, error => {
    });
    this.readDiscussion();
  }

  ngOnInit() {
    this.bidData = JSON.parse(localStorage.getItem("bidData"));
    //$('.panel-body').addClass('mini');
    //$(this).parent().parent().removeClass('normal').addClass('mini');
    $('.panel.panel-chat > .panel-body').animate({ height: "0" }, 0);
    $('.input_msg_write').animate({ height: "0" }, 0);
    this.response = {
      bid_id: this._activeRoute.snapshot.params['id'],
      type: "Group",
      status: "ACTIVE",
      comments: []
    }
  }

  minimize(event) {
    if ($(event.target).parent().parent().hasClass('normal')) {
      $(event.target).parent().parent().removeClass('normal').addClass('mini');
      $('.panel.panel-chat > .panel-body').animate({ height: "0" }, 500);
      $('.input_msg_write').animate({ height: "0" }, 500);
      this.search = false;
      this.viewParticipants = false;
      this.filter = false;
      /* setTimeout(function () {
        $('.panel.panel-chat > .panel-body').hide();
        $('.input_msg_write').hide();
      }, 500); */
    }
    else {
      $(event.target).parent().parent().removeClass('mini').addClass('normal');
      $('.panel.panel-chat > .panel-body').animate({ height: "253px" }, 500).show();
      $('.input_msg_write').animate({ height: "50px", width: "300px" }, 500).show();
      $('.bellRing').removeClass('panel-mini blink');
    }
    $('.mesgs').bind("DOMSubtreeModified", function () {
      if ($(event.target).parent().parent().hasClass('mini')) {
        // console.log(">>>>>close chat")
        $('.bellRing').addClass('panel-mini blink');
      }
      else if ($(event.target).parent().parent().hasClass('normal')) {
        // console.log(">>>>>open Chat")
        $('.bellRing').removeClass('panel-mini blink');
      }
    });
  }

  onSearch() {
    this.search = !this.search;
    this.filter = false;
    this.viewParticipants = false;
  }

  onFilter() {
    this.filter = !this.filter;
    this.search = false;
    this.viewParticipants = false;
  }

  onViewParticipants() {
    this.viewParticipants = !this.viewParticipants;
    this.filter = false;
    this.search = false;
  }

  onResetSearch() {
    this.searchKey = '';
    this.dateTimeRange = [null, null];
  }
  onResetDate() {
    this.searchKey = '';
    this.dateTimeRange = [null, null];
  }

  onDateChange() {
    this.startdate = this.dateTimeRange[0];
    this.enddate = this.dateTimeRange[1];
  }

  readDiscussion() {
    this._bidService.readDiscussionBoard({ "bid_id": this.bid_id }).subscribe(success => {
      if (success['data'] == null) {
        return;
      }
      this.response = success['data']['comments'][0];
    }, error => {
    });
  }

  onSend() {
    if (!this.comment) {
      var e = jQuery.Event("keydown", { keyCode: 8 });
      $("#comment").trigger(e);
      return;
    }
    this.response.date_created ? this.update() : this.create();
  }

  create() {
    if (!this.comment) {
      return;
    }
    this._chatService.sendMessage({ bid_id: this.bid_id, commentBy: this.user.fullname, data_created: new Date().getTime(), tag: "", commentTo: "", comment: this.comment });
    let obj = {
      bid_id: this.bid_id,
      type: "Group",
      status: "ACTIVE",
      comments: [
        { bid_id: this.bid_id, commentBy: this.user.fullname, data_created: new Date().getTime(), tag: "", commentTo: "", comment: this.comment }
      ]
    };
    this._bidService.createDiscussionBoard(obj).subscribe(suceess => {
      this.readDiscussion();
    }), error => {
    };
    this.comment = '';
  }

  update() {
    if (!this.comment) {
      return;
    }
    this._chatService.sendMessage({ bid_id: this.bid_id, commentBy: this.user.fullname, data_created: new Date().getTime(), tag: "", commentTo: "", comment: this.comment });
    let obj = {
      bid_id: this.bid_id,
      type: "Group",
      status: "ACTIVE",
      comments: [
        { bid_id: this.bid_id, commentBy: this.user.fullname, data_created: new Date().getTime(), tag: "", commentTo: "", comment: this.comment }
      ]
    };
    this._bidService.updateDiscussionBoard(obj).subscribe(suceess => {
      this.comment = '';
      var e = jQuery.Event("keydown", { keyCode: 8 });
      $("#comment").trigger(e);
    }, error => {
    });
  }

  getSignatures(username) {
    if (username) {
      return username.split(' ')[0][0].toUpperCase() + (username.split(' ')[1] ? username.split(' ')[1][0].toUpperCase() : '')
    }
    return
  }

  ngOnDestroy() {
    this._chatService.leave({ "user": this.user.fullname, "bid_id": this.bid_id });
  }

}
