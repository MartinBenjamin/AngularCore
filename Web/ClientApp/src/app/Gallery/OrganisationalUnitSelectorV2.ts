import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgModule, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { DialogModule } from './Dialog';
import { Filter, Visit } from './Hierarchical';
import { OrganisationalUnit } from './OrganisationalUnit';
import { OrganisationalUnitSelectorConfiguration } from './OrganisationalUnitSelector';

declare var d3: any;

type Callback<T> = (t: T) => void;

var margin = { top: 20, right: 20, bottom: 20, left: 20 };

function name(
    d: OrganisationalUnit
    ): string
{
    return d.Acronym;
}

function diagonal(
    d
    )
{
    return 'M' + d.source.y + ',' + d.source.x
        + 'H' + (d.target.y + d.source.y) / 2
        + 'V' + d.target.x
        + 'H' + d.target.y;
}

@Component(
    {
        selector: 'dt-organisational-unit-selector-v2',
        template: `
<dt-dialog
    [Title]="Title"
    [Open]="Callback">
    <dt-dialog-body><dt-organisational-unit-container-v2
        [Hierarchy]="Hierarchy"
        [Callback]="Callback"></dt-organisational-unit-container-v2></dt-dialog-body>
    <dt-dialog-buttons><input type="Button" value="Close" (click)="Cancel()" class="Button"></dt-dialog-buttons>
</dt-dialog>`
    })
export class OrganisationalUnitSelectorV2
{
    private static _defaultConfiguration = <OrganisationalUnitSelectorConfiguration>
    {
        Selectable: (organisationalUnit: OrganisationalUnit) => true,
        Collapsed : (organisationalUnit: OrganisationalUnit) => false
    };

    private _hierarchy: OrganisationalUnit;
    private _callback : Callback<OrganisationalUnit>;

    @Input()
    Title: string = 'Select Organisational Unit'

    @Input()
    Configuration = OrganisationalUnitSelectorV2._defaultConfiguration;

    @Output()
    Oncancel = new EventEmitter<void>();

    constructor()
    {
    }

    @Input()
    set Hierarchy(
        hierarchy: OrganisationalUnit
        )
    {
        this._hierarchy = hierarchy;
    }

    get Hierarchy(): OrganisationalUnit
    {
        return this._hierarchy;
    }

    Select(
        callback: Callback<OrganisationalUnit>
        ): void
    {
        this._callback = callback;
    }

    get Callback(): Callback<OrganisationalUnit>
    {
        return this._callback;
    }

    Close(): void
    {
        this._callback = null;
    }

    Cancel(): void
    {
        this.Close();
        this.Oncancel.emit();
    }
}

@Component(
    {
        selector: 'dt-organisational-unit-container-v2',
        template: `<span class="RowHeading">Filter:</span><input type="text" #nameFragmentInput/><div #div></div>`
    })
export class OrganisationalUnitContainerV2 implements OnInit
{
    private static _duration = 750;

    private _hierarchy: OrganisationalUnit;
    private _callback : Callback<OrganisationalUnit>;
    private _svg      : any;
    private _g        : any;
    private _tree     : any;

    @ViewChild('nameFragmentInput')
    private _nameFragmentInput: ElementRef;

    @ViewChild('div')
    private _div: ElementRef;

    constructor(
        private _selector: OrganisationalUnitSelectorV2
        )
    {
    }

    ngOnInit(): void
    {
        fromEvent(
            this._nameFragmentInput.nativeElement,
            'keyup').pipe(
                map(event => <string>this._nameFragmentInput.nativeElement.value),
                map((nameFragment: string) => nameFragment.toLowerCase()),
                distinctUntilChanged(),
                debounceTime(750),
                filter(nameFragment => nameFragment != null))
                .subscribe((nameFragment: string) =>
                {
                    if(!this._hierarchy)
                        return;

                    if(nameFragment == '')
                    {
                        Visit(
                            this._hierarchy,
                            organisationalUnit =>
                            {
                                let node = <any>organisationalUnit;
                                node.hide      = false;
                                node.collapsed = this._selector.Configuration.Collapsed(organisationalUnit);
                            });

                        this.Update();
                        return;
                    }

                    Visit(
                        this._hierarchy,
                        (node: any) =>
                        {
                            node.hide      = true;
                            node.collapsed = false;
                        });

                    let matched = Filter(
                        this._hierarchy,
                        organisationalUnit => name(organisationalUnit).toLowerCase().indexOf(nameFragment) != -1);

                    matched.forEach(
                        organisationalUnit =>
                        {
                            Visit(
                                organisationalUnit,
                                organisationalUnit => (<any>organisationalUnit).hide = false);

                            (<any>organisationalUnit).collapsed = true;

                            let parent = organisationalUnit.Parent;
                            while(parent)
                            {
                                (<any>parent).hide = false;
                                parent = parent.Parent;
                            }
                        });

                    this.Update();
                });
    }

    @Input()
    set Hierarchy(
        hierarchy: OrganisationalUnit
        )
    {
        this._hierarchy = hierarchy;
    }

    @Input()
    set Callback(
        callback: Callback<OrganisationalUnit>
        )
    {
        this._callback = callback;

        if(callback)
            this.Initialise();
    }

    private Initialise(): void
    {
        this._tree = d3.layout.tree()
            .children(
                function(
                    d
                    )
                {
                    return d.collapsed ? null : d.Children.filter(child => !child.hide);
                })
            .sort(
                function(
                    x,
                    y
                    )
                {
                    if(name(x) < name(y))
                        return -1;
                    if(name(x) > name(y))
                        return 1;
                    return 0;
                })
            .nodeSize([40, 40]);

        Visit(
            this._hierarchy,
            organisationalUnit =>
            {
                let node = <any>organisationalUnit;
                node.x0        = 0;
                node.y0        = 0;
                node.hide      = false;
                node.collapsed = this._selector.Configuration.Collapsed(node);
            });

        let div = <HTMLDivElement>this._div.nativeElement;
        while(div.childNodes.length)
            div.removeChild(div.firstChild);

        this._svg = d3.select(div).append('svg');
        this._g   = this._svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        this.Update();
    }

    private Update(): void
    {
        // Compute the new tree layout.
        let nodes = this._tree.nodes(this._hierarchy).reverse(),
            links = this._tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(d => d.y = d.depth * 140);

        // Update the nodes.
        let node = this._g.selectAll('g.node')
            .data(nodes, d => d.Id);

        this.ComputeCoordinatesOfHidden(
            this._hierarchy,
            false);

        // Enter any new nodes at the parent's previous position.
        let nodeEnter = node.enter().append('g')
            .classed('node', true)
            .attr('transform', d => 'translate(' + d.y0 + ',' + d.x0 + ') scale(1e-6)');

        let group = nodeEnter.append('g');

        group.append('circle')
            .attr('r', 10);

        let parent = group.filter(d => d.Children.length);

        parent.classed('parent', true)
            .on('click', d =>
            {
                d.collapsed = !d.collapsed;
                this.Update();
            });

        parent.append('line')
            .attr('x1', '-5')
            .attr('y1', '0')
            .attr('x2', '5')
            .attr('y2', '0');

        parent.append('line')
            .attr('x1', '0')
            .attr('y1', '-5')
            .attr('x2', '0')
            .attr('y2', '+5')
            .attr('class', 'vertical');

        nodeEnter.filter(d => this._selector.Configuration.Selectable(d))
            .append('a')
            .append('text')
            .attr('y', 20)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .style('fill-opacity', 1e-6)
            .text(name)
            .on('click', d =>
            {
                this._callback(d);
                this._selector.Close();
            });

        nodeEnter.filter(d => !this._selector.Configuration.Selectable(d))
            .append('text')
            .attr('y', 20)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .style(
            {
                'fill-opacity': 1e-6,
                cursor: 'default'
            })
            .text(name);

        node.classed('expanded', d => !d.collapsed);

        // Transition nodes to their new position.
        let gElement = <SVGGElement>this._g[0][0];
        this._svg.transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attrTween(
            'height',
            () => () => gElement.getBBox().height + margin.top + margin.bottom)
            .attrTween(
            'width',
            () => () => gElement.getBBox().width + margin.left + margin.right);

        this._g.transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attrTween(
            'transform',
            () => () =>
            {
                let bbox = gElement.getBBox();
                return 'translate(' + (margin.left - bbox.x) + ',' + (margin.top - bbox.y) + ')';
            });

        // Transition nodes to their new positions.
        let nodeUpdate = node.transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ') scale(1)');

        nodeUpdate.select('text')
            .style('fill-opacity', 1);

        // Transitlon exiting nodes to their new positions.
        let nodeExit = node.exit().transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ') scale(1e-6)')
            .remove();

        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // Update the links.
        let link = this._g.selectAll('path.link')
            .data(links, d => d.target.Id);

        // Enter any new links.
        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr(
            'd',
            d => diagonal(
                {
                    source:
                    {
                        x: d.source.x0,
                        y: d.source.y0
                    },
                    target:
                    {
                        x: d.target.x0,
                        y: d.target.y0
                    }
                }));

        // Transition links to their new position.
        link.transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('d', diagonal);

        // Transition exiting nodes to their new positions.
        link.exit().transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('d', diagonal)
            .remove();

        // Stash the old positions for transition.
        Visit(
            this._hierarchy,
            (node: any) =>
            {
                node.x0 = node.x;
                node.y0 = node.y;
            });
    }

    private ComputeCoordinatesOfHidden(
        node  : any,
        hidden: boolean
        )
    {
        if(node.Parent && (hidden || node.hide))
        {
            node.x = node.Parent.x;
            node.y = node.Parent.y;
        }

        for(let child of node.Children)
            this.ComputeCoordinatesOfHidden(
                child,
                hidden || node.hide || node.collapsed);
    }
}

@NgModule(
    {
        imports:
        [
            CommonModule,
            DialogModule
        ],
        declarations:
        [
            OrganisationalUnitSelectorV2,
            OrganisationalUnitContainerV2
        ],
        exports:
        [
            OrganisationalUnitSelectorV2
        ]
    })
export class OrganisationalUnitSelectorModuleV2
{ }
