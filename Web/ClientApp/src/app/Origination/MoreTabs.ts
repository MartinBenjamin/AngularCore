import { Component } from '@angular/core';
import { Tab } from '../Gallery/TabbedView';
import { OriginationTab } from './OriginationTab';

@Component(
    {
        selector: 'MoreTabs',
        templateUrl: './MoreTabs.html'
    })
export class MoreTabs
{
    public XTabs =
    [
        new Tab('Conditions &<br/>Instructions', OriginationTab),
        new Tab('Coventants'                   , OriginationTab),
        new Tab('Refiance<br/>History'         , OriginationTab)
    ];
}
