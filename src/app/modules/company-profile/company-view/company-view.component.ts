import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { AlertComponent } from '../../../libraries/alert/alert.component';
import { Company } from '../../../models/company.model';

@Component({
  selector: 'app-company-view',
  templateUrl: './company-view.component.html',
  styleUrls: ['./company-view.component.css'],
  providers: [CompanyService]
})

export class CompanyViewComponent {
  @ViewChild(AlertComponent) _alert: AlertComponent;
  public companyForm: any;
  public company;
  public user;
  formSubmitted: boolean = false;
  public companies = [];
  company_id;
  loader = false;

  constructor(public _addCompanyService: CompanyService,
     public _formBuilder: FormBuilder, public _route: ActivatedRoute) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this.company = new Company();
    this.company_id = this._route.snapshot.params['id'];
    /* if (this.company_id)
      this.getCompanyById();
    else if (this.user.company_id) {
      this.getCompanyById();
    } */
    this.getCompanyById(this.company_id ? this.company_id : this.user.company_id);

    this.companyForm = _formBuilder.group({
      company_name: ["", Validators.compose([Validators.required])],
      company_address: ["", Validators.compose([Validators.required])],
      company_phone: ["", Validators.compose([Validators.required])],
      company_website: ["", Validators.compose([Validators.required])],
      contact_name_primary: ["", Validators.compose([Validators.required])],
      contact_email_primary: ["", Validators.compose([Validators.required])],
      contact_phone_primary: ["", Validators.compose([Validators.required])],
      contact_phone_secondary: [""],
      contact_name_secondary: [""],
      contact_email_secondary: [""],
      status: "ACTIVE",
    });
  }

  ngOnInit() {
    this.loader = true;
  }

  // get company data
  getCompanyById(id) {
    this._addCompanyService.getCompanyById(id).subscribe(data => {
      this.loader = false;
      this.company = data['data']['company'];
    }, error => {
      this.loader = false;
    })
  }

}
