import { Directive,ElementRef, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appOutside]',
   host: {
   '(document:click)': 'onClick($event)',
  }
})
export class OutsideDirective {
  @Output() check1=new EventEmitter();
  constructor(private elementRef: ElementRef) { }

  onClick(event) {
   if (!this.elementRef.nativeElement.contains(event.target)){
    // console.log("clicked")
    this.check1.emit(event)
   }
  }

}
