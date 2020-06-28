import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Class, ClassificationScheme, ClassificationSchemeClass } from '../ClassificationScheme';
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
    private _classificationSchemeClasses: Observable<ClassificationSchemeClass[]>;
    private _class                      : Class;

    constructor(
        @Inject(ClassificationSchemeServiceToken)
        classificationSchemeService: IDomainObjectService<Guid, ClassificationScheme>
        )
    {
        this._classificationSchemeClasses = classificationSchemeService
            .Get('f7c20b62-ffe8-4c20-86b4-e5c68ba2469d')
            .pipe(map(classificationScheme => classificationScheme.Classes.filter(
                classificationSchemeClass => classificationSchemeClass.Super == null)));
    }

    get ClassificationSchemeClasses(): Observable<ClassificationSchemeClass[]>
    {
        return this._classificationSchemeClasses;
    }

    get Class(): Class
    {
        return this._class;
    }

    set Class(
        selectedClass: Class
        )
    {
    }
}
