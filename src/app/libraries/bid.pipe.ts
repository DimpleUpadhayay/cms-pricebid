import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({
    name: 'query'
})

export class FilterPipe implements PipeTransform {
    transform(items: any[], value, year: string, bidName: string): any[] {
        if (!items) {
            return [];
        }
        return items.filter(it => {
            var d = new Date(it.date_created);
            var n = d.getMonth();
            var y = d.getFullYear();
            if (bidName) {
                if (it.name.toLowerCase().includes(bidName.toLowerCase())) {
                    return it
                };
                if (it.account_name.toLowerCase().includes(bidName.toLowerCase())) {
                    return it
                };
                if (it.bid_number.toLowerCase().includes(bidName.toLowerCase())) {
                    return it
                };
            } else {
                if (n == value && y.toString() == year) {
                    return it
                };
            }
        });
    }
}

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }
    transform(url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}

@Pipe({ name: 'seachComment' })
export class CommentPipe implements PipeTransform {
    transform(items: any[], value, date): any[] {
        if (!items) {
            return [];
        }
        if (!value && !date[0] && !date[1]) {
            return items;
        }
        return items.filter(it => {
            if (value) {
                return it.comment.toLowerCase().includes(value.toLowerCase());
            }
            if (date[0] && date[1] && it.data_created >= new Date(date[0]).getTime() && it.data_created <= new Date(date[1]).getTime()) {
                return it;
            } else if (!date[0] && it.data_created <= new Date(date[1]).getTime()) {
                return it;
            } else if (!date[1] && it.data_created >= new Date(date[0]).getTime()) {
                return it;
            }
        });
    }
}

@Pipe({ name: 'seachNotification' })
export class NotificationPipe implements PipeTransform {
    transform(items: any[], value): any[] {
        if (!items) {
            return [];
        }
        if (!value) {
            return items;
        }
        return items.filter(it => {
            if (value) {
                return it.bid_name.toLowerCase().includes(value.toLowerCase());
            }
        });
    }
}

@Pipe({ name: 'search' })
export class searchPipe implements PipeTransform {
    transform(items: any[], value, index): any[] {
        // console.log(items, value);
        if (!items) {
            return [];
        }
        if (!value) {
            return items;
        }
        return items.filter(it => {
            if (value) {
                return it[index].toLowerCase().includes(value.toLowerCase());
            }
        });
    }
}