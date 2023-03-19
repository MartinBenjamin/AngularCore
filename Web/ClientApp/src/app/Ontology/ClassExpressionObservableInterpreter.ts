import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { ClassExpressionInterpreter, IEavStore } from "./ClassExpressionInterpreter";
import { IClass } from "./IClass";
import { IOntology } from "./IOntology";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpression } from './IPropertyExpression';
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { WrapperType } from './Wrapped';

type ObservableParams<P> = { [Parameter in keyof P]: Observable<P[Parameter]>; };

export class ClassExpressionObservableInterpreter extends ClassExpressionInterpreter<WrapperType.Observable>
{
    constructor(
        ontology: IOntology,
        store: IEavStore
        )
    {
        super(
            <TIn extends any[], TOut>(
                map: (...params: TIn) => TOut,
                ...params: ObservableParams<TIn>
                ): Observable<TOut> => !params.length ? new BehaviorSubject(map(...<TIn>[])) : combineLatest(
                    params,
                    map),
            new PropertyExpressionObservableGenerator(store),
            ontology,
            store,
            new Map<IClass, Observable<Set<any>>>());
    }

    protected WrapObjectDomain(): Observable<Set<any>>
    {
        return this._store.ObserveEntities();
    }
}

export class PropertyExpressionObservableGenerator implements IPropertyExpressionSelector<Observable<[any, any][]>>
{
    private _propertyExpressionInterpretation = new Map<IPropertyExpression, Observable<[any, any][]>>();

    constructor(
        private _store: IEavStore
        )
    {
    }   

    Property(
        property: IProperty
        ): Observable<[any, any][]>
    {
        let interpretation = this._propertyExpressionInterpretation.get(property);

        if(!interpretation)
        {
            interpretation = this._store.Observe(property.LocalName);
            this._propertyExpressionInterpretation.set(
                property,
                interpretation);
        }

        return interpretation;
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Observable<[any, any][]>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Observable<[any, any][]>
    {
        return this.Property(dataProperty);
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Observable<[any, any][]>
    {
        throw new Error("Method not implemented.");
    }
}
