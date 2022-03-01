export class UsersModel {
    firstName: string;
    lastName: string;
    username: string;
    title: string;
    email: string;
    phone: string;
    role_type: string;
    role_id: any; // when user_role is custom then role_id required
    bu_ids: any; //null: all business units
    territory_ids: any; //null: all territory
    manager_name: string;
    manager_email: string;
    password: any;
    confirm_password: any;
    manager_phone: string;
    emp_id: string;
    manager_emp_id: string;
    product_type: string;
    isManager: boolean;
    isBuHead: boolean;
    buHeadArray: any;
    isTerritoryHead: boolean;
    territoryHeadArray: any;
    userTypes: { user_type: string, user_subtype: string }[];
    userID:any;

    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.username = '';
        //this.title = '';
        this.email = ''
        this.phone = '';
        this.role_id = [];
        this.territory_ids = [];
        this.password = '';
        this.confirm_password = ''
        this.bu_ids = [];
        this.manager_name = '';
        this.manager_email = '';
        this.isManager = false;
        this.isBuHead = false;
        this.buHeadArray = [];
        this.isTerritoryHead = false;
        this.territoryHeadArray = [];
        this.userTypes = [];
        this.userID = '';
         /*this.manager_phone = '';
        this.manager_emp_id = '';
        this.emp_id = ''; */
    }
}