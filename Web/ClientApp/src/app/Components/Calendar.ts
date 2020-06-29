/// <reference path="Date.d.ts"/>
import { Component, ElementRef, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { DatePatternsToken } from './DatePatterns';
import { makeDraggable } from './Draggable';
import { Patterns } from './Patterns';

interface IDateCell
{
    Date: number;
}

@Component(
    {
        selector: 'dt-calendar',
        template: `<div style="position: absolute; display: none;"></div><span class="fa fa-calendar fa-lg" aria-hidden="true" style="cursor: pointer;"></span>`
    })
export class Calendar implements OnInit
{
    private static _calendarTemplate = `
<table class="popUpCalendar">
    <tr>
        <td>
            <table class="Calendar">
                <colgroup>
                    <col span="7" />
                </colgroup>
                <tr class="month">
                    <td style="cursor: pointer;" title="Go to previous month">&lt;</td>
                    <td style="cursor: pointer;" title="Go to previous year">&lt;&lt;</td>
                    <td colspan="3"></td>
                    <td style="cursor: pointer;" title="Go to next year">&gt;&gt;</td>
                    <td style="cursor: pointer;" title="Go to next month">&gt;</td>
                </tr>
                <tr>
                    <td>Mo</td>
                    <td>Tu</td>
                    <td>We</td>
                    <td>Th</td>
                    <td>Fr</td>
                    <td>Sa</td>
                    <td>Su</td>
                </tr>
                <tbody class="calendarDays">
                    <tr><td /><td /><td /><td /><td /><td /><td /></tr>
                    <tr><td /><td /><td /><td /><td /><td /><td /></tr>
                    <tr><td /><td /><td /><td /><td /><td /><td /></tr>
                    <tr><td /><td /><td /><td /><td /><td /><td /></tr>
                    <tr><td /><td /><td /><td /><td /><td /><td /></tr>
                    <tr><td /><td /><td /><td /><td /><td /><td /></tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td style="text-align: right;"><input type="button" value="Cancel" class="Button"/></td>
    </tr>
</table>`;

    private _currentMonth: Date;
    private _observers   : ((date: Date) => void)[] = [];
    private _formatter   : (date: Date) => string;

    constructor(
        @Inject(DatePatternsToken)
        patterns   : Patterns,
        private _el: ElementRef
        )
    {
        this._formatter = formatUTCDate(patterns.Output);
    }

    private NotifyObservers(): void
    {
        this._observers.forEach(notify => notify(this._currentMonth));
    }

    DecrementMonth(): void
    {
        this._currentMonth.setUTCMonth(this._currentMonth.getUTCMonth() - 1);
        this.NotifyObservers();
    }

    IncrementMonth(): void
    {
        this._currentMonth.setUTCMonth(this._currentMonth.getUTCMonth() + 1);
        this.NotifyObservers();
    }

    DecrementYear(): void
    {
        this._currentMonth.setUTCFullYear(this._currentMonth.getUTCFullYear() - 1);
        this.NotifyObservers();
    }

    IncrementYear(): void
    {
        this._currentMonth.setUTCFullYear(this._currentMonth.getUTCFullYear() + 1);
        this.NotifyObservers();
    }

    ngOnInit()
    {
        let panel = <HTMLElement>this._el.nativeElement.childNodes[0];
        let icon  = <HTMLElement>this._el.nativeElement.childNodes[1];
        let dateComponent = this;

        function initialise(
            panel: HTMLElement
            )
        {
            panel.innerHTML = Calendar._calendarTemplate;
            let calendarTable    = <HTMLTableElement>panel.querySelector('table.Calendar');
            let monthRow         = <HTMLTableRowElement>calendarTable.rows[0];
            let month            = <HTMLTableCellElement>monthRow.cells[2];
            let prevMonth        = <HTMLTableCellElement>monthRow.cells[0];
            let nextMonth        = <HTMLTableCellElement>monthRow.cells[4];
            let prevYear         = <HTMLTableCellElement>monthRow.cells[1];
            let nextYear         = <HTMLTableCellElement>monthRow.cells[3];
            let calendarDaysBody = <HTMLElement>calendarTable.tBodies[1];
            let cancel           = panel.querySelector('input[type=button]');
            let dateFormatter    = formatUTCDate('MMM yyyy');

            let today = new Date();
            dateComponent._currentMonth = new Date(0);
            dateComponent._currentMonth.setUTCFullYear(
                today.getUTCFullYear(),
                today.getUTCMonth(),
                1);

            prevMonth.addEventListener('click', () => dateComponent.DecrementMonth());
            nextMonth.addEventListener('click', () => dateComponent.IncrementMonth());
            prevYear.addEventListener('click', () => dateComponent.DecrementYear());
            nextYear.addEventListener('click', () => dateComponent.IncrementYear());

            calendarDaysBody.addEventListener(
                'click',
                (event: MouseEvent) =>
                {
                    var srcElement = <HTMLElement>event.srcElement;
                    if(srcElement.tagName.toLowerCase() == 'td')
                    {
                        dateComponent.DateSelected.emit(dateComponent._formatter(new Date((<Element & IDateCell>event.srcElement).Date)));
                        panel.style.display = 'none';
                    }
                });

            dateComponent._observers.push(
                (currentMonth: Date) =>
                {
                    month.innerText = dateFormatter(currentMonth);
                });

            dateComponent._observers.push(
                (currentMonth: Date) =>
                {
                    let dayOfWeek = (currentMonth.getUTCDay() + 6) % 7;

                    // Set date to the first Monday before month begins.
                    let date = new Date(currentMonth.valueOf());
                    date.setUTCDate(date.getUTCDate() - (dayOfWeek > 0 ? dayOfWeek : 7));

                    for(var weekIndex = 0; weekIndex < 6; ++weekIndex)
                    {
                        let row = <HTMLTableRowElement>calendarDaysBody.children[weekIndex];
                        for(var dayIndex = 0; dayIndex < 7; ++dayIndex)
                        {
                            let dayCell = <HTMLTableCellElement & IDateCell>(row.cells[dayIndex]);
                            dayCell.innerText = date.getDate().toString();
                            dayCell.Date      = date.valueOf();
                            dayCell.className = date.getMonth() == currentMonth.getMonth() ? 'current' : '';

                            date.setUTCDate(date.getUTCDate() + 1);
                        }
                    }
                });

            cancel.addEventListener(
                'click',
                function(
                    event: MouseEvent
                    )
                {
                    panel.style.display = 'none';
                });

            makeDraggable(
                panel,
                month);

            dateComponent.NotifyObservers();
        };

        icon.addEventListener(
            'click',
            function(
                event: MouseEvent
                )
            {
                if(!panel.childNodes.length)
                    initialise(panel);

                panel.style.display = 'block';
            });
    }

    @Output('dateSelected')
    DateSelected = new EventEmitter<string>();
}
