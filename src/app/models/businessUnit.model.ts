export class BusinessUnit {
    bu_id: string;
    business_unit_number: string;
    parent_id: any;
    is_child: boolean;
    company_id: string;
    description: string
    created_by: string;
    status: string;
    name: string;

    constructor() {
        this.business_unit_number = '';
        this.parent_id = '';
        this.name = '';
        this.description = ''
    }
}