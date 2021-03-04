import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, forwardRef, Injectable, Input, NgModule, OnDestroy, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from "rxjs";

export class Tab
{
    constructor(
        public Title    : string,
        public Component: Type<any>,
        public Selected = false
        )
    {
    }
}

const detectChanges = new Subject<void>();

@Injectable()
export class ChangeDetector
{
    DetectChanges(): void
    {
        detectChanges.next();
    }
}

export abstract class SelectedTab extends Observable<Tab>
{
    protected _selected = new BehaviorSubject<Tab>(null);

    protected constructor()
    {
        super(
            subscriber =>
            {
                const subscription = this._selected.subscribe(tab => subscriber.next(tab));
                subscriber.add(subscription);
            });
    }
}

@Component(
    {
        selector: 'dt-tab-container',
        template: '<div><ng-template #component></ng-template></div>'
    })
export class TabContainer implements OnDestroy
{
    private _subscriptions: Subscription[] = [];
    private _tab          : Tab;
    private _selectedTab  : Tab;

    constructor(
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _changeDetector          : ChangeDetectorRef,
        selectedTab                      : SelectedTab
        )
    {
        this._subscriptions.push(
            selectedTab.subscribe(
                selectedTab =>
                {
                    this._selectedTab = selectedTab;
                    this.DetachReattach();
                }),
            detectChanges.subscribe(
                () => this._changeDetector.detectChanges()));
    }

    ngOnDestroy(): void
    {
        this._subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    @ViewChild('component', { read: ViewContainerRef, static: true })
    private _viewContainerRef: ViewContainerRef;

    @Input()
    set Tab(
        tab: Tab
        )
    {
        this._tab = tab;
        let componentFactory = this._componentFactoryResolver.resolveComponentFactory(this._tab.Component);
        this._viewContainerRef.clear();
        this._viewContainerRef.createComponent(componentFactory);
        this.DetachReattach();
    }

    private DetachReattach(): void
    {
        if(this._tab && this._selectedTab)
            if(this._selectedTab !== this._tab)
                this._changeDetector.detach();

            else
                this._changeDetector.reattach();
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
        width: 2px;
    }
    table.TabbedView th.Spacer1
    {
        border-width: 1px 0px 0px 0px;
        border-style: solid;
    }
    table.TabbedView th.Tab
    {
        border-width: 1px;
        border-style: solid;
        cursor: pointer;
        text-align: center;
    }
    table.TabbedView td.View
    {
        border-width: 0px 1px 1px 1px;
        border-style: solid;
        padding: 5px;
    }
    table.TabbedView th.Selected
    {
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
                    class="Tab" [ngClass]="{ 'Selected': tab == Selected }"></th>
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
                    [style.display] = "tab == Selected ? 'table-row' : 'none'"
                    (SelectTab)="Selected = tab">
                    <td><dt-tab-container [Tab]="tab"></dt-tab-container></td>
                </tr>
            </table>
        </td>
    </tr>
</table>`,
        providers:
            [
                {
                    provide: SelectedTab,
                    useExisting: forwardRef(() => TabbedView)
                }
            ]
    }
)
export class TabbedView extends SelectedTab
{
    private _tabs: Tab[];

    constructor()
    {
        super();
    }

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
        this._selected.next(tab);
    }

    get Selected(): Tab
    {
        return this._selected.getValue();
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
        ],
        providers:
        [
            ChangeDetector
        ]
    })
export class TabbedViewModule
{ }
