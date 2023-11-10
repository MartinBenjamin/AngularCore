import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { Wrap, Wrapped, WrapperType } from "./Wrapped";

export interface ICache<T extends WrapperType>
{
    set(
        property: IProperty,
        wrapped: Wrapped<T, [any, any][]>): void;
    get(property: IProperty): Wrapped<T, [any, any][]>
}

export abstract class PropertyExpressionInterpreter<T extends WrapperType> implements IPropertyExpressionSelector<Wrapped<T, [any, any][]>>
{
    protected abstract Wrap: Wrap<T>;

    constructor(
        private _wrap                            : Wrap<T>,
        private _propertyExpressionInterpretation: ICache<T>
        )
    {

    }

    abstract Property(property: IProperty): Wrapped<T, [any, any][]>

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Wrapped<T, [any, any][]>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Wrapped<T, [any, any][]>
    {
        return this.Property(dataProperty);
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Wrapped<T, [any, any][]>
    {
        return this._wrap(
            objectProperty => objectProperty.map(([domain, range]) => [range, domain]),
            this.ObjectProperty(inverseObjectProperty.ObjectProperty.Select(this)));
    }
}
