import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { BusinessUnitService } from '../../../services/businessUnit.service';

@Component({
    selector: 'app-business-unit-view',
    templateUrl: './business-unit-view.component.html',
    styleUrls: ['./business-unit-view.component.css'],
    providers: [BusinessUnitService]
})
export class BusinessUnitViewComponent implements OnInit {
    public bu;
    formSubmitted: boolean = false;
    public user;
    public mainUnits = [];
    business_unit_id;
    parentT;

    constructor(public _businessUnitService: BusinessUnitService, public router: Router,
        public _route: ActivatedRoute) {
        this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
        this.getBu();
        this.business_unit_id = this._route.snapshot.params['id'];
        if (this.business_unit_id)
            this.getBuById();
    }

    ngOnInit() {
    }

    // get BU details by ID
    getBuById() {
        this._businessUnitService.getBusinessUnitById(this.business_unit_id).subscribe(data => {
            this.bu = data['data'];
        })
    }

    // get all BUs
    getBu() {
        this._businessUnitService.getBusinessUnits([]).subscribe(data => {
            if (data['data'] == null || data['data'] == 'null') {
                return;
            }
            if (data['code'] === 2000) {
                this.mainUnits = data['data'];
                this.mainUnits = [{ bu_id: 'ROOT', name: 'ROOT' }, ...this.mainUnits]
                setTimeout(() => {
                    this.getBUParentName();
                }, 100);
            }
        })
    }

    getParentUnits() {
        this._businessUnitService.getParentUnits().subscribe(data => {
            if (data['code'] === 2000) {
                if (data['data'] == 'null') {
                    return;
                }
                this.mainUnits = data['data'];
            }
        })
    }

    getBUParentName() {
        this.mainUnits.forEach(item => {
            if (item.bu_id == this.bu.parent_id) {
                this.parentT = item.name;
            }
        });
    }

}