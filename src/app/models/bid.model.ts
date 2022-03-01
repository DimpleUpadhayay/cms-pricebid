export class Bid {
  name: string;
  primary_name: string;
  primary_email: string
  primary_contact: string;
  secondary_name: string;
  secondary_eail: string
  secondary_contact: string;
  bid_number: string;
  bid_id: string;
  user_id: string;
  company_id: string;
  account_id: string;
  account_name: string;
  date_submission: string;
  date_closing: string;
  date_received: string;
  estimatedValue: string;
  comments: string;
  region: string;
  bu_ids: any;
  contributor: any;
  reviewer: any;
  coOwner : any;
  contributorTypes: any;;
  reviewerTypes: any;;
  coOwnerTypes: any;
  attachment_data: any;
  tag: string;
  category: string;
  status: string;
  user_role: string;
  currency: string;
  tags: string[];
  territory_ids: any;
  approval_chain: any;
  types: any;

  constructor() {
    this.tags = [];
    this.name = '';
    this.bid_number = '';
    this.account_name = '';
    this.date_submission = '';
    this.date_closing = '';
    this.date_received = '';
    this.estimatedValue = '';
    this.bu_ids = [];
    this.territory_ids = [];
    this.category = "";
    this.types = [];
    this.approval_chain = '';
    this.contributor = [];
    this.reviewer = [];
    this.coOwner = '';
    this.contributorTypes = [];
    this.reviewerTypes = [];
    this.coOwnerTypes = '';
    this.attachment_data = [];
  }
}
