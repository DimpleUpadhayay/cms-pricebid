import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'startsWith' })
export class CustomPipe implements PipeTransform {
  transform(value: any[], term: string): any[] {
    let abc = [];
    if (value[1].solution_id) {
      if ((value && value.length > 0)) {
        abc = value.filter(a => {
          return a.solution_id == term
        });
      }
    } else if (value[1].proposal_id) {
      if ((value && value.length > 0)) {
        abc = value.filter(a => {
          return a.proposal_id == term
        });
      }
    } else if (value[1].techsolution_id) {
      if ((value && value.length > 0)) {
        abc = value.filter(a => {
          return a.techsolution_id == term
        });
      }
    }
    return abc;
  }
}

@Pipe({ name: 'reverse' })
export class ReversePipe implements PipeTransform {
  transform(value) {
    return value.slice().reverse();
  }
}
