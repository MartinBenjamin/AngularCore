import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgModule, OnInit, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { DialogModule } from './Dialog';
import { OrganisationalUnit } from './OrganisationalUnit';
import { OrganisationalUnitSelectorConfiguration } from './OrganisationalUnitSelector';

declare var d3: any;

type Callback<T> = (t: T) => void;

var margin = { top: 20, right: 20, bottom: 20, left: 20 };

function name(
    d
    ): string
{
    return d.data.Acronym;
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

    private _hierarchy : OrganisationalUnit;
    private _callback  : Callback<OrganisationalUnit>;
    private _svg       : any;
    private _g         : any;
    private _treeLayout: any;
    private _root      : any;
    private _nodeIndex = 0;

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
                map(() => <string>this._nameFragmentInput.nativeElement.value),
                map((nameFragment: string) => nameFragment.toLowerCase()),
                distinctUntilChanged(),
                debounceTime(750),
                filter(nameFragment => nameFragment != null))
                .subscribe(nameFragment =>
                {
                    if(!this._root)
                        return;

                    if(nameFragment == '')
                        this._root.visitOriginal(
                            node =>
                            {
                                node.hide      = false;
                                node.collapsed = this._selector.Configuration.Collapsed(node.data);
                            });

                    else
                        this._root.visitOriginal(
                            node =>
                            {
                                node.hide      = true;
                                node.collapsed = false;

                                if(name(node).toLowerCase().indexOf(nameFragment) != -1)
                                {
                                    node.hide = false;

                                    var parent = node.parent;
                                    while(parent)
                                    {
                                        parent.hide = false;
                                        parent = parent.parent;
                                    }
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
        this._treeLayout = d3.tree().nodeSize([40, 40]);

        const input = <HTMLInputElement>this._nameFragmentInput.nativeElement;
        input.value = '';

        const div = <HTMLDivElement>this._div.nativeElement;
        while(div.childNodes.length)
            div.removeChild(div.firstChild);

        this._svg = d3.select(div).append('svg');
        this._g = this._svg.append('g')
            .attr('transform', `translate(${ margin.left }, ${ margin.top })`);

        this._root = d3.hierarchy(this._hierarchy, d => d.Children);

        if(typeof this._root.__proto__.visit == 'undefined')
        {
            this._root.__proto__.visit = function(
                enter,
                exit = null
                )
            {
                if(enter)
                    enter(this);

                if(this.children)
                    this.children.forEach(
                        child => child.visit(
                            enter,
                            exit));

                if(exit)
                    exit(this);
            };

            this._root.__proto__.visitOriginal = function(
                enter,
                exit = null
                )
            {
                if(enter)
                    enter(this);

                if(this.originalChildren)
                    this.originalChildren.forEach(
                        child => child.visitOriginal(
                            enter,
                            exit));

                if(exit)
                    exit(this);
            };
        }

        this._root.visit(
            node =>
            {
                node.x = 0;
                node.y = 0;

                if(node.children)
                {
                    node.children.sort(
                        (x, y) =>
                        {
                            if(name(x) < name(y))
                                return -1;
                            if(name(x) > name(y))
                                return 1;
                            return 0;
                        });

                    node.originalChildren = [].concat(node.children);
                    node.collapsed = this._selector.Configuration.Collapsed(node.data);
                }
            });

        this.Update();
    }

    private Update(): void
    {
        this._root.visitOriginal(
            node =>
            {
                node.x0 = node.x;
                node.y0 = node.y;
            });

        this.Rebuild();

        // Compute the new tree layout.
        this._treeLayout(this._root);

        this._root.visit(node => node.y = node.depth * 140)

        this.ComputeCoordinatesOfHidden(
            this._root,
            false);

        const nodes = [];

        this._root.visit(
            null,
            node => nodes.push(node));

        const links = [];

        this._root.visit(
            node =>
            {
                if(node.parent)
                    links.push(
                        {
                            source: node.parent,
                            target: node
                        });
            });

        // Update the nodes.
        const node = this._g.selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++this._nodeIndex));

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .classed('node', true)
            .attr('transform', d => `translate(${ d.y0 }, ${ d.x0 }) scale(1e-6)`);

        const group = nodeEnter.append('g');

        group.append('circle')
            .attr('r', 10);

        const parent = group.filter(d => d.originalChildren);

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

        nodeEnter.filter(d => this._selector.Configuration.Selectable(d.data))
            .append('a')
            .append('text')
            .attr('y', 20)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .style('fill-opacity', 1e-6)
            .text(name)
            .on('click', d =>
            {
                this._callback(d.data);
                this._selector.Close();
            });

        nodeEnter.filter(d => !this._selector.Configuration.Selectable(d.data))
            .append('text')
            .attr('y', 20)
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .style('fill-opacity', 1e-6)
            .style('cursor', 'default')
            .style('fill', '#999')
            .text(name);

        // Transition nodes to their new position.
        const gElement = <SVGGElement>this._g.node();
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
                return `translate(${ margin.left - bbox.x }, ${ margin.top - bbox.y })`;
            });

        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('transform', d => `translate(${ d.y }, ${ d.x }) scale(1)`);

        nodeUpdate.classed('expanded', d => d.children);

        nodeUpdate.select('text')
            .style('fill-opacity', 1);

        // Transitlon exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('transform', d => 'translate(' + d.y + ',' + d.x + ') scale(1e-6)')
            .remove();

        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // Update the links.
        const link = this._g.selectAll('path.link')
            .data(links, d => d.target.Id);

        // Enter any new links.
        const linkEnter = link.enter().insert('path', 'g')
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

        const linkUpdate = linkEnter.merge(link);

        // Transition links to their new position.
        linkUpdate.transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('d', diagonal);

        // Transition exiting nodes to their new positions.
        link.exit().transition()
            .duration(OrganisationalUnitContainerV2._duration)
            .attr('d', diagonal)
            .remove();
    }

    private Rebuild(): void
    {
        this._root.visitOriginal(
            node =>
            {
                if(node.originalChildren)
                {
                    node.children = null;

                    if(!node.collapsed)
                    {
                        const visible = node.originalChildren.filter(child => !child.hide);
                        node.children = visible.length ? visible : null;
                    }
                }
            });
    }

    private ComputeCoordinatesOfHidden(
        node  : any,
        hidden: boolean
        )
    {
        if(node.parent && (hidden || node.hide))
        {
            node.x = node.parent.x;
            node.y = node.parent.y;
        }

        if(node.originalChildren)
            node.originalChildren.forEach(
                child => this.ComputeCoordinatesOfHidden(
                    child,
                    hidden || node.hide || node.collapsed));
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
