export class poc {
    bid_id: string; 
    process: any;
    rfi: boolean;
    user_role: string;
    ac_comments:any;
    constructor() {
        this.process = [];
        this.user_role= 'CUSTOM';
        this.ac_comments = {}
    }
}