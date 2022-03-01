export class ac_comments {
    com_cat:string;
    comment_add:any;
    user_role;
    poc_flag:{ type: Boolean,default: false};
    status: { type: String, required: true, index: true };
     constructor() {
        this.user_role= 'CUSTOM';
        
    }
}