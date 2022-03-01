import { Component, OnInit, ViewContainerRef, Injectable } from '@angular/core';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
import { ToastsManager, ToastOptions } from 'ng2-toastr';
const swal: SweetAlert = _swal as any;

@Component({
    selector: 'app-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.css'],
    providers: []

})

export class AlertComponent implements OnInit {

    add: any = '';
    edit: any = '';
    delete: any = '';
    role: any = '';
    save: any = '';

    constructor(public toastr: ToastsManager, vcr: ViewContainerRef) {
        this.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
    }

    sweetSuccess(msg) {
        swal({
            //title: "Good job!",
            text: msg,
            icon: "success",
            timer: 2000,
            buttons: [""],
        });
    }

    sweetError(msg) {
        swal({
            //title: "Good job!",
            text: msg,
            icon: "warning",
            timer: 2000,
            buttons: [""],
        });
    }

    sweetNoAttachments() {
        swal({
            //title: "Good job!",
            text: 'No attachments',
            icon: "warning",
            timer: 2000,
            buttons: [""],
        });
    }

    added(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Your data has been submitted", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    clone(message) {
        return new Promise((resolve, reject) => {
            swal("Clone",
                "Do you want to clone this bid?",
                "warning", {
                buttons: ["No", "Yes"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been submitted", {
                        //     icon: "success",
                        //     timer: 2000,
                        //     buttons: [""]
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitMain(message) {
        return new Promise((resolve, reject) => {
            swal("Contributor's tasks are pending",
                "Do you want to proceed?",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Your data has been submitted", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitReview(message) {
        return new Promise((resolve, reject) => {
            swal("Contributor's tasks are pending",
                "You can send for " + message + " Review only after all Contributor's complete their tasks",
                "warning", {
                buttons: [""],
                timer: 3000,
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    customConfirmation(title, msg) {
        return new Promise((resolve, reject) => {
            swal(title,
                msg,
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Your data has been submitted", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    emdPbgSofAlert(title, msg) {
        return new Promise((resolve, reject) => {
            swal(title,
                msg,
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been submitted", {
                        //     icon: "success",
                        //     timer: 2000,
                        //     buttons: [""]
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    danger(title, msg) {
        return new Promise((resolve, reject) => {
            swal(title,
                msg,
                "error", {
                buttons: ["Cancel", "Ok"],
                dangerMode: true,
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Your data has been submitted", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitPS(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Your data has been submitted", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    deleteUser(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once deleted, you will not be able to recover",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("User has been deleted permanently", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        //swal("Your data is safe");
                        reject(true);
                    }
                });
        });
    }

    checked(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once checked, you will not be able to make changes in this row",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your record has been saved", {
                        //     icon: "success",
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitForProposalReview(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure to submit for Proposal Review?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Submit for Proposal Review successfully", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitForPricingReview(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure to submit for Pricing Review?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Submit for Pricing Review successfully", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitForPrePricingReview(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure to submit for Delivery Review?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Submit for Delivery Review successfully", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitForSolutionReview(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure to submit for Solution Review?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Submit for Solution Review successfully", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitForApproval(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure to submit for Approval ?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Submit for Approval successfully", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    submitForRevision(message) {
        return new Promise((resolve, reject) => {
            swal("Do you want to create a new version of this bid ?",
                "Once submitted, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Submit for Revision successfully", {
                        //     icon: "success",
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    /* Approval Dashboard */
    confirm(message) {
        return new Promise((resolve, reject) => {
            /* swal("Are you sure to you want to ${message} this bid ?",
                "warning",  {
                    buttons: ["Cancel", "Ok"],
                }
            ) */
            if (message == "RFI") {
                message = "Request for more Information"
            }
            swal(`Are you sure you want to ${message}?`,
                "Once submitted, you will not be able to make changes",
                //`you want to ${message} this bid ?`,
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been submitted", {
                        //     icon: "success",
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    /* Approval Dashboard */
    confirmSofEmd(message) {
        return new Promise((resolve, reject) => {
            /* swal("Are you sure to you want to ${message} this bid ?",
                "warning",  {
                    buttons: ["Cancel", "Ok"],
                }
            ) */
            swal (message,
                " Once submitted, you will not be able to make changes",
                //`you want to ${message} this bid ?`,
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been submitted", {
                        //     icon: "success",
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    validation(message) {
        swal(message, "");
    }

    saved(message) {
        this.save = message;
        setTimeout(() => {
            this.save = ''
        }, 2000)
    }

    dateValidation(message) {
        swal(message)
    }

    edited(message) {
        this.add = message;
        swal(message, "");
    }

    deleted(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once deleted, you will not be able to recover",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        swal("Your data has been deleted", {
                            icon: "success",
                            timer: 2000,
                            buttons: [""]
                        });
                        resolve(true)
                    } else {
                        //swal("Your data is safe");
                        reject(true);
                    }
                });
        });
    }

    network(message) {

    }

    roles(message) {
        this.role = message;

    }

    /*
    () {
        this.toastr.custom('<span>Data saved as draft</span>', null, { enableHTML: true });
    } */

    uploadSuccess() {
        this.toastr.custom('<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; File uploaded Successfully</span>', null, { enableHTML: true });
    }

    error(msg) {
        this.toastr.error(msg)
    }

    success(msg) {
        this.toastr.success(msg);
    }

    confirmed(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once confirmed, you will not be able to make changes",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been submitted", {
                        //     icon: "success",
                        //     timer: 2000,
                        //     buttons: [""]
                        // });
                        resolve(true)
                    } else {
                        reject(true);
                    }
                });
        });
    }

    deleteUserCompanyAdmin(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "Once deleted, user will deleted permanently",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been deleted", {
                        //     icon: "success",
                        //     timer: 2000,
                        //     buttons: [""]
                        // });
                        resolve(true)
                    } else {
                        //swal("Your data is safe");
                        reject(true);
                    }
                });
        });
    }

    deleteApproverCompanyAdmin(message) {
        return new Promise((resolve, reject) => {
            swal("Are you sure?",
                "You want to remove Approver",
                "warning", {
                buttons: ["Cancel", "Ok"],
            }
            )
                .then((willDelete) => {
                    if (willDelete) {
                        // swal("Your data has been deleted", {
                        //     icon: "success",
                        //     timer: 2000,
                        //     buttons: [""]
                        // });
                        resolve(true)
                    } else {
                        //swal("Your data is safe");
                        reject(true);
                    }
                });
        });
    }

}

@Injectable()
export class CustomOption extends ToastOptions {
    toastLife = 5000;
    positionClass = "toast-top-center";
    maxShown = 1;
    showCloseButton = true;
    //animate = "flyLeft"
}
