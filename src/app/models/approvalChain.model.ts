export class approvalChain {
    name: string;
    approval_chain_id: string;
    user_id: string;
    company_id: string;
    territory_ids: any;
    bu_ids: any;
    users: any;
    desc: any;
    status: string;
    dealValue: {};
    user_role: string;

    constructor() {
        this.name = '';
        this.territory_ids = '';
        this.bu_ids = '';
        this.users = [];
        this.desc = '';
    }
}