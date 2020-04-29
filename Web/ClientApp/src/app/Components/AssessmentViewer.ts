import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Visit } from './Hierarchical';
import { PredicateEvaluation, PredicateType } from './PredicateEvaluation';

@Component(
    {
        selector: 'assessment-viewer',
        template: `
<dt-dialog
    [Title]="Title"
    [Open]="Assessment">
    <dt-dialog-body><table class="DataGrid" #table></table></dt-dialog-body>
    <dt-dialog-buttons><input type="Button" value="Close" (click)="Close()" class="Button"></dt-dialog-buttons>
</dt-dialog>`
    })
export class AssessmentViewer
{
    private _assessment: PredicateEvaluation;

    @ViewChild('table')
    private _table: ElementRef;

    constructor()
    {
    }

    @Input()
    Title: string = 'Assessment'

    get Assessment(): PredicateEvaluation
    {
        return this._assessment;
    }

    View(
        assessment: PredicateEvaluation
        ): void
    {
        this._assessment = assessment;

        let table = <HTMLTableElement>this._table.nativeElement;

        while(table.childNodes.length)
            table.removeChild(table.firstChild);

        if(!this._assessment)
            return;

        let maxDepth = 0;
        let depth = 0;

        Visit(
            assessment,
            predicateEvaluation =>
            {
                maxDepth = Math.max(++depth, maxDepth);
            },
            predicateEvaluation => --depth);

        depth = 0;

        Visit(
            assessment,
            predicateEvaluation =>
            {
                ++depth;

                let parent = predicateEvaluation.Parent;
                let prefix = '';

                let row = table.insertRow();
                let td: HTMLTableCellElement;

                if(parent)
                    if(parent.Children[0] == predicateEvaluation)
                    {

                        let childCount = 0;
                        parent.Children.forEach(
                            child => Visit(
                                child,
                                child => ++childCount));
                        td = row.insertCell();
                        td.rowSpan = childCount;
                    }
                    else
                        prefix = parent.Type == PredicateType.Conjunction ? 'AND ' : 'OR ';

                td = row.insertCell();
                td.innerHTML = predicateEvaluation.Result ?
                    '<span class="fa fa-check-circle-o fa-lg" aria-hidden="true" style="color: green;"></span>' :
                    '<span class="fa fa-times-circle-o fa-lg" aria-hidden="true" style="color: red;"></span>';
                td = row.insertCell();
                td.innerText = prefix + predicateEvaluation.Description;
                td.colSpan = maxDepth - depth + 1;
            },
            predicateEvaluation => --depth);
    }

    Close(): void
    {
        this._assessment = null;
    }
}
