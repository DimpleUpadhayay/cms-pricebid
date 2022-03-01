import { OnInit, Component } from "@angular/core";
import { HttpService } from "../../../services/http.service";


@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css'],

})

export class analysisComponent implements OnInit {
  access;
  user;
  user_type = "";
  user_subtype = "";
  isViewer = false;
  role;

  constructor(private _httpService: HttpService) {
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    this._httpService.accessControl({
      "module": "dashboard",
      "user_id": this.user.user_id
    }).subscribe(response => {
      this.access = response['data'];
      this.user_type = this.access.userTypes[0].user_type;
      this.user_subtype = this.access.userTypes[0].user_subtype;
      this.isViewer = (this.access.userTypes.filter(a => a.user_type == 'VIEWER')).length > 0 ? true : false;
      // console.log(this.access);
      this.hideShowFunction();
    }, error => {
      console.log(error);
    });
  }

  ngOnInit(): void {


  }

  viewPBGReport = false;
  viewTenderFeeReport = false;
  viewSOFReport = false;
  hideShowFunction(){
    if(this.user_type == 'FINANCE_CONTROLLER' || this.user_type == 'BG_WRITER' ||  this.user_type == 'SOF_VIEWER' ||
    this.user_type == 'SOF_PRODUCT_VIEWER' || this.user_type == 'BG_WRITER' || this.user_type == 'ACCOUNTS_EXE_TREASURY' || this.user_type == 'EMD_PBG_VIEWER') {
      this.role = true
    }
    if(this.user_type == 'FINANCE_CONTROLLER'){
      this.viewPBGReport = true;
      this.viewTenderFeeReport = true;
    }
    if(this.user_type == 'BG_WRITER' || this.user_type == 'CFO' || this.user_type == 'EMD_PBG_VIEWER' ){
      this.viewPBGReport = true;
    }
    if(this.user_type == 'ACCOUNTS_EXE_TREASURY'){
      this.viewTenderFeeReport = true;
    }
    if(this.user_type == 'SOF_VIEWER' || this.user_type == 'SOF_PRODUCT_VIEWER' ){
      this.viewSOFReport = true;
    }

  }

}
