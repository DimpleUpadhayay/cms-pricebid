import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TerritoryService } from '../../../services/territories.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-territory',
  templateUrl: './territory.component.html',
  styleUrls: ['./territory.component.css'],
  providers: [TerritoryService]
})

export class territoryComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  p = 1; // set current page to 1
  filter;
  public territory;
  public user;
  public mainTerritories;
  // Boolean 
  loader = false;
  // Array
  public territoryData = [];

  constructor(private _territoryService: TerritoryService, public router: Router) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.getTerritories();
  }

  ngOnInit(): void {
    this.loader = true;
  }

  // get list of territories
  getTerritories() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(territories => {
      if (territories['data'] == null || territories['data'] == 'null') {
        this.loader = false;
        return;
      }
      if (territories['code'] === 2000) {
        this.territoryData = territories['data'];
        this.loader = false;
      } else if (territories['code'] === 3005) {
        //this.errorMsg = "Ohh! It seems you are not connected with us yet";
      } else if (territories['code'] === 401) {
        //this.users = [];
      } else if (territories['code'] === 3012) {
        //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
      } else if (territories['code'] === 3006) {
        //this.errorMsg = "Ohh! Invalid User.";
      }
    }, error => {
      this.loader = false;
    });
  }

  // delete territories
  deleteTerritory(id) {
    this.alert.deleted('').then(() => {
      this.loader = true
      let obj = {
        'user_id': this.user.user_id,
        status: 'INACTIVE',
        territory_id: id,
        user_role: this.user.user_role
      }
      this._territoryService.updateTerritory(obj).subscribe((data: any) => {
        if (data.code === 2000) {
          this.loader = false
          this.getTerritories();
        } else if (data.code === 3005) {
          //this.errorMsg = "Ohh! It seems you are not connected with us yet";
        } else if (data.code === 401) {
          //this.users = [];
        } else if (data.code === 3012) {
          //this.errorMsg = "Your Email is Not Verified , kindly verify your email";
        } else if (data.code === 3006) {
          //this.errorMsg = "Ohh! Invalid User.";
        }
        setTimeout(() => {
          //this.errorMsg = "";
          this.loader = false
        }, 500);
      }, error => {
        this.loader = false
        this.alert.sweetError(error.error.msg)
      })
    }).catch(e => {

    })
  }

  changeDate(date) {
    return new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear();
  }

  getName(id) {
    if (!id || id == 'ROOT') {
      return 'ROOT';
    }
    if (!this.territoryData || this.territoryData.length == 0) {
      return 'ROOT';
    }
    if (this.territoryData.find(a => a['parent_id'] == id)) {
      return this.territoryData.find(a => a['territory_id'] == id).name;
    }
    return 'ROOT';
  }

}
