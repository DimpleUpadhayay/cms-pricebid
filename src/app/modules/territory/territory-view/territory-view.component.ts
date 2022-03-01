import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { TerritoryService } from '../../../services/territories.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';

@Component({
  selector: 'app-territory-view',
  templateUrl: './territory-view.component.html',
  styleUrls: ['./territory-view.component.css'],
  providers: [TerritoryService]
})

export class TerritoryViewComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  public territoryForm: any;
  public territory;
  public user;
  public mainTerritories;
  territory_id;
  formSubmitted: boolean = false;
  parentTers;
  loader = false;

  constructor(public _territoryService: TerritoryService, public router: Router,
    public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.territory_id = this._route.snapshot.params['id'];
    if (this.territory_id)
      this.getTerritoryById();
    this.getTerritory()
  }

  ngOnInit() {
  }

  // get list of territories
  getTerritory() {
    this.loader = true
    this._territoryService.getTerritories({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == 'null') {
        this.loader = false
        return;
      }
      if (data['code'] == '2000') {
        this.mainTerritories = data['data'];
        this.mainTerritories = [{ territory_id: 'ROOT', name: 'ROOT' }, ...this.mainTerritories]
        // setTimeout(() => {
        this.mainTerritories.forEach(item => {
          if (item.territory_id == this.territory.parent_id) {
            this.parentTers = item.name
          }
        });
        this.loader = false;
        // }, 100);
      }
    })
  }

  // get details of particular territory to view
  getTerritoryById() {
    this.loader = true
    this._territoryService.getTerritoryById(this.territory_id).subscribe(data => {
      this.territory = data['data'];
      this.loader = false;
    }, error => {
      this.loader = false;
    })
  }

}
