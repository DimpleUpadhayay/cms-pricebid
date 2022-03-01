import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-deal-summary',
  templateUrl: './deal-summary.component.html',
  styleUrls: ['./deal-summary.component.css']
})
export class DealSummaryComponent implements OnInit {
  bid_id;
  user;
  module;
  
  constructor(private _activeRoute: ActivatedRoute) {
    this.bid_id = _activeRoute.snapshot.parent.params['id']
    
    this.user = JSON.parse(localStorage.getItem('user'))['data']['user'];
    
    if (this.user & this.user.role_module_mapping && this.user.role_module_mapping.length) {
      this.module = this.user.role_module_mapping.find(a => a.module_name.toLowerCase() == 'bid_development');
    }
  }

  ngOnInit() {
  }

}
