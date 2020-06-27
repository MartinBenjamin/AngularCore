import { Component, Inject } from '@angular/core';
import { ClassificationScheme, ClassificationSchemeClass } from '../ClassificationScheme';
import { ClassificationSchemeServiceToken } from '../ClassificationSchemeServiceProvider';
import { Guid } from '../CommonDomainObjects';
import { IDomainObjectService } from '../IDomainObjectService';

@Component(
    {
        selector: '[exclusivity]',
        templateUrl: './Exclusivity.html'
    })
export class Exclusivity
{
    private _classes: ClassificationSchemeClass[];

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>
        )
    {
        classificationSchemeService.Get('f7c20b62-ffe8-4c20-86b4-e5c68ba2469d').subscribe(
            classificationScheme =>
                this._classes = classificationScheme.Classes.filter(
                    classificationSchemeClass => classificationSchemeClass.Super == null));
    }

    get Classes(): ClassificationSchemeClass[]
    {
        return this._classes;
    }
}
