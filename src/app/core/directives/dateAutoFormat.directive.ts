import { Directive, HostListener, ElementRef } from '@angular/core';
import * as moment from 'moment';

@Directive({
    selector: '[AutoDateFormat]'
})

export class AutoDateFormatDirective {

    currentFormat;
    constructor(private el: ElementRef) {
        let format =  localStorage.getItem('DatePickerFormat').split('/');
        this.currentFormat = format[0] + format[1]+ format[2];

    }
    @HostListener('blur') 
    onBlur() {
        const inputValue = this.el.nativeElement.value;
        if (inputValue !== '') {
            this.formatDate(inputValue);
          }
    }

    formatDate(value: string) {
        const momentDate = moment(value, [this.currentFormat]); 
        const formatedValue = momentDate.isValid() ? momentDate.format(localStorage.getItem('DatePickerFormat')) : value;
        this.el.nativeElement.value = formatedValue;
      }
}
