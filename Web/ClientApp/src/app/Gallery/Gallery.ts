import { Component, ViewChild } from '@angular/core';
import { Tab } from './TabbedView';
import { PredicateEvaluation, PredicateType } from './PredicateEvaluation';
import { OrganisationalUnitSelector } from './OrganisationalUnitSelector';
import { OrganisationalUnitSelectorV2 } from './OrganisationalUnitSelectorV2';
import { AssessmentViewer } from './AssessmentViewer';
import { OrganisationalUnit } from './OrganisationalUnit';
import { TestTab } from './TestTab';

@Component({
  selector: 'gallery',
  template: '<h1>Gallery</h1>\
<table>\
    <tr>\
        <td>dtTextModel</td>\
        <td><input type="text" [(dtTextModel)]="text" [dtModelErrors]="errors?.A"/></td>\
        <td>{{text}}</td>\
    </tr>\
    <tr>\
        <td>dtDateModel</td>\
        <td><input type="text" [(dtDateModel)]="date" [dtModelErrors]="errors?.B?.C"/></td>\
        <td>{{date}}</td>\
    </tr>\
    <tr>\
        <td>dtAmountModel</td>\
        <td><input type="text" [(dtAmountModel)]="amount" [dtModelErrors]="errors?.B?.D"/></td>\
        <td>{{amount}}</td>\
    </tr>\
    <tr>\
        <td>dtPercentageModel</td>\
        <td><input type="text" [(dtPercentageModel)]="percentage"/></td>\
        <td>{{percentage}}</td>\
    </tr>\
    <tr>\
        <td>dtPercentage100Model</td>\
        <td><input type="text" [(dtPercentage100Model)]="percentage"/></td>\
        <td>{{percentage}}</td>\
    </tr>\
    <tr>\
        <td>dt-calendar</td>\
        <td><dt-calendar (dateSelected)="date = $event"></dt-calendar></td>\
        <td>{{date}}</td>\
    </tr>\
    <tr>\
        <td>utcDate (Pipe)</td>\
        <td>{{utcDate|utcDate}}</td>\
    </tr>\
    <tr>\
        <td>100000|amount</td>\
        <td>{{100000|amount}}</td>\
    </tr>\
    <tr>\
        <td>99|percentage</td>\
        <td>{{99|percentage}}</td>\
    </tr>\
    <tr>\
        <td>dt-dialog</td>\
        <td><dt-dialog\
                Title="abc"\
                [Open]="open">\
                <dt-dialog-body>Body Body</dt-dialog-body>\
                <dt-dialog-buttons><input type="Button" value="Close" (click)="open=false"></dt-dialog-buttons>\
            </dt-dialog><input type="Button" value="Open" (click)="open = true">\
        </td>\
        <td></td>\
    </tr>\
    <tr>\
        <td>dt-tabbed-view</td>\
        <td colspan="2"><dt-tabbed-view [Tabs]="tabs"></dt-tabbed-view></td>\
    </tr>\
    <tr>\
        <td><input type="Button" value="dt-errors" (click)="toggle()"/></td>\
        <td colspan="2"><dt-errors [Errors]="errors"></dt-errors></td>\
    </tr>\
    <tr>\
        <td><input type="Button" value="dt-organisational-unit-selector" (click)="select()"/></td>\
        <td colspan="2"><dt-organisational-unit-selector\
            Title="Primary ECA Office"\
            [Hierarchy]="hierarchy" #organisationalUnitSelector\
            (Oncancel)="organisationalUnit = \'Cancelled\'"></dt-organisational-unit-selector>{{organisationalUnit}}</td>\
    </tr>\
    <tr>\
        <td><input type="Button" value="dt-organisational-unit-selector-v2" (click)="selectV2()"/></td>\
        <td colspan="2"><dt-organisational-unit-selector-v2\
            Title="V2"\
            [Hierarchy]="hierarchy" #organisationalUnitSelectorV2\
            (Oncancel)="organisationalUnit = \'Cancelled\'"></dt-organisational-unit-selector-v2>{{organisationalUnit}}</td>\
    </tr>\
    <tr>\
        <td><input type="Button" value="assessment-viewer" (click)="viewAssessment()"/></td>\
        <td colspan="2"><assessment-viewer #assessmentViewer></assessment-viewer></td>\
    </tr>\
</table>',
})
export class Gallery
{
    hierarchy: OrganisationalUnit;

    @ViewChild('organisationalUnitSelector')
    organisationalUnitSelector: OrganisationalUnitSelector;

    @ViewChild('organisationalUnitSelectorV2')
    organisationalUnitSelectorV2: OrganisationalUnitSelectorV2;

    @ViewChild('assessmentViewer')
    assessmentViewer: AssessmentViewer;

    text       = 'text';
    date       = 'date';
    amount     = 'amount';
    percentage = 'percentage';
    utcDate    = new Date(Date.UTC(2000, 0, 1));
    open       = false;
    tabs       =
    [
        new Tab('T<sub>1</sub>', TestTab, [ 'ABC', null ]),
        new Tab('T<sub>2</sub>', TestTab, [ 'DEF', null ])
    ];
    errors: any = null;
    organisationalUnit: string;
    toggle(): void
    {
        if(!this.errors)
        {
            this.errors =
                {
                    A: ['dtTextModel'],
                    B:
                    {
                        C: ['<b>dtDateModel<sub>1</sub></b>', '<b>dtDateModel<sub>2</sub></b>'],
                        D: ['dtAmountModel']
                    },
                    E: ['dt-tabbed-view']
                };

            this.tabs[1].Model[1] = this.errors.E;
        }
        else
            this.errors = null;
    };

    select()
    {
        this.hierarchy =
            {
                Id      : 1,
                Acronym : 'Root',
                Parent  : null,
                Children: null
            };

        this.hierarchy.Children =
            [
                {
                    Id      : 2,
                    Acronym : 'A',
                    Parent  : this.hierarchy,
                    Children: []
                },
                {
                    Id      : 3,
                    Acronym : 'B',
                    Parent  : this.hierarchy,
                    Children: []
                }
            ];
        this.organisationalUnitSelector.Select(organisationalUnit => this.organisationalUnit = organisationalUnit.Acronym);
    }


    selectV2()
    {
        this.hierarchy =
            {
                Id: 1,
                Acronym: 'Root',
                Parent: null,
                Children: null
            };

        this.hierarchy.Children =
            [
                {
                    Id: 2,
                    Acronym: 'AB',
                    Parent: this.hierarchy,
                    Children: []
                },
                {
                    Id: 3,
                    Acronym: 'BC',
                    Parent: this.hierarchy,
                    Children: []
                }
            ];
        this.organisationalUnitSelectorV2.Select(organisationalUnit => this.organisationalUnit = organisationalUnit.Acronym);
    }


    viewAssessment()
    {
        this.hierarchy =
            {
                Id: 1,
                Acronym: 'Root',
                Parent: null,
                Children: null
            };

        this.hierarchy.Children =
            [
                {
                    Id: 2,
                    Acronym: 'AB',
                    Parent: this.hierarchy,
                    Children: []
                },
                {
                    Id: 3,
                    Acronym: 'BC',
                    Parent: this.hierarchy,
                    Children: []
                }
            ];

        let assessment = <PredicateEvaluation>
            {
                Type: PredicateType.Conjunction,
                Result: true,
                Description: 'Conjuction1',
                Parent: null
            };

        assessment.Children =
            [
                <PredicateEvaluation>{
                    Type: PredicateType.Terminal,
                    Result: false,
                    Description: 'Terminal1',
                    Parent: assessment,
                    Children: []
                },
                <PredicateEvaluation>{
                    Type: PredicateType.Terminal,
                    Result: true,
                    Description: 'Terminal2',
                    Parent: assessment,
                    Children: []
                }
            ];

        this.assessmentViewer.View(assessment);
    }
}
