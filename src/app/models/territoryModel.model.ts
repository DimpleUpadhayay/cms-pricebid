export class TerritoryModel {
    territory_id: string;
    territory_number: string;
    company_id: string;
    parent_id: string;
    is_child: boolean;
    description: string;
    created_by: string;
    name: string;
    RegionID: string;

    constructor() {
        this.territory_number = '';
        this.parent_id = '';
        this.description = '';
        this.name = '';
        this.RegionID = '';
    }
}