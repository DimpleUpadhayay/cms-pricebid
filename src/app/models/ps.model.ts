export class ProjectScope {
  executive_summary: object;
  scope_summary: object;
  timeline: object;
  criterion: object;
  financial: object;
  delivery: object;
  delivery_tc: object;
  support: object;
  docs: object;
  annexures: object;
  account: object;
  bid_id: string

  constructor() {

    this.criterion = {
      eligibility: [{
        name: '',
        read: false,
        attachment_data: [],
        icon: true,
        mandatory: true
      }],
      evaluation: [{
        name: '',
        read: false,
        attachment_data: [],
        icon: true,
        mandatory: true
      }]
    }

    this.financial = [{
      name: 'Payment Terms',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Earnest Money Deposit',
      read: true,
      value: '',
      type: 'multiInput',
      attachment_data: [],
      icon: false,
      mandatory: true
    },
    {
      name: 'Performance Bank Guarantee',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    },
    {
      name: 'Liquidated Damages',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Penalties',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Financial History, If any',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Contract Duration',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }, {
      name: 'Tender Fee',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }];

    this.delivery = [{
      name: 'Delivery',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Locations in Scope',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Current Delivery Model',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }];

    this.delivery_tc = [
      {
        name: '',
        read: false,
        type: 'textarea',
        attachment_data: [],
        icon: false,
        mandatory: true
      }/* , {
                name: '',
                read: false,
                type: 'textarea',
                attachment_data: [],
                icon: false,
                mandatory: true
            }, {
                name: '',
                read: false,
                type: 'textarea',
                attachment_data: [],
                icon: false,
                mandatory: true
            } */
    ]

    this.support = [{
      name: '',
      read: false,
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }/* , {
            name: '',
            read: false,
            type: 'input',
            attachment_data: [],
            icon: true,
            mandatory: true
        } */];


    this.docs = [{
      name: '',
      read: false,
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }];


    this.annexures = [{
      name: '',
      read: false,
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }];


    this.account = [{
      name: 'Brief Scope of Work',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Asset Summary',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }, {
      name: 'Current Delivery Model',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }, {
      name: 'No. of locations in Scope',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }];

    this.executive_summary = [{
      name: 'Existing Relationship',
      read: true,
      value: '',
      type: 'dropdown',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Bid Competitors',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Existing Partner',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Client-Objective-to-OutSource',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Key Drivers To Success',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'CMS IT Relationship',
      read: true,
      type: 'multiInput',
      value: { favour: '', against: '', neutral: '' },
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Key Decision Makers',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: false,
      mandatory: true
    }, {
      name: 'Applicable Domains',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }, {
      name: 'Customer Details',
      read: true,
      value: '',
      type: 'input',
      attachment_data: [],
      icon: true,
      mandatory: true
    }];

    this.scope_summary = [{
      name: '',
      read: false,
      type: 'textarea',
      attachment_data: [],
      icon: false,
      mandatory: true
    }]

    // Timeline
    this.timeline = [{ 
      name: '',
      read: false,
      value: '',
      type: 'datepicker',
      attachment_data: [],
      icon: false,
      mandatory: true
    }
    ]
  }
}
