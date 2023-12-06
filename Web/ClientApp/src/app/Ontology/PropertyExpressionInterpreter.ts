import { AtomInterpreter } from "./AtomInterpreter";
import { ICache } from "./ClassExpressionInterpreter";
import { IOntology } from "./IOntology";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { Wrap, Wrapped, WrapperType } from "./Wrapped";

export abstract class PropertyExpressionInterpreter<T extends WrapperType> implements IPropertyExpressionSelector<Wrapped<T, readonly [any, any][]>>
{
    AtomInterpreter: AtomInterpreter<T>;

    constructor(
        private _wrap                  : Wrap<T>,
        private _ontology              : IOntology,
        private _propertyInterpretation: ICache<T>
        )
    {
    }

    abstract Input(property: IProperty): Wrapped<T, [any, any][]>

    private Property(
        property: IProperty
        ): Wrapped<T, readonly [any, any][]>
    {
        let interpretation = this._propertyInterpretation.get(property);

        if(!interpretation)
        {
            interpretation = this.Input(property);
            this._propertyInterpretation.set(
                property,
                interpretation);
        }

        return interpretation;
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Wrapped<T, readonly [any, any][]>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Wrapped<T, readonly [any, any][]>
    {
        return this.Property(dataProperty);
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Wrapped<T, readonly [any, any][]>
    {
        return this._wrap(
            objectProperty => objectProperty.map(([domain, range]) => [range, domain]),
            inverseObjectProperty.ObjectProperty.Select(this));
    }
}
