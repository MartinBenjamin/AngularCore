import { CommonModule } from '@angular/common';
import { Component, Directive, ElementRef, Input, NgModule, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { makeDraggable } from './Draggable';

@Directive({ selector: 'dt-dialog-body' })
export class DialogBody
{
}

@Directive({ selector: 'dt-dialog-buttons' })
export class DialogButtons
{
}

@Component(
    {
        selector: 'dt-dialog-container',
        template: `
<style type="text/css">
    table.Dialog { opacity: 0; }
    table.Visible.Dialog { opacity: 1; }
</style>
<div style="position: absolute; left: 0px; top: 0px; width: 100%;" #div>
    <table class="Dialog" style="margin: 150px auto 0px auto;" #table>
        <tr class="Heading"><td style="text-align: center;">{{Title}}</td></tr>
        <tr><td class="Body"><ng-content select="dt-dialog-body"></ng-content></td></tr>
        <tr><td class="Buttons" style="text-align: right;"><ng-content select="dt-dialog-buttons"></ng-content></td></tr>
    </table>
</div>`
    })
export class DialogContainer implements OnInit
{
    @ViewChild('div')
    private _div: ElementRef;

    @ViewChild('table')
    private _table: ElementRef;

    constructor()
    {
    }

    @Input()
    Title: string;

    ngOnInit()
    {
        let dialog = <HTMLDivElement>this._div.nativeElement;
        let table = <HTMLTableElement>this._table.nativeElement;

        dialog.style.left = '0px';
        dialog.style.top = window.pageYOffset.toString() + 'px';

        makeDraggable(
            dialog,
            <HTMLElement>table.rows[0]);

        table.classList.add('Visible');
    }
}

@Component(
    {
        selector: 'dt-dialog-background',
        template: `<div style="position: absolute; left: 0px; top: 0px; width: 100%; height: 1000px; background-color: #fff; opacity: 0.4;"></div>`
    })
export class DialogBackground implements OnInit, OnDestroy
{
    private _handlers: any;

    constructor(
        private _el: ElementRef
        )
    {
    }

    ngOnInit()
    {
        let background = <HTMLDivElement>this._el.nativeElement.firstChild;

        this._handlers =
        {
            scroll: (event: UIEvent) => background.style.top    = window.pageYOffset.toString() + 'px',
            resize: (event: UIEvent) => background.style.height = window.innerHeight.toString() + 'px'
        };

        for(let eventName in this._handlers)
            window.addEventListener(
                eventName,
                this._handlers[eventName]);

        for(let eventName in this._handlers)
            this._handlers[eventName](null);
    }

    ngOnDestroy()
    {
        for(let eventName in this._handlers)
            window.removeEventListener(
                eventName,
                this._handlers[eventName]);

        this._handlers = null;
    }
}

@Component(
    {
        selector: 'dt-dialog',
        template: `
<dt-dialog-background *ngIf="Open"></dt-dialog-background>
<dt-dialog-container *ngIf="Open" [Title]="Title">
        <dt-dialog-body><ng-content select="dt-dialog-body"></ng-content></dt-dialog-body>
        <dt-dialog-buttons><ng-content select="dt-dialog-buttons"></ng-content></dt-dialog-buttons>
</dt-dialog-container>`
    })
export class Dialog
{
    @Input()
    Title: string;

    @Input()
    Open: boolean;
}

@NgModule(
    {
        imports:
        [
            CommonModule
        ],
        declarations:
        [
            Dialog,
            DialogBody,
            DialogButtons,
            DialogContainer,
            DialogBackground
        ],
        exports:
        [
            Dialog,
            DialogBody,
            DialogButtons
        ]
    })
export class DialogModule
{}
