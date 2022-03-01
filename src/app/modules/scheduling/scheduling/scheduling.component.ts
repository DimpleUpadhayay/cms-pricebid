import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SchedulingService } from '../../../services/scheduling.service';
import { UsersService } from '../../../services/users.service';
import { BidService } from '../../../services/bid.service';
import { PocDashboardService } from '../../../services/poc.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-Scheduling',
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.css'],
  providers: [SchedulingService, UsersService, BidService, PocDashboardService]

})
export class SchedulingComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;

  public Scheduling;
  public submitted: any = '';
  public user;
  scheduler_id;
  bid;
  dt = new Date();
  minDate = new Date(this.dt.getFullYear(), this.dt.getMonth(), this.dt.getDate());
  milestones: any;
  bid_id;
  public users = [];
  obj = {};
  submitFlag;
  poc;
  pocSubmited: boolean = false
  RFI = false;
  reviewData;
  reviewFlag = true;
  reviewCount = 0;
  submission_date;
  refreshObj;
  loader = false;

  constructor(private _SchedulingService: SchedulingService, public router: Router,
    private _activeRoute: ActivatedRoute,
    public _bidService: BidService,
    public _userService: UsersService,
    public _pocService: PocDashboardService, public _sharedService: SharedService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.bid_id = this._activeRoute.snapshot.params['id'];

    this.refreshObj = {
      company_id: this.user.company_id,
      bid_id: this.bid_id,
      module: "SCHEDULING",
      sub_module: "",
    };
    // refresh call
    this._sharedService.newData.subscribe(a => {
      if (a.data == 'scheduling' && this.user.user_type != "BID_OWNER") {
        this.getScheduling();
      }
    });
    this.milestones = [{
      name: '',
      startDate: '',
      endDate: '',
      contributor: '',
      read: false,
      icon: true,
      task: []
    }];

    this.getBid();
    this.getScheduling();
    this.getPoc();
    this.getReview();
    this.obj = {
      bid_id: this.bid_id,
      user_id: this.user.user_id,
      company_id: this.user.company_id,
      status: 'ACTIVE'
    }
  }

  ngOnInit(): void {
    this.loader = true;
  }

  getBid() {
    this._bidService.getBidById(this.bid_id).subscribe(data => {
      this.bid = data['data']['bid'];
      this.submission_date = new Date(this.bid.date_submission);
      this.users = this.bid['participants'].filter(a => {
        return a.user_type === "CONTRIBUTOR" || a.user_type === "BID_OWNER";
      });
    });
  }

  // get scheduling data
  getScheduling() {
    // console.log(this.bid_id, "schedule")
    this._SchedulingService.getSchedulingById(this.bid_id).subscribe(Scheduling => {
      if (Scheduling['data'] == null) {
        this.loader = false;
        return;
      }
      if (Scheduling['code'] === 2000) {
        // console.log(Scheduling['data'], "schedule");
        this.milestones = Scheduling['data']['scheduler_data'][0]['milestones'];
        // console.log(this.milestones);
        this.submitFlag = Scheduling['data']['scheduler_data'][0].submit_flag;
        this.loader = false;
        this.scheduler_id = Scheduling['data']['scheduler_data'][0].scheduler_id;
        if (Scheduling['data']['scheduler_data'][0].participants.indexOf(this.user.user_id) >= 0) {
          this.submitted = true;
        }
      } else if (Scheduling['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (Scheduling['code'] === 401) {
        //this.users = [];
      } else if (Scheduling['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (Scheduling['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
    }, err => {
      this.loader = false;
    }
    );
  }

  // to check whether bid is under approval or not
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

  // to check whether bid is under review or not
  getReview() {
    this._bidService.getReviewData({ "bid_id": this.bid_id, "status": "ACTIVE" })
      .subscribe((resp) => {
        if (resp['data'] == null) {
          return;
        }
        this.reviewData = resp['data']['reviewtab_data'];
        this.reviewFlag = this.reviewData[this.reviewData.length - 1].review_flag;
        this.reviewCount = this.reviewData.length;
      });
  }

  addMilestone() {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent) {
      return;
    }
    this.milestones.push({
      name: '',
      contributor: '',
      startDate: '',
      endDate: '',
      allIcon: true,
      task: []
    })
  }


  deleteMilestone(i) {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent) {
      return;
    }
    this.milestones.splice(i, 1);
  }

  addTask(i) {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent) {
      return;
    }
    this.milestones[i].task.push({
      name: '',
      contributor: '',
      startDate: '',
      endDate: '',
      subTask: [],
      allIcon: true
    })
  }

  deleteTask(item, j) {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent) {
      return;
    }
    item.task.splice(j, 1)
  }


  addSubTask(i, j) {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent) {
      return;
    }
    this.milestones[i].task[j].subTask.push({
      name: '',
      contributor: '',
      startDate: '',
      endDate: '',
      allIcon: true
    })
  }

  deleteSubTask(item, k) {
    if (this.pocSubmited || !this.reviewFlag || this.bid.parent) {
      return;
    }
    item.subTask.splice(k, 1);
  }

  validate() {
    let validate = true;
    // Validate milestones
    this.milestones.forEach(element => {
      if (typeof element === 'object') {
        for (var key in element) {
          if (typeof element[key] === 'string' && !element[key]) {
            validate = false;
          }
        }
      }
    });

    // Validate tasks
    this.milestones.forEach(element => {
      if (element.task && element.task.length) {
        element.task.forEach(item => {
          if (typeof item === 'object') {
            for (var key in item) {
              if (typeof item[key] === 'string' && !item[key]) {
                validate = false;
              }
            }
          }
        });
      }
    });

    // // validate sub task
    this.milestones.forEach(element => {
      if (element.task && element.task.length) {
        element.task.forEach(subItem => {
          if (typeof subItem === 'object' && subItem.subTask && subItem.subTask.length) {
            subItem.subTask.forEach(sub_item => {
              if (typeof sub_item === 'object') {
                for (var key in sub_item) {
                  if (typeof sub_item[key] === 'string' && !sub_item[key]) {
                    validate = false;
                  }
                }
              }
            });
          }
        });
      }
    });

    return validate;
  }

  reset() {
    this.milestones = [{
      name: '',
      startDate: '',
      endDate: '',
      contributor: '',
      read: false,
      icon: true,
      task: []
    }];
  }

  submit(value) {
    this.obj['bid_id'] = this.bid_id;
    this.obj['company_id'] = this.user.company_id;
    if (value) {
      this.scheduler_id ? this.update(value) : this.create(value)
      return
    }
    if (!this.validate()) {
      this.alert.sweetError("Please fill empty fields");
      return
    }
    this.alert.added('').then(() => {
      this.obj['submitted'] = true;
      this.obj['participants'] = [this.user.user_id];
      this.scheduler_id ? this.update('') : this.create('');
    }, error => {
      return;
    })
  }

  // create scheduling
  create(value) {
    this.obj['milestones'] = this.milestones;
    this.obj['submit_flag'] = value ? false : true;;
    this._SchedulingService.createScheduling(this.obj).subscribe(data => {
      value ? this.alert.sweetSuccess("Data saved as draft") : this.alert.sweetSuccess("Data saved successfully");
      if (!value) {
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }
      this.getScheduling();
    }, error => {
      this.alert.sweetError(error.error.msg)
    })
  }

  // update scheduling
  update(value) {
    this.obj['milestones'] = this.milestones;
    this.obj['scheduler_id'] = this.scheduler_id;
    this.obj['submit_flag'] = value ? false : true;;
    this._SchedulingService.updateScheduling(this.obj).subscribe(data => {
      value ? this.alert.sweetSuccess("Data saved as draft") : this.alert.sweetSuccess("Data saved successfully");
      if (!value) {
        this._bidService.refreshContent(this.refreshObj).subscribe(resp => {
        }, cancel => {
        });
      }
      this.getScheduling();
    }, error => {
      this.alert.sweetError(error.error.msg)
    })
  }

  changeState() {
    if (this.user.user_role && this.user.user_role == 'CUSTOM') {
      this.router.navigateByUrl('/dashboard');
    }
  }

}
