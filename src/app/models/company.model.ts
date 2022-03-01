export class Company {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_website: string;
    contact_name_primary: string;
    contact_email_primary: string;
    contact_phone_primary: string;
    contact_phone_secondary: string;
    contact_name_secondary: string;
    contact_email_secondary: string;
    product_type: string;
    constructor() {

        this.company_name = '';
        this.company_address = '';
        this.company_phone = '';
        this.company_website = '';
        this.contact_name_primary = '';
        this.contact_email_primary = '';
        this.contact_phone_primary = '';
        this.product_type = '';
    }
}