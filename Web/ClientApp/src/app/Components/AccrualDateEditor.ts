import { Component, Input } from '@angular/core';
import { AccrualDate, AccrualDateMonths } from './AccrualDate';
import { calendar } from './Cldr';

@Component(
    {
        selector: 'accrual-date-editor',
        template: `
<style type="text/css">
  span.AccrualDateEditor select.Month
  {
    width: 50px;
  }

  span.AccrualDateEditor input.Year
  {
    width: 40px;
  }

  span.AccrualDateEditor span.Separator
  {
    padding: 1px;
  }
</style>
<span class="AccrualDateEditor"
  ><select
    [ngModel]="AccrualDate?.Month"
    (ngModelChange)="AccrualDate.Month = $event"
    class="Month">
    <option [ngValue]="null"></option>
    <option *ngFor="let month of Months" [ngValue]="month">{{MonthNames[month]}}</option>
</select><span class="Separator">-</span><input
    type="text"
    [ngModel]="AccrualDate?.Year"
    (ngModelChange)="AccrualDate.Year = $event"
    maxlength="4"
    class="Year"/></span>`
    })
export class AccrualDateEditor
{
    private _accrualDate: AccrualDate;

    Months    = AccrualDateMonths;
    MonthNames: string[] = calendar.months.format.abbreviated;

    @Input()
    set AccrualDate(
        accrualDate: AccrualDate
        )
    {
        this._accrualDate = accrualDate
    }

    get AccrualDate(): AccrualDate
    {
        return this._accrualDate;
    }
}
