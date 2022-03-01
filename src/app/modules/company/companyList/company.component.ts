import { Component, OnInit, ViewChild } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Company } from '../../../models/company.model';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css'],
  providers: [CompanyService]
})

export class companyComponent implements OnInit {
  @ViewChild(AlertComponent) alert: AlertComponent;
  p = 1; // set current page to 1
  public company;
  public user;
  filter;
  public companies = [];
  companyList: boolean = true;
  loader = false;

  constructor(public _companyService: CompanyService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.company = new Company();
    this.getCompanies();
  }

  ngOnInit() {
    this.loader = true;
  }

  getCompanies() {
    this.loader = true
    this._companyService.getCompanies({ status: 'ACTIVE' }).subscribe(data => {
      if (data['data'] == null || data['data'] == 'null') {
        this.loader = false;
        return;
      }
      this.companies = data['data']['company_list'];
      this.loader = false;
    },
      err => {
        this.loader = false;
      })
  }

  deactivate(id) {
    this.alert.deleted('').then(() => {
      this.loader = true
      let item = { status: "INACTIVE", company_id: id }
      this._companyService.updateCompany(item).subscribe(data => {
        this.loader = false
        this.getCompanies();
      }, error => {
        this.loader = false
      })
    }).catch(e => {

    })
  }
}
