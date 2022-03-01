export class Roles {
    company_id: string;
    role_type_id: string;
    name: string;//should be in capital without space
    //display_name: string;
    status: string;
    module_list: any[];
    sub_type: String;

    constructor() {
        this.role_type_id = '';
        this.name = '';
        this.sub_type = '';
        //this.display_name = '';

        this.module_list = [
            //     {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'BID_CREATION',
            //     write: false,
            //     read: true,
            //     flag: false
            // }, {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'BID_DEVELOPMENT',
            //     write: false,
            //     read: true
            //     , flag: false
            // }, {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'BID_REVIEWER',
            //     read: true,
            //     write: false,
            //     flag: false
            // }, {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'BID_DOCUMENTS',
            //     read: true,
            //     write: false,
            //     flag: false
            // }, {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'COMMUNICATION',
            //     read: true,
            //     write: false,
            //     flag: false
            // }, {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'BID_APPROVAL',
            //     read: true,
            //     write: false,
            //     flag: false
            // }, {
            //     company_id: '0',
            //     role_id: 'bid_owner',
            //     module_name: 'BID_ANALYSIS',
            //     read: true,
            //     write: false,
            //     flag: false
            // }
        ];
    }
}