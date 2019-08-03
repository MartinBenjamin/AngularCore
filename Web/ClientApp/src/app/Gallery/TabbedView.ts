import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, Input, NgModule, Type, ViewChild, ViewContainerRef } from '@angular/core';

export interface TabComponent
{
    Model: any;
}

export class Tab
{
    constructor(
        public Title    : string,
        public Component: Type<TabComponent>,
        public Model    : any,
        public Selected = false
        )
    {
    }
}

@Component(
    {
        selector: 'dt-tab-container',
        template: '<div><ng-template #component></ng-template></div>'
    })
export class TabContainer
{
    constructor(
        private _componentFactoryResolver: ComponentFactoryResolver
        )
    {
    }

    @ViewChild('component', { read: ViewContainerRef })
    private _viewContainerRef: ViewContainerRef;

    @Input()
    set Tab(
        tab: Tab
        )
    {
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(tab.Component);
        this._viewContainerRef.clear();
        let tabComponentRef = this._viewContainerRef.createComponent(componentFactory);
        tabComponentRef.instance.Model = tab.Model;
    }
}

@Component(
    {
        selector: 'dt-tabbed-view',
        template: `
<style type="text/css">
    table.TabbedView
    {
        border-collapse: collapse;
        table-layout: fixed;
    }
    table.TabbedView th.Spacer
    {
        border-width: 0px 0px 1px 0px;
        border-style: solid;
        border-color: #ccf;
        width: 2px;
    }
    table.TabbedView th.Spacer1
    {
        border-width: 1px 0px 0px 0px;
        border-style: solid;
        border-color: #ccf;
    }
    table.TabbedView th.Tab
    {
        border-width: 1px;
        border-style: solid;
        border-color: #ccccff;
        background-color : #f0f0f0;
        width: 110px;
        cursor: pointer;
        text-align: center;
    }
    table.TabbedView td.View
    {
        border-width: 0px 1px 1px 1px;
        border-style: solid;
        border-color: #ccf;
        padding: 5px;
    }
    table.TabbedView th.Selected
    {
        background-color: White;
        border-bottom-width: 0px;
    }
</style>
<table class="TabbedView" *ngIf="Tabs.length">
    <thead>
        <tr>
            <ng-container *ngFor="let tab of Tabs">
                <th class="Spacer"></th>
                <th
                    (click)="Selected = tab"
                    [innerHTML]="tab.Title"
                    class="Tab" [ngClass]="{ \'Selected\': tab == Selected }"></th>
            </ng-container>
            <th class="Spacer" style= "width: auto;"></th>
        </tr>
        <tr>
            <th class="Spacer1" style="border-left-width: 1px;"></th>
            <ng-container *ngFor="let tab of Tabs;let first = first">
                <th *ngIf="!first" class="Spacer1"></th>
                <th></th>
            </ng-container>
            <th class="Spacer1" style="border-right-width: 1px;"></th>
        </tr>
    </thead>
    <tr>
        <td class="View" colSpan="{{Tabs.length * 2 + 1}}">
            <table>
                <tr
                    *ngFor="let tab of Tabs"
                    [style.display] = "tab == Selected ? \'table-row\' : \'none\'"
                    (SelectTab)="Selected = tab">
                    <td><dt-tab-container [Tab]="tab"></dt-tab-container></td>
                </tr>
            </table>
        </td>
    </tr>
</table>`
    }
)
export class TabbedView
{
    private _tabs    : Tab[];
    private _selected: Tab;

    @Input()
    set Tabs(
        tabs: Tab[]
        )
    {
        this._tabs = tabs || [];

        for(let tab of this._tabs)
            if(tab.Selected)
            {
                this.Selected = tab;
                return;
            }

        this.Selected = tabs[0];
    }

    get Tabs(): Tab[]
    {
        return this._tabs;
    }

    set Selected(
        tab
        )
    {
        if(this._selected)
            this._selected.Selected = false;

        this._selected = tab;

        if(this._selected)
            this._selected.Selected = true;
    }

    get Selected(): Tab
    {
        return this._selected;
    }
}

@NgModule(
    {
        imports:
        [
            CommonModule
        ],
        declarations:
        [
            TabbedView,
            TabContainer
        ],
        exports:
        [
            TabbedView
        ]
    })
export class TabbedViewModule
{ }
